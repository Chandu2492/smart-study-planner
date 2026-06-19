import "./Login.css"
import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Login(){

const navigate=
useNavigate()

const [email,setEmail]=
useState("")

const [password,setPassword]=
useState("")

const [loading,setLoading]=
useState(false)

useEffect(()=>{

setEmail("")
setPassword("")

},[])


async function login(){

if(
!email.trim()
||
!password.trim()
){

alert(
"Enter Email and Password"
)

return

}

try{

setLoading(true)

const res=
await fetch(

"https://smart-study-planner-backend-x95q.onrender.com/login",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email,
password

})

}

)

const data=
await res.json()

setLoading(false)

if(
data.message===
"Login Success"
){

localStorage.setItem(

"user",

JSON.stringify({

email

})

)

alert(
"Login Success"
)

navigate(
"/dashboard"
)

}

else{

alert(
data.message
)

}

}

catch{

setLoading(false)

alert(
"Server Error"
)

}

}



return(

<div className="loginPage">

<div className="loginCard">

<h1>

🔐 Login

</h1>

<input
type="email"
placeholder="Enter Email"
value={email}
onChange={(e)=>
setEmail(
e.target.value
)}
/>

<input
type="password"
placeholder="Enter Password"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)}
/>

<button
onClick={login}
>

{

loading

?

"Loading..."

:

"Login"

}

</button>

<p>

Don't have account?

<span
onClick={()=>
navigate("/signup")
}
>

 Create Account

</span>

</p>

<button
className="forgotBtn"
onClick={()=>
navigate("/forgot")
}
>

Forgot Password?

</button>

</div>

</div>

)

}

export default Login