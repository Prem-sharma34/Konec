from flask import Blueprint, request, jsonify
from service.firebase  import firestore_db

find_user_bp = Blueprint('find_user', __name__)


@find_user_bp.route('/find', methods=['GET'])
def find_user():
    try:
        search_query = request.args.get('search', '').strip().lower()

        if not search_query:
            return jsonify({"success": False, "message": "Search query is required"}), 400

        users_ref = firestore_db.collection("users")
        
        # Query by username
        username_query = users_ref.where("username", "==", search_query).get()
        
        # Query by display name
        display_name_query = users_ref.where("display_name", "==", search_query).get()
        
        # Combine results & remove duplicates
        users = {}
        for doc in username_query + display_name_query:
            user_data = doc.to_dict()
            user_id = doc.id  # Unique document ID
            if user_id not in users:
                users[user_id] = {
                    "id": user_id,  # Include the user ID in the response
                    "display_name": user_data.get("display_name", ""),
                    "username": user_data.get("username", ""),
                    "profilePic": user_data.get("profilePic", "")
                }

        return jsonify({"success": True, "users": list(users.values())}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500