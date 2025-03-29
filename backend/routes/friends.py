from flask import Blueprint, request, jsonify
from service.firebase import realtime_db
from datetime import datetime

friends_bp = Blueprint("friends", __name__)

def validate_usernames(sender_username, receiver_username):
    """Validate username inputs"""
    if not sender_username or not receiver_username:
        return False, "Both sender and receiver usernames are required"
    if len(sender_username) > 50 or len(receiver_username) > 50:  # Arbitrary max length
        return False, "Usernames must be less than 50 characters"
    if sender_username == receiver_username:
        return False, "Cannot send request to yourself"
    return True, ""

@friends_bp.route("/friends_request", methods=["POST"])
def send_friend_request():
    try:
        data = request.get_json()
        sender_username = data.get("sender_username")
        receiver_username = data.get("receiver_username")

        # Validate inputs
        is_valid, error_msg = validate_usernames(sender_username, receiver_username)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        # Check existing friendship
        friends_ref = realtime_db.reference(f"friends/{sender_username}/{receiver_username}")
        if friends_ref.get():
            return jsonify({"error": "You are already friends"}), 400

        # Check existing request
        request_ref = realtime_db.reference(f"friend_requests/{receiver_username}/{sender_username}")
        if request_ref.get():
            return jsonify({"error": "Friend request already sent"}), 400

        # Store request with timestamp
        request_ref.set({
            "status": "pending",
            "timestamp": datetime.utcnow().isoformat()
        })

        return jsonify({"message": "Friend request sent successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@friends_bp.route("/accept_request", methods=["POST"])
def accept_friend_request():
    try:
        data = request.get_json()
        sender_username = data.get("sender_username")
        receiver_username = data.get("receiver_username")

        # Validate inputs
        is_valid, error_msg = validate_usernames(sender_username, receiver_username)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        # Check and process request
        request_ref = realtime_db.reference(f"friend_requests/{receiver_username}/{sender_username}")
        request_data = request_ref.get()
        
        if not request_data:
            return jsonify({"error": "No friend request found"}), 404

        # Atomic transaction for friend addition
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
        
        # Update database and clean up request
        realtime_db.reference("/").update(updates)
        request_ref.delete()

        return jsonify({"message": "Friend request accepted"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@friends_bp.route("/reject_request", methods=["POST"])
def reject_friend_request():
    try:
        data = request.get_json()
        sender_username = data.get("sender_username")
        receiver_username = data.get("receiver_username")

        # Validate inputs
        is_valid, error_msg = validate_usernames(sender_username, receiver_username)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        # Check and remove request
        request_ref = realtime_db.reference(f"friend_requests/{receiver_username}/{sender_username}")
        if not request_ref.get():
            return jsonify({"error": "No friend request found"}), 404

        request_ref.delete()
        return jsonify({"message": "Friend request rejected"}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500