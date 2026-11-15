import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import App from "./App";
import "./index.css";

// Force purge any old cached theme or service workers
if (typeof window !== "undefined") {
  document.documentElement.setAttribute("data-theme", "light");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) reg.unregister();
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ProfileProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ProfileProvider>
    </ThemeProvider>
  </React.StrictMode>
);
