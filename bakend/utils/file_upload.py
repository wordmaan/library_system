import os
from flask import send_from_directory, current_app

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "books")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def serve_book_image(filename):
    """
    Return the book image from the uploads folder.
    Can be used in a route.
    """
    return send_from_directory(UPLOAD_FOLDER, filename)
