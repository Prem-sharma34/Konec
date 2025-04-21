from flask import Flask, jsonify, request
from flask_cors import CORS 
from routes.auth import auth_bp
from extension import mail
from routes.profile import profile_bp
from routes.find_user import find_user_bp
from routes.friends import friends_bp
from routes.friendsList import friends_list_bp
from routes.one_chat import one_chat_bp
from routes.random import random_bp
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
from socket_handler import init_socket

# Load environment variables
load_dotenv()

app = Flask(__name__)


app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("EMAIL_USER")  # Gmail Address
app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PASS")  # App Password

mail.init_app(app)


SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable not set")

app.config["JWT_SECRET_KEY"] = SECRET_KEY
app.config["JWT_TOKEN_LOCATION"] = ["headers"]  # Ensures token is read from headers
app.config["JWT_IDENTITY_CLAIM"] = "uid"


jwt = JWTManager(app)


CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
 

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(profile_bp, url_prefix="/profile")
app.register_blueprint(find_user_bp, url_prefix="/find_user")
app.register_blueprint(friends_bp, url_prefix="/friends")
app.register_blueprint(friends_list_bp, url_prefix="/friends_list")
app.register_blueprint(one_chat_bp, url_prefix="/chat")
app.register_blueprint(random_bp, url_prefix="/random")

# Initialize Socket.IO for random chat/call
socketio = init_socket(app)

if __name__ == '__main__':
    # Use socketio.run instead of app.run to enable WebSocket support
    socketio.run(app, debug=True, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)