from flask import Blueprint, jsonify, request
from service.firebase import firestore_db


users_bp = Blueprint("users", __name__)



@users_bp.route("/search", methods=["GET"])
def search_users():
    query = request.args.get("name") 
    if not query:
        return jsonify({"error": "Missing search query"}), 400

    users_ref = firestore_db.collection("users")  
    all_users = users_ref.stream()  
    
    matching_users = []
    for user in all_users:
        user_data = user.to_dict()  
        if "display_name" in user_data and query.lower() in user_data["display_name"].lower():
            matching_users.append(user_data)  

    return jsonify(matching_users), 200 

