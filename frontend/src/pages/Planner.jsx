import { useEffect,useState } from "react"
import "./Planner.css"
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom"

function Planner(){

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

const GOAL_KEY=
`goal_${user}`

const DARK_KEY=
`dark_${user}`

const [subjects,setSubjects]=useState([])
const [completed,setCompleted]=useState([])

const [dark,setDark]=useState(

JSON.parse(
localStorage.getItem(
DARK_KEY
)
)

||

false

)

const [goal,setGoal]=useState(

Number(

localStorage.getItem(
GOAL_KEY
)

)

||

5

)

const [streak,setStreak]=useState(

Number(

localStorage.getItem(
STREAK_KEY
)

)

||

0

)

const [seconds,setSeconds]=
useState(1500)

const [running,setRunning]=
useState(false)



useEffect(()=>{

setSubjects(

JSON.parse(

localStorage.getItem(
SUBJECT_KEY
)

||

"[]"

)

)

setCompleted(

JSON.parse(

localStorage.getItem(
PROGRESS_KEY
)

||

"[]"

)

)

},[])



useEffect(()=>{

localStorage.setItem(

DARK_KEY,

JSON.stringify(dark)

)

},[dark])



useEffect(()=>{

let timer

if(running){

timer=

setInterval(()=>{

setSeconds(

v=>

v>0

?

v-1

:

0

)

},1000)

}

return()=>clearInterval(timer)

},[running])



function format(){

const m=

String(
Math.floor(seconds/60)
)

.padStart(2,"0")

const s=

String(
seconds%60
)

.padStart(2,"0")

return `${m}:${s}`

}



function complete(i){

if(
completed.includes(i)
)
return

const updated=[

...completed,
i

]

setCompleted(updated)

localStorage.setItem(

PROGRESS_KEY,

JSON.stringify(updated)

)

const st=
streak+1

setStreak(st)

localStorage.setItem(
STREAK_KEY,
st
)

}



function resetProgress(){

setCompleted([])

setStreak(0)

localStorage.removeItem(
PROGRESS_KEY
)

localStorage.removeItem(
STREAK_KEY
)

}



function exportPlan(){

const text=

JSON.stringify(
subjects,
null,
2
)

const blob=
new Blob([text])

const url=
URL.createObjectURL(blob)

const a=
document.createElement("a")

a.href=url

a.download=
"planner.txt"

a.click()

}



const progress=

subjects.length

?

Math.round(

(
completed.length
/
subjects.length
)

*100

)

:

0



return(

<>

<Navbar/>

<div
className={
dark
?
"planner dark"
:
"planner"
}
>

<div className="top">

<button
onClick={()=>
setDark(!dark)
}
>

{
dark
?
"☀ Light"
:
"🌙 Dark"
}

</button>


<button
onClick={()=>
navigate("/dashboard")
}
>

🏠 Dashboard

</button>


<button
onClick={()=>
navigate("/subjects")
}
>

📚 Subjects

</button>

</div>



<h1 className="title">

📅 Study Planner

</h1>



<div className="grid">

<div className="card">

<h2>

⏰ Timer

</h2>

<h1>

{format()}

</h1>

<div className="row">

<button
onClick={()=>
setRunning(true)
}
>

Start

</button>

<button
onClick={()=>
setRunning(false)
}
>

Pause

</button>

<button
onClick={()=>{

setRunning(false)

setSeconds(1500)

}}

>

Reset

</button>

</div>

</div>



<div className="card">

<h2>

🔥 Streak

</h2>

<h1>

{streak}

</h1>

</div>



<div className="card">

<h2>

🎯 Goal

</h2>

<input

value={goal}

type="number"

onChange={(e)=>{

setGoal(
e.target.value
)

localStorage.setItem(

GOAL_KEY,

e.target.value

)

}}

>

</input>

</div>



<div className="card">

<h2>

📊 Progress

</h2>

<h1>

{progress}%

</h1>

</div>

</div>



<div className="actions">

<button
onClick={resetProgress}
>

Reset Progress

</button>


<button
onClick={exportPlan}
>

Export

</button>

</div>



{

subjects.length===0

?

<div className="empty">

📚 No Subjects

</div>

:

subjects.map((sub,i)=>{

const days=

Math.max(

Math.ceil(

(

new Date(sub.date)
-
new Date()

)

/

86400000

),

1

)

const perDay=

(

Number(sub.hours)

/

days

)

.toFixed(1)

return(

<div
key={sub.id}
className="subject"
>

<h2>

{sub.name}

</h2>

<p>

⏱ {sub.hours} hrs

</p>

<p>

📅 {sub.date}

</p>

<p>

🔥 {sub.priority}

</p>

<p>

⭐ {sub.difficulty}

</p>

<p>

🧠 {perDay} hrs/day

</p>

<p>

⏳ {days} days left

</p>

<p>

📝 {sub.notes}

</p>

<button

className="complete"

onClick={()=>
complete(i)
}
>

{

completed.includes(i)

?

"✅ Completed"

:

"Complete"

}

</button>

</div>

)

})

}

</div>

</>

)

}

export default Planner