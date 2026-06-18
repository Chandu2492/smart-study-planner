import { useState } from "react"
import { useParams } from "react-router-dom"

function ResetPassword() {

const { token } = useParams()

const [password, setPassword] =
useState("")

const [loading, setLoading] =
useState(false)

async function reset() {

if (!password) {

alert(
"Enter new password"
)

return

}

try {

setLoading(true)

const res =
await fetch(

"http://127.0.0.1:8000/reset-password",

{
method: "POST",

headers: {
"Content-Type":
"application/json"
},

body: JSON.stringify({

email: token,

password: password

})

}

)

const data =
await res.json()

setLoading(false)

if (
res.ok &&
data.message ===
"Password Updated"
) {

alert(
"Password Updated Successfully"
)

window.location.href =
"/"

}

else {

alert(
data.message ||
"Password update failed"
)

}

}

catch (err) {

console.log(err)

setLoading(false)

alert(
"Server Error"
)

}

}

return (

<div
style={{

display: "flex",
justifyContent: "center",
alignItems: "center",
height: "100vh",
background:
"#eef2ff"

}}
>

<div
style={{

background: "white",

padding: "40px",

width: "420px",

borderRadius: "20px",

boxShadow:
"0 10px 30px rgba(0,0,0,.15)",

textAlign: "center"

}}
>

<h1>

🔑 Reset Password

</h1>

<input

type="password"

placeholder=
"Enter New Password"

value={password}

onChange={(e)=>

setPassword(
e.target.value
)

}

style={{

width: "100%",

padding: "14px",

marginTop: "25px",

borderRadius: "10px",

border:
"1px solid #ddd"

}}

/>

<br />
<br />

<button

onClick={reset}

disabled={loading}

style={{

width: "100%",

padding: "14px",

background:
"#4f46e5",

color:
"white",

border:
"none",

borderRadius:
"10px",

cursor:
"pointer"

}}

>

{

loading

?

"Updating..."

:

"Finish"

}

</button>

</div>

</div>

)

}

export default ResetPassword