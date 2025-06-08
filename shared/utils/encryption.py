from cryptography.fernet import Fernet
import os

# Load key from environment variable (better than hardcoding)
KEY = os.getenv("FINPILOT_ENC_KEY")

if not KEY:
    raise Exception("Encryption key not found! Set FINPILOT_ENC_KEY environment variable.")

cipher = Fernet(KEY.encode())

def encrypt_text(plain_text: str) -> str:
    """Encrypts a string and returns encrypted token"""
    if not plain_text:
        return ""
    token = cipher.encrypt(plain_text.encode())
    return token.decode()

def decrypt_text(token: str) -> str:
    """Decrypts token and returns original string"""
    if not token:
        return ""
    plain_text = cipher.decrypt(token.encode())
    return plain_text.decode()
