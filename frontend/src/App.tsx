
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import AboutMe from "./components/About";
import Login from "./components/Login";
import Dashboard2 from "./components/Dashboard2";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/dashboard"
          element={
            <>
              <Dashboard2 />
            </>
          }
        />
        <Route path="/about-me/*" element={<AboutMe />} />
        <Route 
        path="/login"
        element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  );
}

