// Importaciones necesarias para el funcionamiento del componente
import { createClient } from "@supabase/supabase-js"; // Cliente de Supabase para la base de datos
import { useEffect, useState } from "react"; // Hooks de React para manejar estado y efectos
import "./Main.css"; // Estilos del componente
import { Slice } from "../Slice/Slice";
import { useCarrito } from "../../context/CarritoContext";

// Inicialización del cliente de Supabase con las credenciales
// Se coloca fuera del componente para evitar reinicializaciones innecesarias
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, // URL de la base de datos de Supabase
  import.meta.env.VITE_SUPABASE_ANON_KEY // Clave anónima para acceso público
);

// Componente ProductCard: Muestra la información de un producto individual
// Recibe como prop un objeto 'producto' con todos los datos del producto
const ProductCard = ({ producto }) => {
  const { agregarAlCarrito } = useCarrito();
  const sinStock = producto.stock === false;

  return (
    <article className="producto-card">
      {sinStock && <div className="producto-sin-stock-badge">Sin Stock</div>}
      <h3 className="producto-nombre">{producto.producto}</h3>
      <img
        src={producto.imagen}
        alt={producto.producto}
        className="producto-img"
        loading="lazy" // Optimización: carga diferida de imágenes
      />
      <p className="producto-descripcion">{producto.descripcion}</p>
      <p className="producto-precio">${producto.precio}</p>
      <button
        className={`btn-agregar-carrito ${sinStock ? "btn-disabled" : ""}`}
        onClick={() => agregarAlCarrito(producto)}
        disabled={sinStock}
      >
        {sinStock ? "❌ Sin Stock" : "🛒 Agregar al Carrito"}
      </button>
    </article>
  );
};

// Componente CategoriaSection: Agrupa productos por categoría
// Recibe: categoria (string) y productos (array de productos de esa categoría)
const CategoriaSection = ({ categoria, productos }) => (
  <section className="categoria-seccion">
    <h2 className="categoria-nombre">{categoria}</h2>
    <div className="productos-grid">
      {/* Iteración sobre los productos de la categoría */}
      {productos.map((producto) => (
        <ProductCard
          key={producto.id} // Key única requerida por React para listas
          producto={producto}
        />
      ))}
    </div>
  </section>
);

// Componente principal que maneja la lógica y estado de la aplicación
export function Main() {
  // Definición de estados usando el hook useState
  const [categorias, setCategorias] = useState({}); // Estado para almacenar productos por categoría
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga
  const [error, setError] = useState(null); // Estado para manejar errores

  // useEffect para cargar datos cuando el componente se monta
  useEffect(() => {
    // Función asíncrona para cargar productos desde Supabase
    async function cargarProductos() {
      try {
        setIsLoading(true); // Indica que está cargando
        // Consulta a la base de datos Supabase
        const { data, error } = await supabase
          .from("producto")
          .select(
            `
            id,
            producto,
            precio,
            descripcion,
            imagen,
            estado,
            stock,
            Categoria (categoria)
          `
          )
          .eq("estado", "activo") // Solo productos activos
          .order("precio"); // Ordena los productos por precio

        // Si hay error en la consulta, lo lanza para manejarlo en el catch
        if (error) throw error;

        // Procesa los datos para agruparlos por categoría
        const categoriasAgrupadas = data.reduce((acc, producto) => {
          const categoria = producto.Categoria.categoria;
          if (!acc[categoria]) {
            acc[categoria] = []; // Inicializa el array si la categoría no existe
          }
          acc[categoria].push(producto); // Agrega el producto a su categoría
          return acc;
        }, {});

        // Actualiza el estado con los datos procesados
        setCategorias(categoriasAgrupadas);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError(err.message); // Guarda el mensaje de error en el estado
      } finally {
        setIsLoading(false); // Indica que terminó de cargar (éxito o error)
      }
    }

    // Ejecuta la función de carga
    cargarProductos();
  }, []); // Array vacío significa que solo se ejecuta al montar el componente

  // Renderizado del componente con manejo condicional de estados
  return (
    <main className="menu-container">
      <h1 className="title-principal">¿Qué Comemos Hoy?</h1>
      <Slice />

      {/* Renderizado condicional basado en estados */}
      {error ? (
        // Si hay error, muestra el mensaje de error
        <div className="error-mensaje">
          Error al cargar los productos: {error}
        </div>
      ) : isLoading ? (
        // Si está cargando, muestra el indicador de carga
        <div className="loading">
          <p className="loader"></p>
        </div>
      ) : (
        // Si todo está bien, muestra los productos organizados por categoría
        <div id="productos" className="productos-container">
          {/* Mapea cada categoría a un componente CategoriaSection */}
          {Object.entries(categorias).map(([categoria, productos]) => (
            <CategoriaSection
              key={categoria}
              categoria={categoria}
              productos={productos}
            />
          ))}
        </div>
      )}
    </main>
  );
}
