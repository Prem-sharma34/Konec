from flask import Flask, jsonify, request
from flask_cors import CORS 
from routes.auth import auth_bp
from routes.users import users_bp
from routes.realtime import realtime_bp
from routes.chat import chat_bp
from routes.friends import friends_bp
from routes.friend_requests import friend_requests_bp  
from extension import mail

import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

app = Flask(__name__)

# ✅ Configure Flask-Mail for Gmail SMTP
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("EMAIL_USER")  # Gmail Address
app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PASS")  # App Password

mail.init_app(app)


CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}) 

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(chat_bp,url_prefix= "/api/chat")
app.register_blueprint(friends_bp,url_prefix="/api/friends")
app.register_blueprint(friend_requests_bp, url_prefix="/api/friend-requests")




if __name__ == '__main__':
    app.run(debug=True)