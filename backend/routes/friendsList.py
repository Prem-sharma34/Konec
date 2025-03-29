from flask import Blueprint, jsonify, request
from service.firebase import realtime_db, firestore_db

friends_list_bp = Blueprint("friends_list", __name__)

@friends_list_bp.route("/friends_list", methods=["GET"])
def get_friends_list():
    try:
        # Get username from query parameter
        current_username = request.args.get("username")
        if not current_username:
            return jsonify({"error": "Username is required"}), 400
        
        # Fetch the friends from Firebase Realtime Database
        friends_ref = realtime_db.reference(f"friends/{current_username}")
        friends_data = friends_ref.get() or {}
        print("Friends Data from Firebase:", friends_data)

        friends_list = []

        # Extract actual friend usernames from nested structure
        for friend_username, friend_info in friends_data.items():
            print("Checking Friend:", friend_username, "Data:", friend_info) 
            if friend_info.get("status") == "accepted":  # Only show accepted friends
                user_doc = firestore_db.collection("users").document(friend_username).get()
                print(f"Fetching Firestore data for {friend_username}: Exists = {user_doc.exists}")
                
                # Prepare friend data even if Firestore document doesn't exist
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    display_name = user_data.get("display_name", friend_username)
                    profile_pic = user_data.get("profilePic", "")
                else:
                    display_name = friend_username  # Fallback to username
                    profile_pic = ""  # Default profile picture

                friends_list.append({
                    "username": friend_username,
                    "display_name": display_name,
                    "profile_pic": profile_pic
                })

        return jsonify({
            "message": "Friends list retrieved successfully",
            "friends": friends_list
        }), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500