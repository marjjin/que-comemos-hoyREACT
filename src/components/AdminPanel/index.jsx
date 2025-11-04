import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./AdminPanel.css";
import { AdminPanel } from "./AdminPanel";

createRoot(document.getElementById("panel")).render(
  <StrictMode>
    <AdminPanel />
  </StrictMode>
);
