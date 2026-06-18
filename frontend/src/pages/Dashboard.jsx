import "./Dashboard.css"
import Navbar from "../components/Navbar"
import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"

function Dashboard(){

const navigate=useNavigate()

const user=
localStorage.getItem("user")
||
"guest"

const SUBJECT_KEY=
`plannerSubjects_${user}`

const PROGRESS_KEY=
`progress_${user}`

const STREAK_KEY=
`streak_${user}`


const [subjects,setSubjects]=useState([])
const [progress,setProgress]=useState(0)
const [streak,setStreak]=useState(0)
const [remaining,setRemaining]=useState(0)
const [completed,setCompleted]=useState(0)
const [todayTasks,setTodayTasks]=useState([])



useEffect(()=>{

load()

},[])



function load(){

const subs=

JSON.parse(

localStorage.getItem(
SUBJECT_KEY
)

||

"[]"

)

const done=

JSON.parse(

localStorage.getItem(
PROGRESS_KEY
)

||

"[]"

)

setSubjects(subs)

setCompleted(
done.length
)

setRemaining(

subs.length
-
done.length

)

setStreak(

Number(

localStorage.getItem(
STREAK_KEY
)

)

||

0

)

setProgress(

subs.length

?

Math.round(

(
done.length
/
subs.length
)

*
100

)

:

0

)


const pending=

subs.filter(

(sub,index)=>

!done.includes(index)

)

setTodayTasks(
pending
)

}



return(

<>

<Navbar/>

<div className="dashboard">

<h1>

📊 Dashboard

</h1>


<div className="cards">

<div className="card">

<h2>📚 Subjects</h2>

<h1>

{subjects.length}

</h1>

</div>



<div className="card">

<h2>🔥 Streak</h2>

<h1>

{streak}

</h1>

</div>



<div className="card">

<h2>✅ Completed</h2>

<h1>

{completed}

</h1>

</div>



<div className="card">

<h2>⌛ Remaining</h2>

<h1>

{remaining}

</h1>

</div>



<div className="card">

<h2>📈 Progress</h2>

<h1>

{progress}%

</h1>

</div>

</div>



<div className="todayBox">

<h2>

📅 Today Tasks

</h2>


{

subjects.length===0

?

(

<div className="status empty">

📚 No Subjects

</div>

)

:

todayTasks.length===0

?

(

<div className="status success">

🎉 Successfully Completed

</div>

)

:

(

todayTasks.map(sub=>(

<div
key={sub.id}
className="task"
>

<div>

<h3>

{sub.name}

</h3>

<p>

⏱ {sub.hours} hrs

</p>

</div>

<span>

🔥 {sub.priority}

</span>

</div>

))

)

}

</div>



<div className="buttons">

<button
onClick={()=>
navigate("/subjects")
}
>

Manage Subjects

</button>


<button
onClick={()=>
navigate("/planner")
}
>

Open Planner

</button>

</div>

</div>

</>

)

}

export default Dashboard