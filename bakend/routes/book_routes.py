from flask import Blueprint, request, session, jsonify, current_app
import os
from werkzeug.utils import secure_filename
from utils.file_upload import allowed_file
from db import (
    get_db_connection,
    books_get,
    books_set,
    books_count,
    books_update,
    books_edit,
    books_by_id,
    issue_check,
)

book_bp = Blueprint("books", __name__)

# ---------------- GET ALL BOOKS ----------------
@book_bp.route("/api/books", methods=["GET"])
def get_books():
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "DB connection failed"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute(books_get())
        books = cursor.fetchall()

        return jsonify({"status": "success", "total-books": len(books), "books": books})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ---------------- ADD BOOK ----------------
@book_bp.route("/api/books", methods=["POST"])
def set_books():
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500

    try:
        title = request.form.get("title")
        author = request.form.get("author")
        category = request.form.get("category")
        total_copies = int(request.form.get("total_copies", 1))
        available_copies = int(request.form.get("available_copies", total_copies))
        file = request.files.get("image")

        image_path = None
        if file and allowed_file(file.filename):
            upload_folder = current_app.config["UPLOAD_FOLDER"]
            os.makedirs(upload_folder, exist_ok=True)
            filename = secure_filename(file.filename)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            image_path = f"uploads/books/{filename}"

        # Auth
        if "user_id" not in session:
            return jsonify({"status": "error", "message": "Login required"}), 401
        if session.get("role") != "admin":
            return jsonify({"status": "error", "message": "Admin only"}), 403

        # Validation
        if not title or not author or not category:
            return jsonify({"status": "error", "message": "title, author, category required"}), 400
        if total_copies < 1 or available_copies < 0:
            return jsonify({"status": "error", "message": "Invalid copy count"}), 400

        cursor = conn.cursor()
        cursor.execute(books_count(), (title, author))
        existing = cursor.fetchone()

        if existing:
            final_total = existing["total_copies"] + total_copies
            final_available = existing["available_copies"] + available_copies

            if final_available > final_total:
                return jsonify({"status": "error", "message": "available_copies cannot exceed total_copies"}), 400

            cursor.execute(books_update(), (final_total, final_available, title))
            conn.commit()
            return jsonify({"status": "success", "message": "Existing book updated", "title": title})
        else:
            cursor.execute(
                books_set(), (title, author, category, total_copies, available_copies, image_path)
            )
            conn.commit()
            return jsonify({"status": "success", "message": "Data inserted successfully!", "id": cursor.lastrowid})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ---------------- UPDATE BOOK ----------------

@book_bp.route("/api/books/<int:book_id>", methods=["PUT"])
def update_book(book_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "DB connection failed"}), 500

    try:
        if "user_id" not in session:
            return jsonify({"status": "error", "message": "Login required"}), 401

        if session.get("role") != "admin":
            return jsonify({"status": "error", "message": "Admin only"}), 403

        # ✅ READ FROM FORM DATA
        title = request.form.get("title")
        total_copies = request.form.get("total_copies", type=int)
        available_copies = request.form.get("available_copies", type=int)
        file = request.files.get("image")

        cursor = conn.cursor()
        cursor.execute(books_by_id(), (book_id,))
        existing = cursor.fetchone()

        if not existing:
            return jsonify({"status": "error", "message": "Book not found"}), 404

        final_title = title if title else existing["title"]
        final_total = total_copies if total_copies is not None else existing["total_copies"]
        final_available = (
            available_copies
            if available_copies is not None
            else existing["available_copies"]
        )

        if final_total < 1:
            return jsonify({"status": "error", "message": "Invalid total_copies"}), 400

        if final_available < 0 or final_available > final_total:
            return jsonify({"status": "error", "message": "Invalid available_copies"}), 400

        image_path = existing["image"]

        # ✅ HANDLE IMAGE UPDATE
        if file and allowed_file(file.filename):
            upload_folder = current_app.config["UPLOAD_FOLDER"]
            os.makedirs(upload_folder, exist_ok=True)

            filename = secure_filename(file.filename)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)

            image_path = f"uploads/books/{filename}"

        # ✅ UPDATE QUERY (ADD image)
        cursor.execute(
            """
            UPDATE books
            SET title=%s, total_copies=%s, available_copies=%s, image=%s
            WHERE id=%s
            """,
            (final_title, final_total, final_available, image_path, book_id),
        )

        conn.commit()
        return jsonify({"status": "success", "message": "Book updated successfully"})

    except Exception as e:
        conn.rollback()
        print("UPDATE BOOK ERROR:", e)  # 👈 DEBUG
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        conn.close()

# ---------------- DELETE BOOK ----------------
@book_bp.route("/api/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "DB connection Failed"}), 500

    try:
        if "user_id" not in session:
            return jsonify({"status": "error", "message": "Login required"}), 401
        if session.get("role") != "admin":
            return jsonify({"status": "error", "message": "Admin only"}), 403

        cursor = conn.cursor()
        cursor.execute(books_by_id(), (book_id,))
        book = cursor.fetchone()
        if not book:
            return jsonify({"message": "Book not found"}), 404

        cursor.execute(issue_check(), (book_id,))
        active_issue = cursor.fetchone()
        if active_issue:
            return jsonify({"status": "error", "message": "Cannot delete book. It is currently issued."}), 400

        cursor.execute("UPDATE books SET is_active = 0 WHERE id = %s", (book_id,))
        conn.commit()
        return jsonify({"status": "success", "message": f"Book '{book['title']}' deleted successfully"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ---------------- RESTORE BOOK ----------------
@book_bp.route("/api/books/restore/<int:book_id>", methods=["PUT"])
def restore_book(book_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "DB connection Failed"}), 500

    try:
        if "user_id" not in session:
            return jsonify({"status": "error", "message": "Login required"}), 401
        if session.get("role") != "admin":
            return jsonify({"status": "error", "message": "Admin only"}), 403

        cursor = conn.cursor()
        cursor.execute(books_by_id(), (book_id,))
        book = cursor.fetchone()
        if not book:
            return jsonify({"message": "Book not found"}), 404

        cursor.execute("UPDATE books SET is_active = 1 WHERE id = %s", (book_id,))
        conn.commit()
        return jsonify({"status": "success", "message": f"Book '{book['title']}' restored successfully"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ---------------- GET SINGLE BOOK ----------------
@book_bp.route("/api/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(books_by_id(), (book_id,))
    book = cursor.fetchone()
    conn.close()

    if not book:
        return jsonify({"message": "Book not found"}), 404

    return jsonify(book)



@book_bp.route("/api/categories", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM categories ORDER BY name ASC")
    categories = cursor.fetchall()

    conn.close()

    return jsonify(categories)

@book_bp.route("/api/books/category/<int:category_id>", methods=["GET"])
def get_books_by_category(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT b.*, c.name AS category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.category_id = %s AND b.is_active = 1
    """, (category_id,))

    books = cursor.fetchall()
    conn.close()

    return jsonify(books)