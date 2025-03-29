from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify

def verify_token():
    """
    Verify JWT token using flask_jwt_extended and return user identity.
    """
    try:
        verify_jwt_in_request()  # Validate the JWT token
        user_id = get_jwt_identity()  # Extract the user identity from the token
        
        print("🔍 Extracted User ID from JWT:", user_id)  # Debugging line
        
        return user_id if user_id else None  # Return None if invalid
    except Exception as e:
        print("Token Verification Failed:", str(e))  # Debugging line
        return None  # Return None instead of JSON response
