import flask
from flask import Blueprint, jsonify, request  
from service.firebase import realtime_db as db  

friend_requests_bp = Blueprint("friend_requests", __name__)

@friend_requests_bp.route("/requests", methods=["GET"])
def get_friend_requests():
    user_email = flask.request.args.get("user")  

    if not user_email:
        return jsonify({"error": "User email is required"}), 400

    try:
        user_key = user_email.replace(".", "_")  
        friend_requests_ref = db.child("friendRequests").child(user_key).get()

        requests_list = []
        if friend_requests_ref is not None:  # 
            friend_requests_dict = friend_requests_ref  
            for sender_email in friend_requests_dict.keys():
                requests_list.append({"sender": sender_email})

        return jsonify(requests_list), 200  
    except Exception as e:
        return jsonify({"error": str(e)}), 500


