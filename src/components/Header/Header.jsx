import { useCarrito } from "../../context/CarritoContext";

export function Header() {
  const { toggleCarrito, obtenerCantidadTotal } = useCarrito();
  const cantidadItems = obtenerCantidadTotal();

  return (
    <header>
      <nav>
        {/* Spacer izquierdo para centrar el logo */}
        <div className="nav-spacer"></div>

        <img
          src="/QCH_logo_transparente.png"
          alt="logo Que Comemos Hoy"
          className="LogoNav"
        />

        {/* Botón flotante del carrito */}
        <button className="carrito-flotante" onClick={toggleCarrito}>
          🛒
          {cantidadItems > 0 && (
            <span className="carrito-badge">{cantidadItems}</span>
          )}
        </button>
      </nav>
    </header>
  );
}
