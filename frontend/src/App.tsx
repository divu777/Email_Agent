
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectGmail } from "./ConnectGmail";
import Dashboard from "./Dashboard";
import Landing from "./Landing";
import PromptSelect from "./PromptSelect";
import AboutMe from "./components/About";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/connect-gmail"
          element={
            <>
              <ConnectGmail />
            </>
          }
        />

        <Route
          path="/dashboard"
          element={
            <>
              <Dashboard />
            </>
          }
        />
        <Route path="/about-me" element={<AboutMe />} />
        <Route
          path="/prompt-select"
          element={
            <>
              <PromptSelect />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

