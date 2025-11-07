import { useCarrito } from "../../context/CarritoContext";

export function Header() {
  const { toggleCarrito, obtenerCantidadTotal } = useCarrito();
  const cantidadItems = obtenerCantidadTotal();

  // Función para abrir WhatsApp
  const abrirWhatsApp = () => {
    // Reemplaza este número con el número de WhatsApp del negocio (con código de país, sin + ni espacios)
    const numeroWhatsApp = "5491234567890"; // Ejemplo: 549 (Argentina) + número
    const mensaje = "Hola! Me gustaría hacer un pedido.";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <header>
      <nav>
        {/* Logo y Nombre del negocio */}
        <div className="nav-brand">
          <img
            src="/QCH_logo_transparente.png"
            alt="logo Que Comemos Hoy"
            className="LogoNav"
          />
          <div className="brand-text">
            <h1 className="brand-name">Que Comemos Hoy</h1>
            <p className="brand-tagline">Comida casera con amor</p>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="nav-info">
          <button className="info-item info-clickable" onClick={abrirWhatsApp}>
            <span className="info-icon">📞</span>
            <span className="info-text">WhatsApp</span>
          </button>
        </div>

        {/* Botón del carrito */}
        <div className="nav-actions">
          <button className="carrito-flotante" onClick={toggleCarrito}>
            🛒
            {cantidadItems > 0 && (
              <span className="carrito-badge">{cantidadItems}</span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
