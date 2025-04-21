import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import  { persistor, store } from "./store/store.ts";
import { config } from "./config/index.ts";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
      publishableKey={config.PUBLISHABLE_KEY}
      afterSignOutUrl="/dashboard"
    >
  <Provider store={store}>
     <PersistGate loading={null} persistor={persistor}>
      <App />
    
    </PersistGate>
  </Provider>
  </ClerkProvider>
);
