import "./Signup.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Signup() {

const navigate = useNavigate()

const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [loading, setLoading] = useState(false)

async function signup(e){

if(e) e.preventDefault()

if(!email.trim() || !password.trim()){

alert("Fill all fields")
return

}

try{

setLoading(true)

const res =
await fetch(
"https://smart-study-planner-backend-x95q.onrender.com/register",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email.trim(),
password
})

}
)

const data =
await res.json()

setLoading(false)

alert(data.message)

if(data.message==="Registered"){

setEmail("")
setPassword("")

localStorage.removeItem("email")
localStorage.removeItem("password")

navigate("/")

}

}
catch{

setLoading(false)

alert("Backend Error")

}

}

return(

<div className="signup">

<div className="card">

<h1>
✨ Create Account
</h1>

<p>
Join Smart Study Planner
</p>

<form
onSubmit={signup}
autoComplete="off"
>

<input
className="input"
type="email"
name="signup_email"
placeholder="Enter Gmail"
autoComplete="off"
value={email}
onChange={(e)=>
setEmail(
e.target.value
)
}
/>

<input
className="input"
type="password"
name="signup_password"
placeholder="Enter Password"
autoComplete="new-password"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)
}
/>

<button
type="submit"
className="signupBtn"
disabled={loading}
>

{
loading
?
"Creating..."
:
"Sign Up"
}

</button>

</form>

<button
className="loginBtn"
onClick={()=>
navigate("/")
}
>

Already Have Account?

</button>

</div>

</div>

)

}

export default Signup