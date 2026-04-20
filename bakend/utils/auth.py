import bcrypt

# Hash password (for signup)
def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    )
    return hashed.decode('utf-8')   # STORE THIS IN DB


# Verify password (for login)
def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        password.encode('utf-8'),
        hashed.encode('utf-8')
    )
