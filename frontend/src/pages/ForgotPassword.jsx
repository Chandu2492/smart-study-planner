import "./ForgotPassword.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function ForgotPassword(){

const navigate=useNavigate()

const [email,setEmail]=useState("")
const [loading,setLoading]=useState(false)

async function sendLink(){

if(!email){

alert("Enter Gmail")
return

}

try{

setLoading(true)

const res=

await fetch(

"http://127.0.0.1:8000/forgot-password",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email

})

}

)

const data=
await res.json()

setLoading(false)

alert(
data.message
)

}

catch{

setLoading(false)

alert(
"Server Error"
)

}

}

return(

<div className="forgot">

<div className="card">

<h1>

🔑 Forgot Password

</h1>

<p>

Enter your Gmail

</p>

<input

className="input"

type="email"

placeholder="Enter Gmail"

value={email}

onChange={(e)=>

setEmail(
e.target.value
)

}

/>

<button

className="send"

onClick={sendLink}

>

{

loading

?

"Sending..."

:

"Send Link"

}

</button>

<button

className="back"

onClick={()=>
navigate("/")
}

>

Back To Login

</button>

</div>

</div>

)

}

export default ForgotPassword