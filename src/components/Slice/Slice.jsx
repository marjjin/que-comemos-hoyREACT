// Importaciones necesarias
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "./Slice.css";

// Inicialización del cliente de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, // URL de la base de datos de Supabase
  import.meta.env.VITE_SUPABASE_ANON_KEY // Clave anónima para acceso público
);

// Componente Banner rotativo (slider/carrousel)
export function Slice() {
  // Estado para almacenar las imágenes
  const [imagenes, setImagenes] = useState([]);
  // Estado para el índice actual del banner
  const [indiceActual, setIndiceActual] = useState(0);
  // Referencia para el intervalo
  const intervaloRef = useRef(null);

  // Efecto para cargar las imágenes desde la base de datos al montar el componente
  useEffect(() => {
    async function cargarImagenes() {
      // Consulta la tabla 'slice' (la columna se llama 'imagen_slice')
      const { data, error } = await supabase
        .from("slice")
        .select("id, imagen_slice");
      // Logueamos la respuesta para depuración
      console.log("Slice - supabase response:", { data, error });
      if (error) {
        console.error("Error al cargar banners:", error);
        return;
      }

      // Si las imágenes están almacenadas en Supabase Storage como rutas relativas,
      // construimos la URL pública. Puedes definir el bucket en VITE_SUPABASE_BUCKET
      const bucket = import.meta.env.VITE_SUPABASE_BUCKET || "slice";
      const baseUrl = import.meta.env.VITE_SUPABASE_URL
        ? String(import.meta.env.VITE_SUPABASE_URL).replace(/\/$/, "")
        : "";

      const imagenesConUrl = (data || [])
        .map((b) => {
          // Usamos la columna correcta: imagen_slice
          const img = b.imagen_slice || "";
          // Si ya es una URL completa la usamos tal cual
          if (img.startsWith("http") || img.startsWith("//")) return img;
          // Si es vacío, devolvemos null (se filtrará después)
          if (!img) return null;
          // Construimos la URL pública del bucket: <SUPABASE_URL>/storage/v1/object/public/<bucket>/<path>
          return `${baseUrl}/storage/v1/object/public/${bucket}/${img}`;
        })
        .filter(Boolean);
      console.log("Slice - imagenesConUrl:", imagenesConUrl);
      setImagenes(imagenesConUrl);
    }
    cargarImagenes();
  }, []);

  // Efecto para cambiar el banner automáticamente cada 3 segundos
  useEffect(() => {
    if (imagenes.length === 0) return;
    intervaloRef.current = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % imagenes.length);
    }, 7000); // Cambia cada 3 segundos
    return () => clearInterval(intervaloRef.current);
  }, [imagenes]);

  // Renderizado del banner con animación mejorada
  return (
    <section className="slice-banner-container">
      {imagenes.length > 0 ? (
        <img
          key={indiceActual} // Key única para forzar re-render y animación
          src={imagenes[indiceActual]}
          alt={`Banner ${indiceActual + 1}`}
          className="slice-banner-img"
        />
      ) : (
        <div className="slice-banner-loading">Cargando banners</div>
      )}
    </section>
  );
}
