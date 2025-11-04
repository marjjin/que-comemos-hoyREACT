// Panel de administración para gestionar productos y categorías
// Permite: cargar productos, subir imágenes, gestionar categorías, editar/eliminar productos
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./AdminPanel.css";

// Inicializa el cliente de Supabase con las credenciales del entorno
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function AdminPanel() {
  // Estado para los campos del formulario de producto
  const [form, setForm] = useState({
    producto: "", // Nombre del producto
    precio: "", // Precio
    descripcion: "", // Descripción
    imagen: "", // (no se usa, solo para compatibilidad)
    categoria: "", // Categoría seleccionada
  });
  // Estado para el archivo de imagen a subir
  const [file, setFile] = useState(null);
  // Estado para el listado de categorías
  const [categorias, setCategorias] = useState([]);
  // Estado para agregar nueva categoría
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  // Estado para edición de categoría
  const [editandoId, setEditandoId] = useState(null); // id de la categoría en edición
  const [editNombre, setEditNombre] = useState(""); // nombre editado
  // Estado para confirmación de borrado de categoría
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  // Estado para filtro de productos por categoría
  const [filtroCategoria, setFiltroCategoria] = useState("");
  // Estado para productos filtrados
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  // Estado para edición de producto
  const [editProdId, setEditProdId] = useState(null); // id del producto en edición
  const [editProdForm, setEditProdForm] = useState({
    producto: "",
    precio: "",
    descripcion: "",
  });
  // Estado para confirmación de borrado de producto
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState(null);
  // Estado para gestión de imágenes del slice
  const [sliceImages, setSliceImages] = useState([]); // Lista de imágenes del slice
  const [sliceFile, setSliceFile] = useState(null); // Archivo de imagen para el slice
  const [confirmDeleteSliceId, setConfirmDeleteSliceId] = useState(null); // Confirmación de borrado de slice
  // Estado para controlar la pestaña activa
  const [tabActiva, setTabActiva] = useState("productos"); // 'productos', 'categorias', 'gestionProductos', 'slice'

  // Iniciar edición de producto
  function startEditProducto(prod) {
    setEditProdId(prod.id);
    setEditProdForm({
      producto: prod.producto,
      precio: prod.precio,
      descripcion: prod.descripcion,
    });
  }

  // Manejar cambios en edición de producto
  function handleEditProdChange(e) {
    setEditProdForm({ ...editProdForm, [e.target.name]: e.target.value });
  }

  // Guardar edición de producto
  // Actualiza el producto en la tabla
  async function handleEditProducto(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("producto")
      .update({
        producto: editProdForm.producto,
        precio: Number(editProdForm.precio),
        descripcion: editProdForm.descripcion,
      })
      .eq("id", editProdId);
    if (!error) {
      setMensaje("Producto editado correctamente.");
      setEditProdId(null);
      setEditProdForm({ producto: "", precio: "", descripcion: "" });
      // Refresca productos filtrados
      if (filtroCategoria) fetchProductosFiltrados(filtroCategoria);
    } else {
      setMensaje("Error al editar producto: " + error.message);
    }
  }

  // Eliminar producto con confirmación
  function handleDeleteProducto(id) {
    setConfirmDeleteProdId(id);
  }

  // Confirma y elimina el producto
  async function confirmDeleteProducto(id) {
    const { error } = await supabase.from("producto").delete().eq("id", id);
    if (!error) {
      setMensaje("Producto eliminado.");
      setProductosFiltrados(productosFiltrados.filter((p) => p.id !== id));
    } else {
      setMensaje("Error al eliminar producto: " + error.message);
    }
    setConfirmDeleteProdId(null);
  }
  // Estado para mensajes de éxito/error
  const [mensaje, setMensaje] = useState("");
  // Estado para loading global
  const [loading, setLoading] = useState(false);

  // Maneja cambios en los campos del formulario de producto
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Maneja selección de archivo de imagen
  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  // Envía el producto a Supabase
  // 1. Valida campos
  // 2. Sube la imagen a Storage
  // 3. Inserta el producto en la tabla 'producto' con la URL pública de la imagen
  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje("");
    setLoading(true);
    // Validación básica
    if (
      !form.producto ||
      !form.precio ||
      !form.descripcion ||
      !form.categoria ||
      !file
    ) {
      setMensaje("Completa todos los campos y selecciona una imagen.");
      setLoading(false);
      return;
    }

    // Subir imagen a Supabase Storage
    // IMPORTANTE: Asegúrate de crear el bucket en Supabase Storage
    // Ve a: Supabase Dashboard > Storage > Create bucket
    // Nombre del bucket: "image" (debe ser público)
    const bucket = import.meta.env.VITE_SUPABASE_BUCKET || "image";
    const filePath = `${Date.now()}_${file.name}`;

    console.log("Intentando subir a bucket:", bucket);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    if (uploadError) {
      console.error("Error completo:", uploadError);
      setMensaje(
        `Error al subir imagen: ${uploadError.message}. Verifica que el bucket '${bucket}' exista en Supabase Storage.`
      );
      setLoading(false);
      return;
    }
    // Construir URL pública de la imagen subida
    const baseUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, "");
    const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`;

    // Buscar el ID de la categoría seleccionada
    const categoriaSeleccionada = categorias.find(
      (cat) => cat.categoria === form.categoria
    );
    if (!categoriaSeleccionada) {
      setMensaje("Error: Categoría no encontrada.");
      setLoading(false);
      return;
    }

    // Inserta en la tabla 'producto' con id_categoria
    const { error } = await supabase.from("producto").insert([
      {
        producto: form.producto,
        precio: Number(form.precio),
        descripcion: form.descripcion,
        imagen: publicUrl,
        id_categoria: categoriaSeleccionada.id,
      },
    ]);
    if (error) {
      console.error("Error completo al insertar producto:", error);
      setMensaje("Error al cargar producto: " + error.message);
    } else {
      setMensaje("Producto cargado correctamente.");
      setForm({
        producto: "",
        precio: "",
        descripcion: "",
        imagen: "",
        categoria: "",
      });
      setFile(null);
      // Si el filtro está activo, refresca productos filtrados
      if (filtroCategoria) fetchProductosFiltrados(filtroCategoria);
    }
    setLoading(false);
  }

  // Filtrar productos por categoría
  // Consulta los productos de la categoría seleccionada
  async function fetchProductosFiltrados(categoria) {
    const { data, error } = await supabase
      .from("producto")
      .select(
        "id, producto, precio, descripcion, imagen, Categoria (categoria)"
      )
      .eq("Categoria.categoria", categoria);
    if (!error && data) {
      setProductosFiltrados(data);
    } else {
      setProductosFiltrados([]);
    }
  }

  // Cargar categorías desde Supabase al montar el componente
  // Se ejecuta una sola vez al montar el panel
  useEffect(() => {
    async function fetchCategorias() {
      const { data, error } = await supabase
        .from("Categoria")
        .select("id, categoria");
      if (!error && data) {
        setCategorias(data);
      }
    }
    fetchCategorias();
  }, []);

  // Cargar imágenes del slice desde Supabase al montar el componente
  // Obtiene todas las imágenes del banner desde la tabla 'slice'
  useEffect(() => {
    async function fetchSliceImages() {
      const { data, error } = await supabase
        .from("slice")
        .select("id, imagen_slice");
      if (!error && data) {
        setSliceImages(data);
      }
    }
    fetchSliceImages();
  }, []);

  // Manejar cambio de archivo de imagen del slice
  function handleSliceFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setSliceFile(e.target.files[0]);
    }
  }

  // Subir imagen al slice (banner)
  // Sube la imagen al bucket 'image' y la registra en la tabla 'slice'
  async function handleSliceSubmit(e) {
    e.preventDefault();
    if (!sliceFile) {
      setMensaje("Debes seleccionar una imagen para el slice.");
      return;
    }

    setLoading(true);
    // Bucket específico para imágenes del slice
    const sliceBucket = "img slice";
    const filePath = `slice_${Date.now()}_${sliceFile.name}`;

    console.log("Intentando subir a bucket del slice:", sliceBucket);

    // Subir archivo al bucket
    const { error: uploadError } = await supabase.storage
      .from(sliceBucket)
      .upload(filePath, sliceFile);

    if (uploadError) {
      console.error("Error completo:", uploadError);
      setMensaje(
        `Error al subir imagen del slice: ${uploadError.message}. Verifica que el bucket '${sliceBucket}' exista en Supabase Storage.`
      );
      setLoading(false);
      return;
    }

    // Obtener URL pública de la imagen
    const { data: publicData } = supabase.storage
      .from(sliceBucket)
      .getPublicUrl(filePath);
    const imageUrl = publicData.publicUrl;

    // Insertar en la tabla 'slice'
    const { error: insertError } = await supabase
      .from("slice")
      .insert([{ imagen_slice: imageUrl }]);

    if (insertError) {
      setMensaje(`Error al guardar imagen del slice: ${insertError.message}`);
      setLoading(false);
      return;
    }

    setMensaje("Imagen del slice agregada correctamente.");
    setSliceFile(null);
    setLoading(false);

    // Refresca la lista de imágenes del slice
    const { data: updatedData } = await supabase
      .from("slice")
      .select("id, imagen_slice");
    if (updatedData) setSliceImages(updatedData);
  }

  // Eliminar imagen del slice con confirmación
  function handleDeleteSlice(id) {
    setConfirmDeleteSliceId(id);
  }

  // Confirma y elimina la imagen del slice
  async function confirmDeleteSlice(id) {
    const { error } = await supabase.from("slice").delete().eq("id", id);
    if (!error) {
      setMensaje("Imagen del slice eliminada.");
      setSliceImages(sliceImages.filter((img) => img.id !== id));
    } else {
      setMensaje("Error al eliminar imagen del slice: " + error.message);
    }
    setConfirmDeleteSliceId(null);
  }

  // Crear nueva categoría
  async function handleAddCategoria(e) {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    // Inserta la nueva categoría en la tabla
    const { error } = await supabase
      .from("Categoria")
      .insert([{ categoria: nuevaCategoria.trim() }]);
    if (!error) {
      setNuevaCategoria("");
      setMensaje("Categoría agregada correctamente.");
      // Refresca el listado de categorías
      const { data } = await supabase.from("Categoria").select("id, categoria");
      setCategorias(data);
    } else {
      setMensaje("Error al agregar categoría: " + error.message);
    }
  }

  // Eliminar categoría con confirmación
  // Muestra el diálogo de confirmación
  async function handleDeleteCategoria(id) {
    setConfirmDeleteId(id);
  }

  // Confirma y elimina la categoría
  async function confirmDeleteCategoria(id) {
    const { error } = await supabase.from("Categoria").delete().eq("id", id);
    if (!error) {
      setMensaje("Categoría eliminada.");
      setCategorias(categorias.filter((c) => c.id !== id));
    } else {
      setMensaje("Error al eliminar categoría: " + error.message);
    }
    setConfirmDeleteId(null);
  }

  // Iniciar edición de categoría
  function startEditCategoria(id, nombre) {
    setEditandoId(id);
    setEditNombre(nombre);
  }

  // Guardar edición de categoría
  async function handleEditCategoria(e) {
    e.preventDefault();
    if (!editNombre.trim()) return;
    // Actualiza el nombre de la categoría en la tabla
    const { error } = await supabase
      .from("Categoria")
      .update({ categoria: editNombre.trim() })
      .eq("id", editandoId);
    if (!error) {
      setMensaje("Categoría editada correctamente.");
      setEditandoId(null);
      setEditNombre("");
      // Refresca el listado de categorías
      const { data } = await supabase.from("Categoria").select("id, categoria");
      setCategorias(data);
    } else {
      setMensaje("Error al editar categoría: " + error.message);
    }
  }

  // Renderizado del panel de administración con pestañas
  // Incluye: formulario de producto, gestión de categorías, filtro y edición/eliminación de productos, gestión de slice
  return (
    <section className="admin-panel-container">
      <h1 className="admin-title">Panel de Administración</h1>

      {/* Navegación por pestañas */}
      <nav className="admin-tabs">
        <button
          className={`admin-tab ${tabActiva === "productos" ? "active" : ""}`}
          onClick={() => setTabActiva("productos")}
        >
          📦 Cargar Productos
        </button>
        <button
          className={`admin-tab ${tabActiva === "categorias" ? "active" : ""}`}
          onClick={() => setTabActiva("categorias")}
        >
          🏷️ Gestión de Categorías
        </button>
        <button
          className={`admin-tab ${
            tabActiva === "gestionProductos" ? "active" : ""
          }`}
          onClick={() => setTabActiva("gestionProductos")}
        >
          ✏️ Editar Productos
        </button>
        <button
          className={`admin-tab ${tabActiva === "slice" ? "active" : ""}`}
          onClick={() => setTabActiva("slice")}
        >
          🎨 Banner (Slice)
        </button>
      </nav>

      {/* Mensaje de feedback */}
      {mensaje && <p className="admin-mensaje">{mensaje}</p>}

      {/* Contenido de cada pestaña */}
      <div className="admin-tab-content">
        {/* PESTAÑA: CARGAR PRODUCTOS */}
        {tabActiva === "productos" && (
          <div className="admin-section">
            <h2>Agregar Nuevo Producto</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input
                  name="producto"
                  value={form.producto}
                  onChange={handleChange}
                  placeholder="Ej: Pizza Napolitana"
                  required
                />
              </div>
              <div className="form-group">
                <label>Precio</label>
                <input
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="Ej: 15000"
                  type="number"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del producto"
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Imagen del Producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.categoria}>
                      {cat.categoria}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? "Cargando..." : "Cargar Producto"}
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA: GESTIÓN DE CATEGORÍAS */}
        {tabActiva === "categorias" && (
          <div className="admin-section">
            <h2>Gestión de Categorías</h2>

            {/* Agregar nueva categoría */}
            <div className="categoria-add-section">
              <h3>Agregar Nueva Categoría</h3>
              <form
                onSubmit={handleAddCategoria}
                className="admin-categorias-form"
              >
                <input
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Nueva categoría"
                  required
                />
                <button type="submit">Agregar</button>
              </form>
            </div>

            {/* Lista de categorías */}
            <div className="categoria-list-section">
              <h3>Categorías Existentes</h3>
              {categorias.length === 0 ? (
                <p className="empty-message">No hay categorías creadas.</p>
              ) : (
                <ul className="admin-categorias-list">
                  {categorias.map((cat) => {
                    if (editandoId === cat.id) {
                      return (
                        <li
                          key={cat.id}
                          className="admin-categoria-item editing"
                        >
                          <form
                            onSubmit={handleEditCategoria}
                            className="admin-categorias-edit-form"
                          >
                            <input
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              placeholder="Nombre"
                              required
                            />
                            <button type="submit" className="btn-save">
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditandoId(null);
                                setEditNombre("");
                              }}
                              className="btn-cancel"
                            >
                              Cancelar
                            </button>
                          </form>
                        </li>
                      );
                    }
                    return (
                      <li key={cat.id} className="admin-categoria-item">
                        <span className="categoria-nombre">
                          {cat.categoria}
                        </span>
                        <div className="categoria-actions">
                          <button
                            onClick={() =>
                              startEditCategoria(cat.id, cat.categoria)
                            }
                            className="btn-edit"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCategoria(cat.id)}
                            className="btn-delete"
                          >
                            Eliminar
                          </button>
                          {confirmDeleteId === cat.id && (
                            <span className="admin-confirm-delete">
                              ¿Seguro?{" "}
                              <button
                                onClick={() => confirmDeleteCategoria(cat.id)}
                              >
                                Sí
                              </button>{" "}
                              <button onClick={() => setConfirmDeleteId(null)}>
                                No
                              </button>
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: GESTIÓN DE PRODUCTOS */}
        {tabActiva === "gestionProductos" && (
          <div className="admin-section">
            <h2>Editar/Eliminar Productos</h2>

            <div className="form-group">
              <label>Filtrar por Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => {
                  setFiltroCategoria(e.target.value);
                  if (e.target.value) fetchProductosFiltrados(e.target.value);
                  else setProductosFiltrados([]);
                }}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.categoria}>
                    {cat.categoria}
                  </option>
                ))}
              </select>
            </div>

            {filtroCategoria && (
              <div className="productos-list-section">
                {productosFiltrados.length === 0 ? (
                  <p className="empty-message">
                    No hay productos en esta categoría.
                  </p>
                ) : (
                  <div className="admin-productos-grid">
                    {productosFiltrados.map((prod) => {
                      if (editProdId === prod.id) {
                        return (
                          <div key={prod.id} className="producto-card editing">
                            <h3>Editando Producto</h3>
                            <form
                              onSubmit={handleEditProducto}
                              className="admin-producto-edit-form"
                            >
                              <div className="form-group">
                                <label>Nombre</label>
                                <input
                                  name="producto"
                                  value={editProdForm.producto}
                                  onChange={handleEditProdChange}
                                  placeholder="Nombre"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Precio</label>
                                <input
                                  name="precio"
                                  value={editProdForm.precio}
                                  onChange={handleEditProdChange}
                                  type="number"
                                  min="0"
                                  placeholder="Precio"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                  name="descripcion"
                                  value={editProdForm.descripcion}
                                  onChange={handleEditProdChange}
                                  placeholder="Descripción"
                                  rows="3"
                                  required
                                />
                              </div>
                              <div className="form-actions">
                                <button type="submit" className="btn-save">
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditProdId(null);
                                    setEditProdForm({
                                      producto: "",
                                      precio: "",
                                      descripcion: "",
                                    });
                                  }}
                                  className="btn-cancel"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          </div>
                        );
                      }
                      return (
                        <div key={prod.id} className="producto-card">
                          <img
                            src={prod.imagen}
                            alt={prod.producto}
                            className="producto-imagen"
                          />
                          <div className="producto-info">
                            <h3>{prod.producto}</h3>
                            <p className="producto-precio">${prod.precio}</p>
                            <p className="producto-descripcion">
                              {prod.descripcion}
                            </p>
                          </div>
                          <div className="producto-actions">
                            <button
                              onClick={() => startEditProducto(prod)}
                              className="btn-edit"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProducto(prod.id)}
                              className="btn-delete"
                            >
                              Eliminar
                            </button>
                          </div>
                          {confirmDeleteProdId === prod.id && (
                            <div className="admin-confirm-delete">
                              ¿Seguro que deseas eliminar?
                              <div className="confirm-actions">
                                <button
                                  onClick={() => confirmDeleteProducto(prod.id)}
                                  className="btn-confirm-yes"
                                >
                                  Sí
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteProdId(null)}
                                  className="btn-confirm-no"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: GESTIÓN DE SLICE (BANNER) */}
        {tabActiva === "slice" && (
          <div className="admin-section">
            <h2>Gestión de Imágenes del Banner</h2>

            {/* Formulario para agregar imagen */}
            <div className="slice-add-section">
              <h3>Agregar Nueva Imagen al Banner</h3>
              <form onSubmit={handleSliceSubmit} className="admin-slice-form">
                <div className="form-group">
                  <label>Selecciona una imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSliceFileChange}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-submit">
                  {loading ? "Subiendo..." : "Agregar Imagen al Banner"}
                </button>
              </form>
            </div>

            {/* Lista de imágenes del slice */}
            <div className="slice-list-section">
              <h3>Imágenes Actuales del Banner</h3>
              {sliceImages.length === 0 ? (
                <p className="empty-message">No hay imágenes en el banner.</p>
              ) : (
                <div className="admin-slice-grid">
                  {sliceImages.map((img) => (
                    <div key={img.id} className="slice-card">
                      <img
                        src={img.imagen_slice}
                        alt="Slice"
                        className="slice-imagen"
                      />
                      <div className="slice-actions">
                        <button
                          onClick={() => handleDeleteSlice(img.id)}
                          className="btn-delete"
                        >
                          Eliminar
                        </button>
                      </div>
                      {confirmDeleteSliceId === img.id && (
                        <div className="admin-confirm-delete">
                          ¿Seguro que deseas eliminar?
                          <div className="confirm-actions">
                            <button
                              onClick={() => confirmDeleteSlice(img.id)}
                              className="btn-confirm-yes"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSliceId(null)}
                              className="btn-confirm-no"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
