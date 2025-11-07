import { useCarrito } from "../../context/CarritoContext";
import "./Notificacion.css";

export function Notificacion() {
  const { notificacion } = useCarrito();

  if (!notificacion) return null;

  return (
    <div className={`notificacion notificacion-${notificacion.tipo}`}>
      <p>{notificacion.mensaje}</p>
    </div>
  );
}
