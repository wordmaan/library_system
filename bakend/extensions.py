from flask_mail import Mail
from flask_session import Session

# Create extension objects (NO app here)
mail = Mail()
session_ext = Session()
