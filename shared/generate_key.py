from cryptography.fernet import Fernet

key = Fernet.generate_key()
print(key.decode())  # Save this key securely somewhere safe!
