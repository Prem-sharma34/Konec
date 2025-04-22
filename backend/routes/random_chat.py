from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from service.firebase import firestore_db
from datetime import datetime

random_chat_bp = Blueprint("random_chat", __name__)

@random_chat_bp.route("/log", methods=["POST"])
@jwt_required()
def log_random_chat():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        other_user_id = data.get("other_user_id")
        other_username = data.get("other_username")
        other_display_name = data.get("other_display_name")
        other_profile_pic = data.get("other_profile_pic")
        ended_at = data.get("ended_at") or datetime.utcnow().isoformat()

        if not other_user_id or not other_username:
            return jsonify({"error": "Missing required user information."}), 400

        history_ref = firestore_db.collection("random_chat_history").document(user_id)
        history_doc = history_ref.collection("sessions").document()
        history_doc.set({
            "other_user_id": other_user_id,
            "other_username": other_username,
            "other_display_name": other_display_name,
            "other_profile_pic": other_profile_pic,
            "ended_at": ended_at
        })

        return jsonify({"message": "Chat session logged successfully."}), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@random_chat_bp.route("/history", methods=["GET"])
@jwt_required()
def get_random_chat_history():
    try:
        user_id = get_jwt_identity()
        sessions_ref = firestore_db.collection("random_chat_history").document(user_id).collection("sessions")
        
        # Correct the order_by usage
        sessions = sessions_ref.order_by("ended_at", direction="DESCENDING").stream()

        history = []
        for session in sessions:
            session_data = session.to_dict()
            history.append(session_data)

        return jsonify(history), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500



@random_chat_bp.route("/profile/public/<user_id>", methods=["GET"])
@jwt_required()
def get_public_profile(user_id):
    try:
        user_ref = firestore_db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        public_info = {
            "username": user_data.get("username"),
            "display_name": user_data.get("display_name"),
            "profilePic": user_data.get("profilePic"),
            "whoami": user_data.get("whoami")
        }

        return jsonify(public_info), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
