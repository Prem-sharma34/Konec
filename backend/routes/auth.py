import os
from flask import Blueprint, request, jsonify
from firebase_admin import auth, exceptions
from service.firebase import firestore_db
import jwt
from datetime import datetime, timedelta, UTC
from typing import Dict, Optional
import re
import random
import string
from dotenv import load_dotenv
from flask_mail import Message
from extension import mail

# Load environment variables from .env (for local dev)
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable not set")

auth_bp = Blueprint("auth", __name__)

def generate_unique_username(display_name: str) -> str:
    """Generate a unique username based on display name."""
    base_username = re.sub(r'[^a-z0-9_]', '', display_name.lower())[:15]
    user_ref = firestore_db.collection("users")
    username = base_username
    while user_ref.where("username", "==", username).limit(1).get():
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
        username = f"{base_username}_{suffix}"
    return username

def generate_token(uid: str, email: str) -> str:
    """Generate a JWT token for the user."""
    payload = {
        "uid": uid,
        "email": email,
        "exp": datetime.now(UTC) + timedelta(hours=2),
        "iat": datetime.now(UTC)
    }
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY not configured")
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@auth_bp.route("/signup", methods=["POST"])
def signup() -> tuple[Dict[str, str], int]:
    """Handle user signup with email, password, and display name."""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        display_name = data.get("display_name")

        if not all([email, password, display_name]):
            return jsonify({"error": "Missing required fields"}), 400
        
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"error": "Invalid email format"}), 400
        
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400

        username = generate_unique_username(display_name)
        user = auth.create_user(email=email, password=password, display_name=display_name)
        
        user_data = {
            "email": email,
            "display_name": display_name,
            "username": username,
            "profilePic": "",
            "whoami": "",
            "verified": False,
            "created_at": datetime.now(UTC).isoformat()
        }
        firestore_db.collection("users").document(user.uid).set(user_data)

        # Send verification email 
        print("Attempting to generate verification link for:", email)
        action_link = auth.generate_email_verification_link(email)
        # Add logic to send email via SMTP or Firebase service
        print("Verification Link:", action_link)

        send_verification_email(email, action_link)
        
        token = generate_token(user.uid, email)
        
        return jsonify({
            "message": "User created successfully. Verify your email.",
            "token": token,
            "uid": user.uid,
            "username": username
        }), 201

    except exceptions.FirebaseError as e:
        return jsonify({"error": f"Firebase error: {str(e)}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
    

def send_verification_email(email, action_link):
    """Send verification email using Gmail SMTP."""
    try:
        msg = Message(
            subject="Verify Your Email",
            sender=os.getenv("EMAIL_USER"),  # Use the new Gmail
            recipients=[email],
            body=f"Click the link to verify your email: {action_link}"
        )
        mail.send(msg)
        print(f"Verification email sent to {email}")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    """Check if the user's email is verified and update Firestore."""
    try:
        data = request.get_json()
        uid = data.get("uid")

        if not uid:
            return jsonify({"error": "Missing user UID"}), 400

        # Get user details from Firebase Auth
        user = auth.get_user(uid)

        if user.email_verified:
            firestore_db.collection("users").document(uid).update({"verified": True})
            return jsonify({"message": "Email verified successfully"}), 200
        else:
            return jsonify({"error": "Email not verified"}), 400

    except auth.UserNotFoundError:
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Handle user login and ensure email is verified before allowing access."""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

 
        try:
            user = auth.get_user_by_email(email)
        except exceptions.FirebaseError:
            return jsonify({"error": "Invalid email or password"}), 401

 
        if not user.email_verified:
            return jsonify({"error": "Email not verified. Please check your email and verify your account."}), 403

 
        user_ref = firestore_db.collection("users").document(user.uid).get()
        if not user_ref.exists:
            return jsonify({"error": "User data not found in Firestore"}), 404

        user_data = user_ref.to_dict()
        username = user_data.get("username", "Unknown")
        display_name = user_data.get("display_name", "Unknown")

      
        token = generate_token(user.uid, email)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "uid": user.uid,
            "email": email,
            "username": username,
            "display_name": display_name
        }), 201

    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Handle password reset by sending a reset email."""
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Missing email"}), 400

       
        reset_link = auth.generate_password_reset_link(email)

        
        send_reset_email(email, reset_link)

        return jsonify({"message": "Password reset email sent successfully."}), 200

    except exceptions.FirebaseError:
        return jsonify({"error": "Invalid email"}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


def send_reset_email(email, reset_link):
    """Send password reset email using Gmail SMTP."""
    try:
        msg = Message(
            subject="Reset Your Password",
            sender=os.getenv("EMAIL_USER"),
            recipients=[email],
            body=f"Click the link to reset your password: {reset_link}"
        )
        mail.send(msg)
        print(f"Password reset email sent to {email}")
    except Exception as e:
        print(f"Failed to send reset email: {str(e)}")



@auth_bp.route("/google-signup", methods=["POST"])
def google_signup():
    """Signup using Google OAuth and create a unique username."""
    try:
        data = request.get_json()
        id_token = data.get("idToken")

        if not id_token:
            return jsonify({"error": "Missing ID token"}), 400

      
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get("email")
        name = decoded_token.get("name")
        uid = decoded_token.get("uid")

        if not email or not name:
            return jsonify({"error": "Invalid Google data"}), 400

        # Check if user already exists
        user_ref = firestore_db.collection("users").where("email", "==", email).limit(1).get()
        if user_ref:
            return jsonify({"error": "User already exists, please login"}), 400

       
        username = generate_unique_username(name)

        # Store user in Firestore
        user_data = {
            "uid": uid,
            "email": email,
            "display_name": name,
            "username": username,
            "profilePic": "",
            "whoami": "",
            "verified": True,  # Google users are always verified
            "created_at": datetime.now(UTC).isoformat()
        }
        firestore_db.collection("users").document(uid).set(user_data)

       
        token = generate_token(uid, email)

        return jsonify({
            "message": "Google Signup successful",
            "token": token,
            "uid": uid,
            "username": username,
            "display_name": name
        }), 201

    except Exception as e:
        print(f"Google Login Error: {str(e)}")  
        return jsonify({"error": f"Google Signup failed: {str(e)}"}), 500



@auth_bp.route("/google-login", methods=["POST"])
def google_login():
    """Login using Google OAuth and return a JWT token."""
    try:
        data = request.get_json()
        id_token = data.get("idToken")

        if not id_token:
            return jsonify({"error": "Missing ID token"}), 400

        # Verify Google ID token
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get("email")
        uid = decoded_token.get("uid")

        if not email:
            return jsonify({"error": "Invalid Google token"}), 400

        # Check if user exists in Firestore
        user_ref = firestore_db.collection("users").document(uid).get()
        if not user_ref.exists:
            return jsonify({"error": "User does not exist. Please sign up first."}), 404

        user_data = user_ref.to_dict()
        username = user_data.get("username", "Unknown")
        display_name = user_data.get("display_name", "Unknown")

       
        token = generate_token(uid, email)

        return jsonify({
            "message": "Google Login successful",
            "token": token,
            "uid": uid,
            "username": username,
            "display_name": display_name
        }), 200

    except Exception as e:
        return jsonify({"error": f"Google Login failed: {str(e)}"}), 500
