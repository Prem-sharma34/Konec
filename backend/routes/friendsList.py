from flask import Blueprint, jsonify, request
from service.firebase import realtime_db, firestore_db
from flask_jwt_extended import jwt_required, get_jwt_identity

friends_list_bp = Blueprint("friends_list", __name__)

@friends_list_bp.route("/friends_list", methods=["GET"])
@jwt_required()
def get_friends_list():
    try:
        # Get user ID from JWT token
        current_user_id = get_jwt_identity()
        
        # Fetch the friends from Firebase Realtime Database
        friends_ref = realtime_db.reference(f"friends/{current_user_id}")
        friends_data = friends_ref.get() or {}
        
        friends_list = []

        # Extract actual friend IDs from nested structure
        for friend_id, friend_info in friends_data.items():
            if friend_info.get("status") == "accepted":  # Only show accepted friends
                user_doc = firestore_db.collection("users").document(friend_id).get()
                
                # Prepare friend data even if Firestore document doesn't exist
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    username = user_data.get("username", "")
                    display_name = user_data.get("display_name", username)
                    profile_pic = user_data.get("profilePic", "")
                else:
                    username = ""
                    display_name = "Unknown User"
                    profile_pic = ""

                friends_list.append({
                    "user_id": friend_id,
                    "username": username,
                    "display_name": display_name,
                    "profile_pic": profile_pic
                })

        return jsonify({
            "message": "Friends list retrieved successfully",
            "friends": friends_list
        }), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500