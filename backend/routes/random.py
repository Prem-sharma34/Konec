from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

random_bp = Blueprint('random', __name__)

@random_bp.route('/status', methods=['GET'])
@jwt_required()
def get_status():
    current_user_id = get_jwt_identity()
    return jsonify({"status": "ok", "message": "Random chat service is active"}), 200