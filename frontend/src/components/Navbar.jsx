import "./Navbar.css"
import { useNavigate } from "react-router-dom"

function Navbar() {

const navigate = useNavigate()

function logout(){

// remove only login session

localStorage.removeItem(
"user"
)

// keep planner history

navigate("/login")

}

return(

<div className="navbar">

<h1
className="logo"
onClick={()=>
navigate("/dashboard")
}
>

🎓 Smart Planner

</h1>


<div className="navBtns">

<button
className="profileBtn"
onClick={()=>
navigate("/profile")
}
>

👤 Profile

</button>


<button
className="logoutBtn"
onClick={logout}
>

🚪 Logout

</button>

</div>

</div>

)

}

export default Navbar