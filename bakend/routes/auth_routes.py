#auth_routes.py
from flask import Blueprint, request, session, jsonify
from db import get_db_connection,insert_query,login_query , login_admin_query ,insert_admin_query
from utils.auth import hash_password, check_password
from utils.otp import generate_otp, otp_expiry
from flask_mail import Message
from extensions import mail   

from datetime import datetime
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/register', methods=['POST'])
def register_user():
    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed'
        }), 500

    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        # name = "nadeem"
        # email = "nadeem@gmail.com"

        if not name or not email or not password:
            return jsonify({
                'status': 'error',
                'message': 'email and password  are required'
            }), 400

        cursor = conn.cursor()
        cursor.execute(login_query(),(email,))
        if cursor.fetchone():
            return jsonify({
                'status': 'error',
                'message': 'Email already exists'
            }), 409
        
        hashed_pw = hash_password(password)

        cursor.execute(insert_query(),(name, email, hashed_pw))
        
        conn.commit()

        return jsonify({
            'status': 'success',
            'message': 'Data inserted successfully!',
            'id': cursor.lastrowid
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        conn.close()

@auth_bp.route("/api/admin/add-user", methods=["POST"])
def add_user():
    if session.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    name = data.get("name")
    email = data.get("email").lower().strip()
    password = data.get("password")
    role = data.get("role", "student")

    if role not in ["student", "admin"]:
        return jsonify({"message": "Invalid role"}), 400

    hashed = hash_password(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO users (name, email, password, role)
        VALUES (%s, %s, %s, %s)
    """, (name, email, hashed, role))

    conn.commit()
    conn.close()

    return jsonify({"message": f"{role.capitalize()} created successfully"})


@auth_bp.route('/api/login', methods=['POST'])
def login_user():
    conn = get_db_connection()
    if not conn:
        return jsonify({
            'status': 'error',
            'message': 'Database connection failed'
        }), 500

    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        email = email.lower().strip()

        if not password or not email:
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        

        cursor = conn.cursor()
        cursor.execute(login_query(), (email,))
        user = cursor.fetchone()

        if not user :
            return jsonify({
                'status':'error',
                'message':'invalid email'
            }),401

        if  not check_password(password, user['password']):
            return jsonify({
                'status':'error',
                'message':'invalid password'
            }),401


        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_email'] = user['email']
        session['role'] = user.get('role','user')
    
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'id': user['id'],
            'role': user.get('role')
        })
    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        conn.close()


@auth_bp.route("/api/admin/users")
def get_all_users():
    if session.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role , is_super_admin FROM users")
    users = cursor.fetchall()

    return jsonify({"users": users})

@auth_bp.route("/api/admin/promote", methods=["PUT"])
def promote_user():
    if session.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    user_id = data.get("user_id")
    conn = get_db_connection()
    cursor = conn.cursor()

    if user_id == session.get("user_id"):
        return jsonify({"message": "Cannot change your own role"}), 400

    cursor.execute(
        "UPDATE users SET role='admin' WHERE id=%s",
        (user_id,)
    )
    conn.commit()

    return jsonify({"message": "User promoted to admin"})



@auth_bp.route("/api/admin/demote", methods=["PUT"])
def demote_admin():
    # 1️⃣ Must be logged in admin
    if "user_id" not in session:
        return jsonify({"message": "Login required"}), 401

    if session.get("role") != "admin":
        return jsonify({"message": "Admin only"}), 403

    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"message": "User ID required"}), 400

    current_admin_id = session["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id, role, is_super_admin FROM users WHERE id=%s",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # 2️⃣ ❌ Prevent self-demotion
        if user["id"] == current_admin_id:
            return jsonify({
                "message": "You cannot demote yourself"
            }), 403

        # 3️⃣ ❌ Prevent super admin demotion
        if user["is_super_admin"]:
            return jsonify({
                "message": "Super admin cannot be demoted"
            }), 403

        # 4️⃣ Must currently be admin
        if user["role"] != "admin":
            return jsonify({
                "message": "User is not an admin"
            }), 400

        # 5️⃣ Demote
        cursor.execute(
            "UPDATE users SET role='student' WHERE id=%s",
            (user_id,)
        )
        conn.commit()

        return jsonify({
            "message": "Admin demoted to student"
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 500

    finally:
        conn.close()



@auth_bp.route('/api/me', methods=['GET'])
def me_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'logged_in': False}), 401

    return jsonify({
        'status': 'success',
        'logged_in': True,
        'id': session.get('user_id'),
        'name': session.get('user_name'),
        'email': session.get('user_email'),
        'role': session.get('role')
    })


# LOGOUT
@auth_bp.route('/api/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({"status": "success", "message": "Logged out"})


@auth_bp.route("/api/users/request-update", methods=["POST"])
def request_update():

    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Login required'}), 401

    user_id = session['user_id']

    conn = get_db_connection()
    cursor = conn.cursor()

    otp = generate_otp()
    expiry = otp_expiry()

    cursor.execute("""
        INSERT INTO user_otps (user_id, otp, expires_at)
        VALUES (%s, %s, %s)
    """, (user_id, otp, expiry))

    conn.commit()

    cursor.execute("SELECT email FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()

    msg = Message(
        "OTP for Profile Update",
        recipients=[user['email']]
    )
    msg.body = f"Your OTP is: {otp}. It expires in 5 minutes."

    mail.send(msg)

    conn.close()

    return jsonify({
        "status": "success",
        "message": "OTP sent"
    })



@auth_bp.route("/api/users/verify-otp", methods=["POST"])
def verify_otp():

    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Login required'}), 401

    user_id = session['user_id']
    data = request.get_json()
    otp_input = data.get("otp")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM user_otps
        WHERE user_id=%s AND otp=%s AND is_used=FALSE
        ORDER BY created_at DESC LIMIT 1
    """, (user_id, otp_input))

    record = cursor.fetchone()

    if not record:
        return jsonify({'status': 'error', 'message': 'Invalid OTP'}), 400

    if record['expires_at'] < datetime.utcnow():
        return jsonify({'status': 'error', 'message': 'OTP expired'}), 400

    # mark OTP used
    cursor.execute("""
        UPDATE user_otps SET is_used=TRUE WHERE id=%s
    """, (record['id'],))

    conn.commit()
    conn.close()

    # 🔥 Allow update for next step
    session['otp_verified'] = True

    return jsonify({
        "status": "success",
        "message": "OTP verified successfully"
    })


@auth_bp.route("/api/users/update-profile", methods=["PUT"])
def update_profile():

    if 'user_id' not in session:
        return jsonify({'status': 'error', 'message': 'Login required'}), 401

    if not session.get('otp_verified'):
        return jsonify({
            'status': 'error',
            'message': 'OTP verification required'
        }), 403

    user_id = session['user_id']
    data = request.get_json()

    new_name = data.get("name")
    new_email = data.get("email")
    new_password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # Email uniqueness check
        if new_email and new_email != user['email']:
            cursor.execute("SELECT id FROM users WHERE email=%s", (new_email,))
            existing = cursor.fetchone()
            if existing:
                return jsonify({
                    'status': 'error',
                    'message': 'Email already in use'
                }), 400

        final_name = new_name if new_name else user['name']
        final_email = new_email if new_email else user['email']

        if new_password:
            final_password = hash_password(new_password)
        else:
            final_password = user['password']

        cursor.execute("""
            UPDATE users
            SET name=%s, email=%s, password=%s
            WHERE id=%s
        """, (final_name, final_email, final_password, user_id))

        conn.commit()

        session.pop('otp_verified', None)

        return jsonify({
            "status": "success",
            "message": "Profile updated successfully"
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        conn.close()
