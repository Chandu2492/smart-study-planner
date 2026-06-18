import os
import re
import bcrypt
import mysql.connector
from mysql.connector import pooling
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig,
    MessageType
)
from jose import jwt

SECRET_KEY = "studyplannersecret"

# -------------------
# APP SETUP
# -------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# -------------------
# DATABASE CONNECTION POOL
# -------------------
db_pool = pooling.MySQLConnectionPool(
    pool_name="studyplanner_pool",
    pool_size=5,
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT", 3306))
)

# Initialize tables safely using a temporary connection
def init_db():
    conn = db_pool.get_connection()
    cursor = conn.cursor()
    try:
        # Create users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255)
        )
        """)
        
        # Create subjects table (needed for save-subjects & load-subjects)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(255),
            subject VARCHAR(255)
        )
        """)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

init_db()

# Helper function to execute queries safely and manage connections
def execute_query(query, params=None, fetch_all=False, commit=False):
    conn = db_pool.get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params or ())
        if commit:
            conn.commit()
        if fetch_all:
            return cursor.fetchall()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


# -------------------
# EMAIL CONFIG
# -------------------
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),  # Must be your 16-character Google App Password
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,                              # Port 587 is standard and more reliable
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,                         # Set to True for Port 587
    MAIL_SSL_TLS=False,                         # Set to False for Port 587
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fm = FastMail(conf)


# -------------------
# MODELS
# -------------------
class User(BaseModel):
    email: str
    password: str


class ForgotPassword(BaseModel):
    email: str


class SubjectData(BaseModel):
    email: str
    subjects: list


# -------------------
# PASSWORD VALIDATION
# -------------------
def valid_password(password):
    return (
        len(password) >= 8
        and re.search(r"[A-Z]", password)
        and re.search(r"[0-9]", password)
        and re.search(r"[!@#$%^&*]", password)
    )


# -------------------
# REGISTER
# -------------------
@app.post("/register")
def register(user: User):
    if not user.email.endswith("@gmail.com"):
        return {"message": "Use Valid Gmail"}

    if not valid_password(user.password):
        return {"message": "Password needs Capital Number Symbol"}

    existing = execute_query("SELECT * FROM users WHERE email=%s", (user.email,))
    if existing:
        return {"message": "Email Exists"}

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())

    execute_query(
        "INSERT INTO users (email, password) VALUES (%s, %s)",
        (user.email, hashed.decode()),
        commit=True
    )
    return {"message": "Registered"}


# -------------------
# LOGIN
# -------------------
@app.post("/login")
def login(user: User):
    data = execute_query("SELECT password FROM users WHERE email=%s", (user.email,))
    if not data:
        return {"message": "Wrong Email or Password"}

    ok = bcrypt.checkpw(user.password.encode(), data[0].encode())
    if ok:
        return {"message": "Login Success"}

    return {"message": "Wrong Email or Password"}


# -------------------
# SAVE SUBJECTS
# -------------------
@app.post("/save-subjects")
def save_subjects(data: SubjectData):
    conn = db_pool.get_connection()
    cursor = conn.cursor()
    try:
        for subject in data.subjects:
            cursor.execute(
                "INSERT INTO subjects (user_email, subject) VALUES (%s, %s)",
                (data.email, str(subject))
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return {"message": f"Save Failed: {str(e)}"}
    finally:
        cursor.close()
        conn.close()

    return {"message": "Saved"}


# -------------------
# LOAD SUBJECTS
# -------------------
@app.get("/planner/{email}")
def planner(email: str):
    results = execute_query(
        "SELECT subject FROM subjects WHERE user_email=%s",
        (email,),
        fetch_all=True
    )
    return results


# -------------------
# FORGOT PASSWORD
# -------------------
@app.post("/forgot-password")
async def forgot_password(user: ForgotPassword):
    try:
        exists = execute_query("SELECT email FROM users WHERE email=%s", (user.email,))
        if not exists:
            return {"message": "Email Not Registered"}

        token = jwt.encode(
            {"email": user.email},
            SECRET_KEY,
            algorithm="HS256"
        )

        link = f"https://smart-study-planner-backend-x95q.onrender.com/reset/{token}"

        message = MessageSchema(
            subject="Reset Password",
            recipients=[user.email],
            body=f"Reset your password:\n\n{link}",
            subtype=MessageType.plain
        )

        await fm.send_message(message)
        return {"message": "Reset Link Sent"}

    except Exception as e:
        print("MAIL ERROR:", str(e))
        return {"message": f"Server Error: {str(e)}"}


# -------------------
# RESET PASSWORD
# -------------------
@app.post("/reset-password")
def reset_password(data: User):
    try:
        # Here, data.email is actually acting as the JWT token
        decoded = jwt.decode(
            data.email,
            SECRET_KEY,
            algorithms=["HS256"]
        )
        email = decoded["email"]

        hashed = bcrypt.hashpw(
            data.password.encode(),
            bcrypt.gensalt()
        ).decode()

        execute_query(
            "UPDATE users SET password=%s WHERE email=%s",
            (hashed, email),
            commit=True
        )
        return {"message": "Password Updated"}

    except Exception as e:
        print("RESET ERROR:", str(e))
        return {"message": "Reset Failed"}