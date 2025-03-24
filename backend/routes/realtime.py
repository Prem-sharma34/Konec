from flask import Blueprint, request, jsonify
from service.firebase import realtime_db 
from service.realtime_db import create_user,get_user,update_user,delete_user


realtime_bp = Blueprint("realtime", __name__)


@realtime_bp.route("/add_user_realtime", methods=["POST"])
def add_user_realtime():
    try:
        data = request.json 
        if not data or "name" not in data:
            return jsonify({"success": False, "error": "Missing required fields"}), 400

       
        new_user_ref = realtime_db.child("users").push(data)

        return jsonify({"success": True, "message": "User added", "user_id": new_user_ref.key}), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@realtime_bp.route("/user/<user_id>", methods=["GET"])
def get_user_data(user_id):
    return jsonify(get_user(user_id))

@realtime_bp.route("/user/<user_id>", methods=["POST"])
def add_user(user_id):
    data = request.json
    return jsonify(create_user(user_id, data))

@realtime_bp.route("/user/<user_id>", methods=["PUT"])
def modify_user(user_id):
    data = request.json
    return jsonify(update_user(user_id, data))

@realtime_bp.route("/user/<user_id>", methods=["DELETE"])
def remove_user(user_id):
    return jsonify(delete_user(user_id))