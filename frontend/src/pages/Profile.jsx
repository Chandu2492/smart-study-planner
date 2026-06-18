import "./Profile.css"
import Navbar from "../components/Navbar"
import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"

function Profile(){

const navigate=
useNavigate()

const [email,setEmail]=
useState("")

useEffect(()=>{

const raw=
localStorage.getItem("user")

if(!raw){

navigate("/login")
return

}

try{

const user=
JSON.parse(raw)

setEmail(
user.email
)

}

catch{

setEmail(raw)

}

},[])



return(

<>

<Navbar/>

<div className="profile">

<div className="profileCard">

<div className="avatar">

👤

</div>



<h1>

Profile

</h1>



<div className="email">

📧 {email}

</div>



<button
className="backBtn"
onClick={()=>
navigate("/dashboard")
}
>

← Dashboard

</button>

</div>

</div>

</>

)

}

export default Profile