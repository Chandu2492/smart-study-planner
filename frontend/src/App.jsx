import {
Routes,
Route,
Navigate
}
from "react-router-dom"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Subjects from "./pages/Subjects"
import Planner from "./pages/Planner"
import Profile from "./pages/Profile"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

function App(){

return(

<Routes>

<Route
path="/"
element={
<Navigate
to="/login"
/>
}
/>

<Route
path="/login"
element={
<Login/>
}
/>

<Route
path="/signup"
element={
<Signup/>
}
/>

<Route
path="/forgot"
element={
<ForgotPassword/>
}
/>

<Route
path="/reset-password/:token"
element={
<ResetPassword/>
}
/>

<Route
path="/dashboard"
element={
<Dashboard/>
}
/>

<Route
path="/subjects"
element={
<Subjects/>
}
/>

<Route
path="/planner"
element={
<Planner/>
}
/>

<Route
path="/profile"
element={
<Profile/>
}
/>

</Routes>

)

}

export default App