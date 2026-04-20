##db.py
import pymysql
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'library_db',  # CHANGE THIS
    'cursorclass': pymysql.cursors.DictCursor,
    'connect_timeout': 10
}
def get_db_connection():
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None
    
def insert_query():
    return """
                INSERT INTO users (name, email, password) VALUES (%s,%s,%s)
            """
def insert_admin_query():
    return """
                INSERT INTO users (name, email, password,role) VALUES (%s,%s,%s,%s)
            """
def login_query():
    return """
                SELECT * FROM users WHERE email = %s 
            """
def login_admin_query():
    return """
                SELECT * FROM users WHERE email = %s  and role =%s
            """
def books_get():
    return"""
            SELECT * FROM books;

            """

def  books_set():
    return"""
                INSERT INTO books (title, author, category, total_copies, available_copies,image) VALUES (%s, %s, %s, %s, %s,%s)
        """
def books_count():
    return"""
                SELECT * FROM books WHERE title=%s AND author=%s

            """
def books_update():
    return"""   
            UPDATE books SET total_copies = %s, available_copies = %s WHERE title = %s
        """

def books_edit():
    return""" UPDATE books
            SET title=%s, total_copies=%s, available_copies=%s, image=%s
            WHERE id=%s
        """
def books_by_id():
    return """SELECT id, title, author, category, total_copies,available_copies, image, is_active
        FROM books
        WHERE id=%s
        """

def issue_id():
    return"""
            SELECT * FROM issued_books 
            WHERE user_id=%s AND book_id=%s AND return_date IS NULL
        """
def decrease_book_available():
    return"""
    UPDATE books SET available_copies = available_copies - 1 WHERE id = %s AND available_copies > 0
    """
def insert_issue():
    return"""
            INSERT INTO issued_books (user_id, book_id, issue_date)VALUES (%s, %s, NOW())

    """

def update_issue_fine():
    return"""
                UPDATE issued_books SET return_date=NOW(), fine=%s WHERE id=%s
            """
def increase_book_available():
    return"""
                UPDATE books SET available_copies = available_copies + 1 WHERE id=%s

        """

def issue_and_books():
    return """
        SELECT 
            b.id,
            b.title,
            i.issue_date,
            i.return_date,
            i.fine
        FROM issued_books AS i
        JOIN books AS b ON b.id = i.book_id
        WHERE i.user_id = %s
        ORDER BY i.issue_date DESC
    """
def admin_issues():
    return """
    SELECT 
        i.id,
        u.name,
        u.email,
        b.title ,
        i.issue_date,
        i.return_date,
        i.fine,
        CASE 
            WHEN i.return_date IS NULL THEN 'issued'
            ELSE 'returned'
        END AS status
    FROM issued_books i
    JOIN users u ON i.user_id = u.id
    JOIN books b ON i.book_id = b.id
    ORDER BY i.issue_date DESC
    """
def issue_check():
    return """
        SELECT id FROM issued_books WHERE book_id = %s AND return_date IS NULL
    """