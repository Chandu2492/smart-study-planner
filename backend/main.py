from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig
)
SECRET_KEY="studyplannersecret"
from jose import jwt
import mysql.connector
import bcrypt
import re
import os


# -------------------
# APP
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
# DATABASE
# -------------------

import os
import mysql.connector

db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT"))
)

cursor = db.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
)
""")

db.commit()


# -------------------
# EMAIL CONFIG
# -------------------

conf = ConnectionConfig(

    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),

    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),

    MAIL_FROM=os.getenv("MAIL_FROM"),

    MAIL_PORT=587,

    MAIL_SERVER="smtp.gmail.com",

    MAIL_STARTTLS=True,

    MAIL_SSL_TLS=False,

    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


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

        and

        re.search(r"[A-Z]", password)

        and

        re.search(r"[0-9]", password)

        and

        re.search(r"[!@#$%^&*]", password)

    )


# -------------------
# REGISTER
# -------------------

@app.post("/register")
def register(user: User):

    if not user.email.endswith("@gmail.com"):

        return {
            "message":
            "Use Valid Gmail"
        }

    if not valid_password(user.password):

        return {
            "message":
            "Password needs Capital Number Symbol"
        }

    cursor.execute(
        "SELECT * FROM users WHERE email=%s",
        (user.email,)
    )

    existing = cursor.fetchone()

    if existing:

        return {
            "message":
            "Email Exists"
        }

    hashed = bcrypt.hashpw(
        user.password.encode(),
        bcrypt.gensalt()
    )

    cursor.execute(
        """
        INSERT INTO users
        (email,password)

        VALUES(%s,%s)
        """,
        (
            user.email,
            hashed.decode()
        )
    )

    db.commit()

    return {
        "message":
        "Registered"
    }


# -------------------
# LOGIN
# -------------------

@app.post("/login")
def login(user: User):

    cursor.execute(
        """
        SELECT password
        FROM users
        WHERE email=%s
        """,
        (user.email,)
    )

    data = cursor.fetchone()

    if not data:

        return {
            "message":
            "Wrong Email or Password"
        }

    ok = bcrypt.checkpw(
        user.password.encode(),
        data[0].encode()
    )

    if ok:

        return {
            "message":
            "Login Success"
        }

    return {
        "message":
        "Wrong Email or Password"
    }


# -------------------
# SAVE SUBJECTS
# -------------------

@app.post("/save-subjects")
def save_subjects(data: SubjectData):

    for subject in data.subjects:

        cursor.execute(
            """
            INSERT INTO subjects
            (user_email,subject)

            VALUES(%s,%s)
            """,
            (
                data.email,
                str(subject)
            )
        )

    db.commit()

    return {
        "message":
        "Saved"
    }


# -------------------
# LOAD SUBJECTS
# -------------------

@app.get("/planner/{email}")
def planner(email: str):

    cursor.execute(
        """
        SELECT subject
        FROM subjects
        WHERE user_email=%s
        """,
        (email,)
    )

    return cursor.fetchall()


# -------------------
# FORGOT PASSWORD
# -------------------

# -------------------
# FORGOT PASSWORD
# -------------------

@app.post("/forgot-password")

async def forgot_password(
user: ForgotPassword
):

    cursor.execute(
        """
        SELECT email
        FROM users
        WHERE email=%s
        """,

        (user.email,)
    )

    exists=cursor.fetchone()

    if not exists:

        return{
            "message":
            "Email Not Registered"
        }

    token=jwt.encode(

        {
            "email":
            user.email
        },

        SECRET_KEY,

        algorithm="HS256"

    )

    link=f"https://smart-study-planner-backend-x95q.onrender.com/reset/{token}"

    message=MessageSchema(

        subject=
        "Reset Your Password",

        recipients=[
            user.email
        ],

        body=f"""

Hello,

You requested password reset.

Open:

{link}

Enter your new password.

Smart Study Planner

""",

        subtype="plain"

    )

    fm=FastMail(conf)

    await fm.send_message(
        message
    )

    return{

        "message":
        "Reset Link Sent"

    }


# -------------------
# RESET PASSWORD
# -------------------

@app.post("/reset-password")

def reset_password(
data: User
):

    try:

        decoded=jwt.decode(

            data.email,

            SECRET_KEY,

            algorithms=["HS256"]

        )

        email=decoded["email"]

        hashed=bcrypt.hashpw(

            data.password.encode(),

            bcrypt.gensalt()

        ).decode()

        cursor.execute(

            """
            UPDATE users

            SET password=%s

            WHERE email=%s
            """,

            (
                hashed,
                email
            )

        )

        db.commit()

        return{

            "message":

            "Password Updated"

        }

    except Exception as e:

        print(e)

        return{

            "message":

            "Reset Failed"

        }