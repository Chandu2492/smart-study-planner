import "./Subjects.css"
import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

function Subjects(){

const navigate=
useNavigate()

const currentUser=

localStorage.getItem(
"user"
)

||

"guest"

const STORAGE_KEY=

`plannerSubjects_${currentUser}`

const [subjects,setSubjects]=
useState([])

const [search,setSearch]=
useState("")

const [filter,setFilter]=
useState("All")

const [name,setName]=
useState("")

const [hours,setHours]=
useState("")

const [date,setDate]=
useState("")

const [priority,setPriority]=
useState("Medium")

const [difficulty,setDifficulty]=
useState("Medium")

const [notes,setNotes]=
useState("")

useEffect(()=>{

const saved=

JSON.parse(

localStorage.getItem(
STORAGE_KEY
)

||

"[]"

)

setSubjects(saved)

},[])

function save(data){

setSubjects(data)

localStorage.setItem(

STORAGE_KEY,

JSON.stringify(data)

)

}

function addSubject(){

if(
!name
||
!hours
||
!date
){

alert(
"Fill all fields"
)

return

}

const obj={

id:Date.now(),

name,

hours,

date,

priority,

difficulty,

notes

}

save([

...subjects,

obj

])

setName("")
setHours("")
setDate("")
setPriority("Medium")
setDifficulty("Medium")
setNotes("")

}

function deleteSubject(id){

save(

subjects.filter(

s=>

s.id!==id

)

)

}

function editSubject(id){

const updated=

subjects.map(sub=>{

if(
sub.id!==id
)
return sub

return{

...sub,

name:
prompt(
"Subject",
sub.name
)
||
sub.name,

hours:
prompt(
"Hours",
sub.hours
)
||
sub.hours,

date:
prompt(
"Date",
sub.date
)
||
sub.date,

priority:
prompt(
"Priority",
sub.priority
)
||
sub.priority,

difficulty:
prompt(
"Difficulty",
sub.difficulty
)
||
sub.difficulty,

notes:
prompt(
"Notes",
sub.notes
)
||
sub.notes

}

})

save(updated)

}

function clearAll(){

if(

window.confirm(
"Delete all subjects?"
)

){

save([])

}

}

function generate(){

if(
subjects.length===0
){

alert(
"Add subjects first"
)

return

}

navigate(
"/planner"
)

}

const filtered=

subjects

.filter(

s=>

filter==="All"

||

s.priority===filter

)

.filter(

s=>

s.name

.toLowerCase()

.includes(

search.toLowerCase()

)

)

return(

<>

<Navbar/>

<div className="subject-page">

<h1 className="title">

📚 Manage Subjects

</h1>

<div className="layout">

<div className="form-card">

<input
className="input"
placeholder="🔍 Search"
value={search}
onChange={(e)=>
setSearch(
e.target.value
)}
/>

<select
className="input"
value={filter}
onChange={(e)=>
setFilter(
e.target.value
)}

>

<option>All</option>
<option>High</option>
<option>Medium</option>
<option>Low</option>

</select>

<input
className="input"
placeholder="Subject Name"
value={name}
onChange={(e)=>
setName(
e.target.value
)}
/>

<input
className="input"
type="number"
placeholder="Study Hours"
value={hours}
onChange={(e)=>
setHours(
e.target.value
)}
/>

<label>
📅 Exam Date
</label>

<input
className="input"
type="date"
value={date}
onChange={(e)=>
setDate(
e.target.value
)}
/>

<label>
🔥 Priority
</label>

<select
className="input"
value={priority}
onChange={(e)=>
setPriority(
e.target.value
)}

>

<option>High</option>
<option>Medium</option>
<option>Low</option>

</select>

<label>
⭐ Difficulty
</label>

<select
className="input"
value={difficulty}
onChange={(e)=>
setDifficulty(
e.target.value
)}

>

<option>Easy</option>
<option>Medium</option>
<option>Hard</option>

</select>

<textarea
className="input textarea"
placeholder="Notes"
value={notes}
onChange={(e)=>
setNotes(
e.target.value
)}
/>


<button
className="addBtn"
onClick={addSubject}
>

Add Subject

</button>


<button
className="planBtn"
onClick={generate}
>

Generate Planner

</button>


<button
className="clearBtn"
onClick={clearAll}
>

Clear All

</button>

</div>



<div className="subject-list">

{

filtered.length===0

?

<div className="empty">

📚 No Subjects Found

</div>

:

filtered.map(sub=>(

<div
key={sub.id}
className="card"
>

<h2>

{sub.name}

</h2>

<p>⏱ {sub.hours} hrs</p>

<p>📅 {sub.date}</p>

<p>🔥 {sub.priority}</p>

<p>⭐ {sub.difficulty}</p>

<p>📝 {sub.notes}</p>


<div className="actions">

<button
className="editBtn"
onClick={()=>
editSubject(sub.id)
}
>

Edit

</button>


<button
className="deleteBtn"
onClick={()=>
deleteSubject(sub.id)
}
>

Delete

</button>

</div>

</div>

))

}

</div>

</div>

</div>

</>

)

}

export default Subjects
