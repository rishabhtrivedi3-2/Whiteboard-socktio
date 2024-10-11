import React, { } from "react";
import "./index.css"; // Ensure Tailwind CSS is imported here
import Whiteboard from "./components/Whiteboard";
import CreateRoom from "./components/frontend/CreateRoom";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinRoom from "./components/frontend/JoinRoom";


function App() {

  return (
    <>
      <div className="max-h-screen w-auto">

        <Router>


          <Routes>

            <Route path="/" element={<Whiteboard/>} />
            <Route path="/newroom/:id"  element={<JoinRoom />} />

          </Routes>
        </Router>




      </div>
    </>
  );
}

export default App;
