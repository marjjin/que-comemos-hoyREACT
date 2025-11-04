import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { Main } from "./components/Main/Main";
import { Footer } from "./components/Footer/Footer";
import { AdminPanel } from "./components/AdminPanel/AdminPanel";
import { CarritoProvider } from "./context/CarritoContext";
import { Carrito } from "./components/Carrito/Carrito";

function App() {
  return (
    <CarritoProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Ruta principal - Menú */}
          <Route path="/" element={<Main />} />

          {/* Ruta del panel de administración */}
          <Route path="/panel" element={<AdminPanel />} />
        </Routes>
        <Footer />
        <Carrito />
      </BrowserRouter>
    </CarritoProvider>
  );
}

export default App;
