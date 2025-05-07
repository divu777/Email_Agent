
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectGmail } from "./ConnectGmail";
import Dashboard from "./Dashboard";
import Landing from "./Landing";
import PromptSelect from "./PromptSelect";

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>} />
      <Route path='/connect-gmail' element={<ConnectGmail />} />

      <Route path='/dashboard' element={<Dashboard />} />
      <Route
        path="/prompt-select"
        element={
          // <ProtectedRoute requireGmailConnected={true}>
            <PromptSelect />
          // </ProtectedRoute>
        }
      />
    </Routes>
    </BrowserRouter>
  );
}


/*

todo list 

1) buy domain to send first mail in resend 

2) cloud pub sub works try to see if it works and able to process and use the email better

3) fix something below the features and some landing page UI revamp that you do yourself 


*/