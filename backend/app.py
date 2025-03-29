from flask import Flask, jsonify, request
from flask_cors import CORS 
from routes.auth import auth_bp
from extension import mail
from routes.profile import profile_bp
from routes.find_user import find_user_bp
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# ✅ Load environment variables
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

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}) 

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(find_user_bp, url_prefix="/find_user")




if __name__ == '__main__':
    app.run(debug=True)