import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  // Estado del carrito - se guarda en localStorage para persistencia
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  // Estado para mostrar/ocultar el carrito
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Estado para las notificaciones
  const [notificacion, setNotificacion] = useState(null);

  // Guardar en localStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  // Función para mostrar notificaciones temporales
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 3000); // La notificación desaparece después de 3 segundos
  };

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      // Verificar si el producto ya está en el carrito
      const productoExistente = prev.find((item) => item.id === producto.id);

      if (productoExistente) {
        // Si existe, aumentar la cantidad
        mostrarNotificacion(`✅ Se agregó otra unidad de ${producto.producto}`);
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si no existe, agregarlo con cantidad 1
        mostrarNotificacion(`✅ ${producto.producto} agregado al carrito`);
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (idProducto) => {
    setCarrito((prev) => prev.filter((item) => item.id !== idProducto));
  };

  // Actualizar cantidad de un producto
  const actualizarCantidad = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(idProducto);
      return;
    }

    setCarrito((prev) =>
      prev.map((item) =>
        item.id === idProducto ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  // Vaciar el carrito
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // Calcular total del carrito
  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  };

  // Obtener cantidad total de productos
  const obtenerCantidadTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  // Generar mensaje de WhatsApp
  const generarMensajeWhatsApp = () => {
    if (carrito.length === 0) return "";

    let mensaje = "🍽️ *¿QUÉ COMEMOS HOY?* 🍽️\n\n";
    mensaje += "✨ *¡Nuevo Pedido!* ✨\n";
    mensaje += "━━━━━━━━━━━━━━━━━━\n\n";
    mensaje += "📦 *Detalle del pedido:*\n\n";

    carrito.forEach((item, index) => {
      mensaje += `🍴 *${item.producto}*\n`;
      mensaje += `   📊 Cantidad: ${item.cantidad} unidad${
        item.cantidad > 1 ? "es" : ""
      }\n`;
      mensaje += `   💵 Precio c/u: $${item.precio}\n`;
      mensaje += `   💳 Subtotal: $${item.precio * item.cantidad}\n`;
      if (index < carrito.length - 1) {
        mensaje += `\n`;
      }
    });

    const total = calcularTotal();
    mensaje += `\n━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL A PAGAR: $${total}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━\n\n`;
    mensaje += "🙏 ¡Gracias por tu pedido!\n";
    mensaje += "⏰ Te contactaremos pronto para confirmar �";

    return encodeURIComponent(mensaje);
  };

  // Enviar pedido por WhatsApp
  const enviarPorWhatsApp = () => {
    const mensaje = generarMensajeWhatsApp();
    const numeroWhatsApp = "5493364188464"; // Tu número de WhatsApp
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.open(url, "_blank");
  };

  // Toggle para abrir/cerrar el carrito
  const toggleCarrito = () => {
    setMostrarCarrito((prev) => !prev);
  };

  const value = {
    carrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    calcularTotal,
    obtenerCantidadTotal,
    mostrarCarrito,
    setMostrarCarrito,
    toggleCarrito,
    enviarPorWhatsApp,
    notificacion,
  };

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

// Hook personalizado para usar el carrito
export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  }
  return context;
}
