from flask import Blueprint, request, jsonify
from service.firebase import realtime_db, firestore_db  # Add firestore_db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity  # Add JWT imports

friends_bp = Blueprint("friends", __name__)

def validate_usernames(sender_username, receiver_username):
    """Validate username inputs"""
    if not sender_username or not receiver_username:
        return False, "Both sender and receiver usernames are required"
    if len(sender_username) > 50 or len(receiver_username) > 50:
        return False, "Usernames must be less than 50 characters"
    if sender_username == receiver_username:
        return False, "Cannot send request to yourself"
    return True, ""

@friends_bp.route("/friends_request", methods=["POST"])
@jwt_required()  # Add authentication
def send_friend_request():
    try:
        user_id = get_jwt_identity()
        user_ref = firestore_db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        sender_username = user_doc.to_dict().get("username")

        data = request.get_json()
        receiver_username = data.get("receiver_username")

        is_valid, error_msg = validate_usernames(sender_username, receiver_username)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        friends_ref = realtime_db.reference(f"friends/{sender_username}/{receiver_username}")
        if friends_ref.get():
            return jsonify({"error": "You are already friends"}), 400

        request_ref = realtime_db.reference(f"friend_requests/{receiver_username}/{sender_username}")
        if request_ref.get():
            return jsonify({"error": "Friend request already sent"}), 400

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
        user_id = get_jwt_identity()
        user_ref = firestore_db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        receiver_username = user_doc.to_dict().get("username")

        data = request.get_json()
        sender_username = data.get("sender_username")

        is_valid, error_msg = validate_usernames(sender_username, receiver_username)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        request_ref = realtime_db.reference(f"friend_requests/{receiver_username}/{sender_username}")
        request_data = request_ref.get()
        
        if not request_data:
            return jsonify({"error": "No friend request found"}), 404

        updates = {
            f"friends/{receiver_username}/{sender_username}": {
                "status": "accepted",
                "timestamp": datetime.utcnow().isoformat()
            },
            f"friends/{sender_username}/{receiver_username}": {
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
        user_id = get_jwt_identity()
        user_ref = firestore_db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        receiver_username = user_doc.to_dict().get("username")

        data = request.get_json()
        sender_username = data.get("sender_username")

        is_valid, error_msg = validate_usernames(sender_username, receiver_username)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        request_ref = realtime_db.reference(f"friend_requests/{receiver_username}/{sender_username}")
        if not request_ref.get():
            return jsonify({"error": "No friend request found"}), 404

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
        username = user_doc.to_dict().get("username")

        # Fetch pending requests from Realtime Database
        requests_ref = realtime_db.reference(f"friend_requests/{username}")
        requests_data = requests_ref.get() or {}

        pending_requests = []
        for sender_username, request_info in requests_data.items():
            if request_info.get("status") == "pending":
                # Fetch sender's display_name and profilePic from Firestore
                sender_ref = firestore_db.collection("users").document(sender_username)
                sender_doc = sender_ref.get()
                if sender_doc.exists:
                    sender_data = sender_doc.to_dict()
                    display_name = sender_data.get("display_name", sender_username)
                    profile_pic = sender_data.get("profilePic", "")
                else:
                    display_name = sender_username
                    profile_pic = ""

                pending_requests.append({
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