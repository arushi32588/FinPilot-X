from shared.utils.encryption import encrypt_text, decrypt_text

sample_text = "Ordered pizza from Domino's"

print("Original:", sample_text)

encrypted = encrypt_text(sample_text)
print("Encrypted:", encrypted)

decrypted = decrypt_text(encrypted)
print("Decrypted:", decrypted)
