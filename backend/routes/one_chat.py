from flask import Flask, request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from service.firebase import realtime_db
import time

one_chat_bp = Blueprint("chat", __name__)

@one_chat_bp.route('/get_or_create_chat', methods=['POST'])
@jwt_required()
def get_or_create_chat():
    try:
        data = request.json
        user_id_1 = data.get("user_id_1")
        user_id_2 = data.get("user_id_2")

        if not user_id_1 or not user_id_2 or user_id_1 == user_id_2:
            return jsonify({"error": "Invalid user IDs"}), 400
        if not (len(user_id_1) == 28 and len(user_id_2) == 28 and user_id_1.isalnum() and user_id_2.isalnum()):
            return jsonify({"error": "Invalid UID format"}), 400

        current_user = get_jwt_identity()
        if current_user not in [user_id_1, user_id_2]:
            return jsonify({"error": "Unauthorized"}), 403

        chat_id = f"chat_{min(user_id_1, user_id_2)}_{max(user_id_1, user_id_2)}"
        chat_ref = realtime_db.reference(f"chats/{chat_id}")

        if chat_ref.get():
            return jsonify({"chat_id": chat_id}), 200

        chat_ref.set({
            "users": [user_id_1, user_id_2],
            "messages": {},
            "last_message": None
        })
        return jsonify({"chat_id": chat_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@one_chat_bp.route('/send_message', methods=['POST'])
@jwt_required()
def send_message():
    try:
        data = request.json
        chat_id = data.get("chat_id")
        sender = data.get("sender")
        message = data.get("message")

        if not chat_id or not sender or not message:
            return jsonify({"error": "Invalid data"}), 400
        if len(message) > 1000:
            return jsonify({"error": "Message too long (max 1000 characters)"}), 400

        current_user = get_jwt_identity()
        if current_user != sender:
            return jsonify({"error": "Unauthorized"}), 403

        chat_ref = realtime_db.reference(f"chats/{chat_id}")
        chat_data = chat_ref.get()
        if not chat_data or sender not in chat_data.get("users", []):
            return jsonify({"error": "Chat not found or unauthorized"}), 403

        messages_ref = chat_ref.child("messages")
        message_ref = messages_ref.push()
        timestamp = int(time.time() * 1000)
        message_ref.set({
            "sender": sender,
            "message": message,
            "timestamp": timestamp
        })
        message_id = message_ref.key

        chat_ref.child("last_message").set({
            "message": message,
            "sender": sender,
            "timestamp": timestamp,
            "message_id": message_id
        })

        return jsonify({"success": True, "message": "Message sent!", "message_id": message_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@one_chat_bp.route('/get_messages', methods=['GET'])
@jwt_required()
def get_messages():
    try:
        chat_id = request.args.get("chat_id")
        if not chat_id:
            return jsonify({"error": "Chat ID is required"}), 400

        chat_ref = realtime_db.reference(f"chats/{chat_id}")
        chat_data = chat_ref.get()
        if not chat_data:
            return jsonify({"error": "Chat not found"}), 404

        current_user = get_jwt_identity()
        if current_user not in chat_data.get("users", []):
            return jsonify({"error": "Unauthorized"}), 403

        messages_ref = chat_ref.child("messages").get()
        if not messages_ref:
            return jsonify({"messages": []})

        messages_list = [
            {
                "message_id": msg_id,
                "sender": msg_data["sender"],
                "message": msg_data["message"],
                "timestamp": msg_data["timestamp"]
            }
            for msg_id, msg_data in messages_ref.items()
        ]
        messages_list.sort(key=lambda x: x["timestamp"])

        return jsonify({"chat_id": chat_id, "messages": messages_list})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@one_chat_bp.route('/delete_message', methods=['DELETE'])
@jwt_required()
def delete_message():
    try:
        data = request.json
        chat_id = data.get("chat_id")
        message_id = data.get("message_id")

        if not chat_id or not message_id:
            return jsonify({"error": "Chat ID and Message ID are required"}), 400

        chat_ref = realtime_db.reference(f"chats/{chat_id}")
        chat_data = chat_ref.get()
        if not chat_data:
            return jsonify({"error": "Chat not found"}), 404

        current_user = get_jwt_identity()
        if current_user not in chat_data.get("users", []):
            return jsonify({"error": "Unauthorized"}), 403

        messages_ref = chat_ref.child("messages")
        message_data = messages_ref.child(message_id).get()
        if not message_data:
            return jsonify({"error": "Message not found"}), 404

        if message_data["sender"] != current_user:
            return jsonify({"error": "You can only delete your own messages"}), 403

        messages_ref.child(message_id).delete()

        last_message_ref = chat_ref.child("last_message")
        last_message = last_message_ref.get()
        if last_message and last_message.get("message_id") == message_id:
            all_messages = messages_ref.get()
            if all_messages:
                sorted_messages = sorted(all_messages.items(), key=lambda x: x[1]["timestamp"], reverse=True)
                new_last_message = sorted_messages[0][1]
                last_message_ref.set({
                    "message": new_last_message["message"],
                    "sender": new_last_message["sender"],
                    "timestamp": new_last_message["timestamp"],
                    "message_id": sorted_messages[0][0]
                })
            else:
                last_message_ref.delete()

        return jsonify({"success": True, "message": "Message deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500