from passlib.context import CryptContext

# Fix: Use pbkdf2_sha256 to avoid the bcrypt 72-byte limit bug in Python 3.13 / passlib
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
