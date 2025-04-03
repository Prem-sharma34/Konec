from flask import Blueprint, request, jsonify
from service.firebase import realtime_db, firestore_db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

friends_bp = Blueprint("friends", __name__)

def validate_user_ids(sender_id, receiver_id):
    """Validate user ID inputs"""
    if not sender_id or not receiver_id:
        return False, "Both sender and receiver IDs are required"
    if sender_id == receiver_id:
        return False, "Cannot send request to yourself"
    return True, ""

@friends_bp.route("/friends_request", methods=["POST"])
@jwt_required()
def send_friend_request():
    try:
        sender_id = get_jwt_identity()
        user_ref = firestore_db.collection("users").document(sender_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        receiver_id = data.get("receiver_id")

        is_valid, error_msg = validate_user_ids(sender_id, receiver_id)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        # Check if receiver exists
        receiver_ref = firestore_db.collection("users").document(receiver_id)
        receiver_doc = receiver_ref.get()
        if not receiver_doc.exists:
            return jsonify({"error": "Receiver not found"}), 404

        # Check if already friends
        friends_ref = realtime_db.reference(f"friends/{sender_id}/{receiver_id}")
        if friends_ref.get():
            return jsonify({"error": "You are already friends"}), 400

        # Check if request already sent
        request_ref = realtime_db.reference(f"friend_requests/{receiver_id}/{sender_id}")
        if request_ref.get():
            return jsonify({"error": "Friend request already sent"}), 400

        # Send friend request
        request_ref.set({
            "status": "pending",
            "timestamp": datetime.utcnow().isoformat()
        })

        return jsonify({"message": "Friend request sent successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@friends_bp.route("/accept_request", methods=["POST"])
@jwt_required()
def accept_friend_request():
    try:
        receiver_id = get_jwt_identity()  # This should be User A
        print(f"Receiver ID (JWT Identity): {receiver_id}")

        user_ref = firestore_db.collection("users").document(receiver_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        sender_id = data.get("sender_id")
        print(f"Sender ID (from request body): {sender_id}")

        request_ref = realtime_db.reference(f"friend_requests/{receiver_id}/{sender_id}")
        request_data = request_ref.get()
        print(f"Request Path: friend_requests/{receiver_id}/{sender_id}")
        print(f"Request Data from Firebase: {request_data}")

        if not request_data:
            return jsonify({"error": "No friend request found"}), 404

        # Proceed with accepting the request
        updates = {
            f"friends/{receiver_id}/{sender_id}": {
                "status": "accepted",
                "timestamp": datetime.utcnow().isoformat()
            },
            f"friends/{sender_id}/{receiver_id}": {
                "status": "accepted",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        realtime_db.reference("/").update(updates)
        request_ref.delete()

        return jsonify({"message": "Friend request accepted"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@friends_bp.route("/reject_request", methods=["POST"])
@jwt_required()
def reject_friend_request():
    try:
        receiver_id = get_jwt_identity()
        user_ref = firestore_db.collection("users").document(receiver_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        sender_id = data.get("sender_id")

        is_valid, error_msg = validate_user_ids(sender_id, receiver_id)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        # Check if request exists
        request_ref = realtime_db.reference(f"friend_requests/{receiver_id}/{sender_id}")
        if not request_ref.get():
            return jsonify({"error": "No friend request found"}), 404

        # Delete the request
        request_ref.delete()
        return jsonify({"message": "Friend request rejected"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    
    

@friends_bp.route("/pending_requests", methods=["GET"])
@jwt_required()
def get_pending_requests():
    """Fetch pending friend requests for the logged-in user"""
    try:
        user_id = get_jwt_identity()
        user_ref = firestore_db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        # Fetch pending requests from Realtime Database
        requests_ref = realtime_db.reference(f"friend_requests/{user_id}")
        requests_data = requests_ref.get() or {}

        pending_requests = []
        for sender_id, request_info in requests_data.items():
            if request_info.get("status") == "pending":
                # Fetch sender's display_name and profilePic from Firestore
                sender_ref = firestore_db.collection("users").document(sender_id)
                sender_doc = sender_ref.get()
                if sender_doc.exists:
                    sender_data = sender_doc.to_dict()
                    sender_username = sender_data.get("username", "")
                    display_name = sender_data.get("display_name", sender_username)
                    profile_pic = sender_data.get("profilePic", "")
                else:
                    sender_username = ""
                    display_name = "Unknown User"
                    profile_pic = ""

                pending_requests.append({
                    "sender_id": sender_id,
                    "sender_username": sender_username,
                    "display_name": display_name,
                    "profile_pic": profile_pic,
                })

        return jsonify({
            "message": "Pending requests retrieved successfully",
            "requests": pending_requests
        }), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500