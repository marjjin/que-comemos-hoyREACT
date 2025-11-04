import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { Main } from "./components/Main/Main";
import { Footer } from "./components/Footer/Footer";
import { AdminPanel } from "./components/AdminPanel/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Ruta principal - Menú */}
        <Route path="/" element={<Main />} />

        {/* Ruta del panel de administración */}
        <Route path="/panel" element={<AdminPanel />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
