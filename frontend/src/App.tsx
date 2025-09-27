import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import AboutMe from "./components/About";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard_v2";
import Search from "./components/Search";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/dashboard"
          element={
            <>
              <Dashboard />
            </>
          }
        />
        <Route path="/about-me/*" element={<AboutMe />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/search" element={<Search/>}/> */}
      </Routes>
    </BrowserRouter>
  );
}
