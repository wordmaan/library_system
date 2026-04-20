from flask import Flask
from flask_cors import CORS
from extensions import mail, session_ext
from utils.file_upload import UPLOAD_FOLDER, serve_book_image

# -----------------------------
# 🔥 Create App
# -----------------------------
app = Flask(__name__)
app.secret_key = "your_secret_key_here"

# -----------------------------
# 📂 Upload Config
# -----------------------------
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# -----------------------------
# 📧 Mail Config
# -----------------------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'nmoho2205@gmail.com'
app.config['MAIL_PASSWORD'] = 'blbnofeypjwdwgnu'
app.config['MAIL_DEFAULT_SENDER'] = 'nmoho2205@gmail.com'

# -----------------------------
# 🔐 Session Config
# -----------------------------
app.config.update(
    SESSION_TYPE="filesystem",
    SESSION_PERMANENT=False,
    SESSION_USE_SIGNER=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)

# -----------------------------
# 🔗 Initialize Extensions
# -----------------------------
mail.init_app(app)
session_ext.init_app(app)

# -----------------------------
# 🌍 CORS
# -----------------------------
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# -----------------------------
# 📷 Serve uploaded images
# -----------------------------
@app.route("/uploads/books/<filename>")
def uploaded_file(filename):
    return serve_book_image(filename)

# -----------------------------
# 📦 Import Blueprints (AFTER init)
# -----------------------------
from routes.auth_routes import auth_bp
from routes.book_routes import book_bp
from routes.issue_routes import issue_bp

app.register_blueprint(auth_bp)
app.register_blueprint(book_bp)
app.register_blueprint(issue_bp)

# -----------------------------
# 🚀 Run
# -----------------------------
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
