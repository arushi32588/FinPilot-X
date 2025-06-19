from setuptools import setup, find_packages

setup(
    name="finpilot-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "pydantic",
        "scikit-learn",
        "pandas",
        "numpy",
        "firebase-admin",
        "cryptography"
    ],
) 