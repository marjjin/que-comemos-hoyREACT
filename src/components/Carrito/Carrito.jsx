import { useCarrito } from "../../context/CarritoContext";
import "./Carrito.css";

export function Carrito() {
  const {
    carrito,
    eliminarDelCarrito,
    actualizarCantidad,
    calcularTotal,
    mostrarCarrito,
    setMostrarCarrito,
    enviarPorWhatsApp,
    vaciarCarrito,
  } = useCarrito();

  if (!mostrarCarrito) return null;

  return (
    <>
      {/* Overlay oscuro de fondo */}
      <div
        className="carrito-overlay"
        onClick={() => setMostrarCarrito(false)}
      />

      {/* Panel lateral del carrito */}
      <div className="carrito-panel">
        {/* Header del carrito */}
        <div className="carrito-header">
          <h2>🛒 Tu Carrito</h2>
          <button
            className="carrito-cerrar"
            onClick={() => setMostrarCarrito(false)}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="carrito-contenido">
          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <p>🛍️ Tu carrito está vacío</p>
              <p className="carrito-vacio-subtitulo">
                ¡Agrega algunos productos deliciosos!
              </p>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="carrito-productos">
                {carrito.map((item) => (
                  <div key={item.id} className="carrito-item">
                    <img
                      src={item.imagen}
                      alt={item.producto}
                      className="carrito-item-imagen"
                    />
                    <div className="carrito-item-info">
                      <h3 className="carrito-item-nombre">{item.producto}</h3>
                      <p className="carrito-item-precio">${item.precio}</p>

                      {/* Controles de cantidad */}
                      <div className="carrito-item-cantidad">
                        <button
                          onClick={() =>
                            actualizarCantidad(item.id, item.cantidad - 1)
                          }
                          className="cantidad-btn"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="cantidad-valor">{item.cantidad}</span>
                        <button
                          onClick={() =>
                            actualizarCantidad(item.id, item.cantidad + 1)
                          }
                          className="cantidad-btn"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <p className="carrito-item-subtotal">
                        Subtotal: ${item.precio * item.cantidad}
                      </p>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="carrito-item-eliminar"
                      aria-label="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer con total y acciones */}
              <div className="carrito-footer">
                <button onClick={vaciarCarrito} className="carrito-vaciar-btn">
                  Vaciar Carrito
                </button>

                <div className="carrito-total">
                  <span className="carrito-total-label">Total:</span>
                  <span className="carrito-total-valor">
                    ${calcularTotal()}
                  </span>
                </div>

                <button
                  onClick={() => {
                    enviarPorWhatsApp();
                    setMostrarCarrito(false);
                  }}
                  className="carrito-finalizar-btn"
                >
                  📱 Finalizar por WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
