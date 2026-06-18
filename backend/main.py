import os
import re
import bcrypt
import mysql.connector
from mysql.connector import pooling
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt
import httpx

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
# Prevents database disconnects and handles multiple connections safely
db_pool = pooling.MySQLConnectionPool(
    pool_name="studyplanner_pool",
    pool_size=5,
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT", 3306))
)

# Initialize tables safely
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

# Helper function to execute queries safely
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

        # Send email via Resend HTTP API (Port 443 - not blocked by Render)
        resend_api_key = os.getenv("RESEND_API_KEY")
        if not resend_api_key:
            return {"message": "Missing RESEND_API_KEY environment variable"}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "onboarding@resend.dev",  # Resend's free tier sandbox email
                    "to": user.email,
                    "subject": "Reset Password",
                    "html": f"""
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <p><a href="{link}" style="background-color: #8a2be2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                    <p>If you did not request this, please ignore this email.</p>
                    """
                }
            )
            
            # Raise exception if request failed
            response.raise_for_status()

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
        # data.email contains the token string passed from the frontend url
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