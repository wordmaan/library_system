from flask import Blueprint, request, session, jsonify
from db import get_db_connection,books_by_id ,issue_id ,decrease_book_available,insert_issue,increase_book_available,update_issue_fine,issue_and_books, admin_issues
from datetime import date

issue_bp = Blueprint('issue', __name__)

@issue_bp.route('/api/issue/<int:book_id>', methods=['POST'])
def issue_books(book_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed'
        }), 500

    try:

        if 'user_id' not in session:
            return jsonify({'status':'error','message':'login required'}), 401

        if session.get('role') != 'student':
            return jsonify({'status':'error','message':'student only'}), 403
        
        user_id = session['user_id']

        cursor = conn.cursor()
        cursor.execute(books_by_id(), (book_id,))
        book = cursor.fetchone()

        if not book:
            return jsonify({'status':'error','message':'Book not found'}), 404 

        if book['available_copies'] <= 0:
            return jsonify({'status': 'error', 'message': 'No copies available'}), 400
        
        cursor.execute(issue_id(), (user_id, book_id))
        if cursor.fetchone():
            return jsonify({'status': 'error', 'message': 'You already issued this book'}), 400
        
        cursor.execute(decrease_book_available(),(book_id,))
        cursor.execute(insert_issue(),(user_id,book_id))

        conn.commit()
        return jsonify({
            'status': 'success',
            'message': f"{book['title']} book is issued"
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        conn.close()

@issue_bp.route('/api/return/<int:book_id>', methods=['POST'])
def return_books(book_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed'
        }), 500

    try:

        if 'user_id' not in session:
            return jsonify({'status':'error','message':'login required'}), 401

        if session.get('role') != 'student':
            return jsonify({'status':'error','message':'student only'}), 403
        
        user_id = session['user_id']

        cursor = conn.cursor()
        
        cursor.execute( issue_id(),(user_id, book_id))
        issue = cursor.fetchone()

        if not  issue:
            return jsonify({'status':'error','message':'No active issue found'}), 400

        days = (date.today() - issue['issue_date']).days
        late_days = max(0, days - 7)
        fine = late_days * 5

        cursor.execute(update_issue_fine(),(fine, issue['id']))
        cursor.execute(increase_book_available(),( book_id,))
        cursor.execute(books_by_id(), (book_id,))
        book = cursor.fetchone()

        conn.commit()
        return jsonify({
        'status': 'success',
        'message': f"{book['title']} book is returned",
        "fine":fine
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        conn.close()


@issue_bp.route('/api/my-issues', methods=['GET'])
def user_issue_history():
    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed'
        }), 500

    try:

        if 'user_id' not in session:
            return jsonify({'status':'error','message':'login required'}), 401

        if session.get('role') != 'student':
            return jsonify({'status':'error','message':'student only'}), 403
        
        user_id = session.get('user_id')

        cursor = conn.cursor()
        
        cursor.execute( issue_and_books(),(user_id,))
        issue = cursor.fetchall()

        return jsonify({
        'status': 'success',
        'count':len(issue),
        'issues': issue
        })
    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        conn.close()

@issue_bp.route('/api/admin-issues', methods=['GET'])
def admin_issue_history():
    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed'
        }), 500

    try:
        if 'user_id' not in session:
            return jsonify({'status':'error','message':'login required'}), 401

        if session.get('role') != 'admin':
            return jsonify({'status':'error','message':'admin only'}), 403

        cursor = conn.cursor()
        cursor.execute(admin_issues())
        issues = cursor.fetchall()

        return jsonify({
            'status': 'success',
            'count': len(issues),
            'issues': issues
        })
    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        conn.close()


