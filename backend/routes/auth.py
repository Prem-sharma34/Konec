from flask import Blueprint, jsonify, request
from firebase_admin import auth
from service.firestore import add_user
from service.firebase import firestore_db
import jwt
import datetime


SECRET_KEY =  "asdfdf1213sladkjf"

auth_bp = Blueprint("auth", __name__)

def generate_token(uid, email):
    payload = {
        "uid": uid,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    print("Signing Token With SECRET_KEY:", SECRET_KEY) 
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")





def verify_token(func):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Missing token"}), 401

        token = token.replace("Bearer ", "").strip()
        print("Received Token:", token)  
        print("Verifying Token With SECRET_KEY:", SECRET_KEY)  

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"], options={"verify_signature": True})
            print("Decoded Token:", decoded) 
            request.user = decoded  
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            print("Token Decode Error:", str(e))  
            return jsonify({"error": "Invalid token"}), 401

        return func(*args, **kwargs)

    return wrapper






@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        display_name = data.get("display_name")

        if not email or not password or not display_name:
            return jsonify({"error": "Missing required fields"}), 400

        user = auth.create_user(email=email, password=password, display_name=display_name)

        user_data = {"email": email, "display_name": display_name}
        add_user(user.uid, user_data)
        
        token = generate_token(user.uid, email)  

        return jsonify({"message": "User created successfully", "token": token, "uid": user.uid}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Missing email or password"}), 400

      
        user = auth.get_user_by_email(email)
        token = generate_token(user.uid, email)
        
      
        user_ref = firestore_db.collection("users").document(user.uid).get()
        user_data = user_ref.to_dict() if user_ref.exists else {}

        display_name = user_data.get("display_name", "Unknown")  

        return jsonify({
            "message": "Login successful",
            "token": token,
            "email": email,
            "display_name": display_name  # ✅ Send display_name to frontend
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/google-login", methods=["POST"])
def google_login():
    try:
        id_token = request.json.get("idToken")
        if not id_token:
            return jsonify({"error": "Missing ID token"}), 400

        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get("uid")

        user = auth.get_user(uid)
        token = generate_token(uid, user.email)  

        print("Generated JWT Token:", token)  
        return jsonify({"message": "Google login successful", "token": token, "uid": uid, "email": user.email}), 200  # 🔥 Return token

    except Exception as e:
        print("Google Login Error:", str(e))  
        return jsonify({"error": str(e)}), 400



token_blacklist = set() 

@auth_bp.route("/logout", methods=["POST"])
@verify_token
def logout():
    token = request.headers.get("Authorization")
    token_blacklist.add(token)
    return jsonify({"message": "Logged out successfully"}), 200

def is_token_blacklisted(token):
    return token in token_blacklist