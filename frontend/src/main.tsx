import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import  { store } from "./store/store.ts";
import { config } from "./config/index.ts";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
      publishableKey={config.PUBLISHABLE_KEY}
      afterSignOutUrl="/dashboard"
    >
  <Provider store={store}>
      <App />
    
  </Provider>
  </ClerkProvider>
);



