from flask import request,jsonify, Blueprint
from service.firebase import realtime_db as db
import time
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")

chat_bp = Blueprint("chat", __name__)





@chat_bp.route("/send_message", methods=["POST"])
def send_message():
    try:
        data = request.get_json()
        sender = data.get("sender")  
        receiver = data.get("receiver")  
        message_text = data.get("message")

        if not sender or not receiver or not message_text:
            return jsonify({"error": "Missing required fields"}), 400

        chat_id = "_".join(sorted([sender.replace(".", "_"), receiver.replace(".", "_")])) 

        # ✅ Ensure both users have access to this chat
        db.child("chat_access").child(chat_id).child(sender.replace(".", "_")).set(True)
        db.child("chat_access").child(chat_id).child(receiver.replace(".", "_")).set(True)

        message_data = {
            "text": message_text,
            "sender": sender,
            "timestamp": int(time.time() * 1000)
        }

        db.child("chats").child(chat_id).push(message_data)

        return jsonify({"message": "Message sent successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@chat_bp.route("/get_messages", methods=["GET"])
def get_messages():
    try:
        user1 = request.args.get("user1")  
        user2 = request.args.get("user2")  

        if not user1 or not user2:
            return jsonify({"error": "Both users are required"}), 400

        # ✅ Create chat ID in alphabetical order
        chat_id = "_".join(sorted([user1.replace(".", "_"), user2.replace(".", "_")]))

        # ✅ Retrieve messages from Firebase
        messages_ref = db.child("chats").child(chat_id).get()

        # ✅ Directly use the dictionary from get()
        messages = messages_ref if messages_ref else {}

        return jsonify(list(messages.values())), 200  

    except Exception as e:
        return jsonify({"error": str(e)}), 500





def message_listener(event):
    chat_id = event.path.split("/")[-2]
    new_messsage = event.data
    
    if new_messsage:
        socketio.emit(f"new_message_{chat_id}", new_messsage)
        

@chat_bp.route("/listen/<chat_id>" , methods=["GET"])
def listen_for_message(chat_id):
    db.child(f"message/{chat_id}").listen(message_listener)
    return jsonify({"message": f"Listening for message in chat{chat_id}"}), 200