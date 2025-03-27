from flask import Blueprint, request, jsonify
from service.firebase import firestore_db
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.jwt_verify import verify_token

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/get", methods=['GET'])
@jwt_required()
def get_user_profile():
    """Fetch the logged-in user's profile details"""
    user_id = get_jwt_identity()  # Get user ID from JWT token

    try:
        # Fetch user data from Firestore
        user_ref = firestore_db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()

        return jsonify({
            "display_name": user_data.get("display_name", ""),
            "username": user_data.get("username", ""),
            "email": user_data.get("email", ""),
            "profilePic": user_data.get("profilePic", ""),
            "whoami": user_data.get("whoami", "")
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@profile_bp.route("/update", methods=['PUT'])
@jwt_required()
def update_profile():
    """Update the logged-in user's profile details"""
    user_id = get_jwt_identity()  # Get user ID from JWT token
    data = request.get_json()

    # Allowed fields to update
    allowed_fields = ["display_name", "username", "profilePic", "whoami"]

    # Ensure at least one valid field is provided
    update_data = {key: value for key, value in data.items() if key in allowed_fields and value is not None}
    
    if not update_data:
        return jsonify({"error": "No valid fields provided for update"}), 400

    try:
        # Reference to user document in Firestore
        user_ref = firestore_db.collection('users').document(user_id)

        # Check if user exists
        if not user_ref.get().exists:
            return jsonify({"error": "User not found"}), 404

        # Update Firestore document
        user_ref.update(update_data)

        return jsonify({"msg": "Profile updated successfully", "updated_data": update_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500