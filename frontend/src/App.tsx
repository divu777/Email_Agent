
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

1) work on the protected route based on that wrap it around 
prompt-select , connect-gmail and dashboard 

2) then work on the ui design of pages 
  1) mail check the search , then infinte scrolling , also debounce 
  and lastly show thread and read , unread status 

  2) in prompt get the prompt the from the backend make state 
  then show them , if not then show error

  3) then get the real data and show in the insigts 

3) then work on the dahsboard design and responsive nessshel


*/