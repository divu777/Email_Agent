
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Callback from "./Callback";
import { ConnectGmail } from "./ConnectGmail";
import Dashboard from "./Dashboard";
import Gmail from "./Gmail";
import Hand from "./Hand";
import Landing from "./Landing";
import PromptSelect from "./PromptSelect";

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing/>} />
      <Route path='/hand' element={<Hand/>}/>
      <Route path='/gmail' element={<Gmail />} />
      <Route path='/callback' element={<Callback />} />
      <Route path='/connect-gmail' element={<ConnectGmail />} />

      <Route path='/dashboard' element={<Dashboard />} />
      <Route path="/prompt-select" element={<PromptSelect/>}/>
    </Routes>
    </BrowserRouter>
  );
}


/*

todo list 

1) first of all the user comes on landing page -> there we show navbar with Login button 
  a) based on this we have 1) new user 2) old user 
      - new user flow 
        1) does clerk sign up , goes to a page where he selects gmail and gets us access to the email(also add 
        no 2 people can link the same email in google oauth so maybe extra field and check and handling of it)

        2) then redirect to the prompt select page based on the onboarding thing(already written logic) , then move to dashboard 

      - old user 
       1) does clerk sign in and then redirects directly to dashboard 

2) make dashboard page (make new pages while keeping the old one so we don't lose code )
  a) the ui of different animation based on which view selected will require wrapper like situation , if mobile view move 
  the left side menu to below and have different animation accordingly 


*/