from flask import Blueprint, jsonify, request
from service.firebase import realtime_db as db
import datetime


friends_bp = Blueprint("friends", __name__)



@friends_bp.route("/request", methods=["POST"])
def send_friend_request():
    data = request.get_json()
  

    sender_email = data.get("sender") 
    receiver_email = data.get("receiver") 

    if not sender_email or not receiver_email:
        
        return jsonify({"error": "Both sender and receiver emails are required"}), 400

    try:
        sender_email = sender_email.replace(".", "_") 
        receiver_email = receiver_email.replace(".", "_")

      
        db.child("friendRequests").child(receiver_email).child(sender_email).set("pending")

        
        return jsonify({"message": "Friend request sent successfully!"}), 200

    except Exception as e:
        
        return jsonify({"error": str(e)}), 500

@friends_bp.route("/accept", methods=["POST"])
def accept_friend_request():
    data = request.get_json()
    user_email = data.get("user")  
    sender_email = data.get("sender") 

    if not user_email or not sender_email:
        return jsonify({"error": "Both user and sender emails are required"}), 400

    try:
        user_key = user_email.replace(".", "_")  
        sender_key = sender_email.replace(".", "_")

      
        db.child("friends").child(user_key).child("friends").child(sender_key).set(True)
        db.child("friends").child(sender_key).child("friends").child(user_key).set(True)

       
        db.child("friendRequests").child(user_key).child(sender_key).delete()

        return jsonify({"message": "Friend request accepted!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@friends_bp.route("/reject", methods=["POST"])
def reject_friend_request():
    data = request.get_json()
    user_email = data.get("user") 
    sender_email = data.get("sender")  

    if not user_email or not sender_email:
        return jsonify({"error": "Both user and sender emails are required"}), 400

    try:
        user_key = user_email.replace(".", "_") 
        sender_key = sender_email.replace(".", "_")

        # ✅ Remove the pending request
        db.child("friendRequests").child(user_key).child(sender_key).delete()

        return jsonify({"message": "Friend request rejected!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500





@friends_bp.route("/list", methods=["GET"])
def get_friends_list():
    user_email = request.args.get("user")  
    if not user_email:
        return jsonify({"error": "User email is required"}), 400

    try:
        user_key = user_email.replace(".", "_") 
        friends_ref = db.child("friends").child(user_key).child("friends").get()

        if not friends_ref:
            return jsonify({"friends": []}), 200 

        friends_list = []

        for friend_email in friends_ref.keys():
            friend_key = friend_email.replace(".", "_")  
            friend_data = db.child("users").child(friend_key).get()  

            if friend_data is not None and isinstance(friend_data, dict):
                display_name = friend_data.get("display_name", friend_email)  
            else:
                display_name = friend_email  

            friends_list.append({"email": friend_email, "display_name": display_name})

        return jsonify({"friends": friends_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



