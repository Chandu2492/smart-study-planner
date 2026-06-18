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


useEffect(()=>{

setEmail("")
setPassword("")

},[])



function login(){

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

localStorage.setItem(

"user",

JSON.stringify({

email

})

)

navigate(
"/dashboard"
)

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
autoComplete="off"
value={email}
onChange={(e)=>
setEmail(
e.target.value
)}
/>


<input
type="password"
placeholder="Enter Password"
autoComplete="new-password"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)}
/>


<button
onClick={login}
>

Login

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