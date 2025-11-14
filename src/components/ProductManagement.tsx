import React, { useEffect, useState } from "react";
import { Trash2, Edit2, Search } from "lucide-react";
import NavBarRoot from "./NavBarRoot";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import "./ProductManagement.css";

// Interfaces
interface Product {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  concentracion: number;
  casilla: number;
  vencimiento: string;
  idpresentacion: number;
  idlaboratorio: number;
  idtipo: number;
  eliminado?: boolean;
  precio_compra:number
}

interface Tipo {
  id: number;
  nombre: string;
  eliminado?: boolean;
}

interface Laboratory {
  id: number;
  laboratorioNombre: string;
  direccion: string;
  eliminado?: boolean;
}

interface Presentacion {
  id: number;
  nombre: string;
  nombreCorto: string;
}

interface AlertState {
  show: boolean;
  type: "error" | "success";
  message: string;
}

// Estado inicial para un producto
const initialProductState: Partial<Product> = {
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  concentracion: 0,
  casilla: 0,
  vencimiento: '',
  idpresentacion: 0,
  idlaboratorio: 0,
  idtipo: 0,
  precio_compra: 0,
};

// Componente principal
const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tipo, setTipos] = useState<Tipo[]>([]);
  const [presentacion, setPresentacion] = useState<Presentacion[]>([]);
  const [laboratorio, setLaboratorio] = useState<Laboratory[]>([]);
  const [editProducto, setEditProducto] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(initialProductState);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: ""
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, tiposRes, laboratoriosRes, presentacionRes] = await Promise.all([
          fetch("https://farmaciamontecinoweb.onrender.com/api/Productos/listarProductosConMenorStock"),
          fetch("https://farmaciamontecinoweb.onrender.com/api/Tipos/ListarTiposActivos"),
          fetch("https://farmaciamontecinoweb.onrender.com/api/Laboratorios/ListarLaboratoriosActivos"),
          fetch("https://farmaciamontecinoweb.onrender.com/api/Presentaciones/ListarPresentacionesActivos")
        ]);

        const [dataProductos, dataTipos, dataLaboratorios, dataPresentacion] = await Promise.all([
          productsRes.json(),
          tiposRes.json(),
          laboratoriosRes.json(),
          presentacionRes.json()
        ]);

        setProducts(dataProductos);
        setTipos(dataTipos);
        setLaboratorio(dataLaboratorios);
        setPresentacion(dataPresentacion);
      } catch (error) {
        showAlert("error", "Error al cargar los datos");
      }
    };

    fetchData();
  }, []);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['precio', 'stock', 'concentracion', 'casilla', 'idpresentacion', 'idlaboratorio', 'idtipo'].includes(name)
        ? Number(value)
        : value
    }));
  };

  // Manejar edición de producto
  const handleEdit = (product: Product) => {
    setEditProducto(product);
    setFormData(product);
  };

  // Manejar eliminación de producto
  const handleEliminar = async (id: number) => {
    try {
      const response = await fetch(`https://farmaciamontecinoweb.onrender.com/api/Productos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(product => product.id !== id));
        showAlert('success', 'Producto eliminado correctamente');
      } else {
        throw new Error('Error al eliminar el producto');
      }
    } catch (error) {
      showAlert("error", "Error al eliminar el producto");
    }
  };

  // Manejar agregar nuevo producto
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    if (!formData.codigo || !formData.nombre || !formData.descripcion || !formData.precio || 
        !formData.stock || !formData.vencimiento || !formData.idtipo || 
        !formData.idlaboratorio || !formData.idpresentacion|| !formData.precio_compra) {
      showAlert("error", "Por favor complete todos los campos requeridos");
      return;
    }

    try {
      const response = await fetch(
        `https://farmaciamontecinoweb.onrender.com/api/Productos/Crear?codigo=${formData.codigo}&nombre=${formData.nombre}&descripcion=${formData.descripcion}&precio=${formData.precio}&stock=${formData.stock}&vencimiento=${formData.vencimiento}&idtipo=${formData.idtipo}&idlaboratorio=${formData.idlaboratorio}&concentracion=${formData.concentracion}&casilla=${formData.casilla}&idpresentacion=${formData.idpresentacion}&precio_compra=${formData.precio_compra}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      
      if (response.ok) {
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
        showAlert('success', 'Producto agregado correctamente');
        handleReset();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar el producto');
      }
    } catch (error) {
      showAlert("error", error instanceof Error ? error.message : "Error al agregar el producto");
    }
  };

  // Manejar actualización de producto
  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editProducto?.id) {
      showAlert("error", "No hay producto seleccionado para editar");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('id', editProducto.id.toString());
      params.append('codigo', formData.codigo || '');
      params.append('nombre', formData.nombre || '');
      params.append('descripcion', formData.descripcion || '');
      params.append('precio', formData.precio?.toString() || '0');
      params.append('stock', formData.stock?.toString() || '0');
      params.append('concentracion', formData.concentracion?.toString() || '0');
      params.append('casilla', formData.casilla?.toString() || '0');
      params.append('vencimiento', formData.vencimiento || '');
      params.append('idpresentacion', formData.idpresentacion?.toString() || '0');
      params.append('idlaboratorio', formData.idlaboratorio?.toString() || '0');
      params.append('idtipo', formData.idtipo?.toString() || '0');
       params.append('precio_compra', formData.precio_compra?.toString() || '0');

      const url = `https://farmaciamontecinoweb.onrender.com/api/Productos/Actualizar?${params.toString()}`;
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el producto');
      }

      const updatedProduct = await response.json();
      
      // Actualizar el estado local
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      
      showAlert('success', 'Producto actualizado correctamente');
      handleReset();
    } catch (error) {
      showAlert('error', error instanceof Error ? error.message : 'Error al actualizar el producto');
    }
  };

  // Resetear formulario
  const handleReset = () => {
    setFormData(initialProductState);
    setEditProducto(null);
  };

  // Mostrar alertas
  const showAlert = (type: "error" | "success", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 5000);
  };

  // Lógica de búsqueda y filtrado
  const filteredProductos = products.filter(product => 
    !product.eliminado &&
    (product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Lógica de paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProductos.length);
  const currentProducts = filteredProductos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex h-screen">
      <NavBarRoot />
      <div className="p-4 flex-1 overflow-auto">
        <div className="flex flex-col items-center justify-center bg-blue text-white -mr-6 -ml-6 -mt-8 mb-7">
          <h2 className="text-3xl font-bold py-8">Productos</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {alert.show && (
              <Alert type={alert.type} className="mb-4">
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

        <form onSubmit={editProducto ? handleActualizar : handleAgregar} className="product-form">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Código de Barras */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Código de Barras 
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ingrese código de barras"
                    required
                  />
                </div>

                {/* Nombre del Producto */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Producto 
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ingrese nombre del Producto"
                    required
                  />
                </div>

                {/* Descripción */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion || ''}
                    onChange={handleInputChange}
                    className="form-input h-32 resize-none"
                    placeholder="Ingrese descripción"
                    required
                  />
                </div>

                {/* Tipo */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Tipo 
                  </label>
                  <select
                    name="idtipo"
                    value={formData.idtipo || ''}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-blue focus:border-blue"
                    required
                  >
                    <option value="">Seleccione un Tipo</option>
                    {tipo.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        {tp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Concentración */}
                <div className="form-group space-y-1">
                  <label className="block text-sm font-medium text-black text-center">
                    Concentración 
                  </label>
                  <input 
                    type="text"
                    name="concentracion"
                    value={formData.concentracion || 0}
                    onChange={handleInputChange}
                    className="form-input2"
                    placeholder="N"
                    required
                  />
                </div>

                {/* Presentación */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Presentación 
                  </label>
                  <select
                    name="idpresentacion"
                    value={formData.idpresentacion || ''}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-blue focus:border-blue"
                    required
                  >
                    <option value="">Seleccione una presentación</option>
                    {presentacion.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        {tp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Laboratorio */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Laboratorio 
                  </label>
                  <select
                    name="idlaboratorio"
                    value={formData.idlaboratorio || ''}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-blue focus:border-blue"
                    required
                  >
                    <option value="">Seleccione Laboratorio</option>
                    {laboratorio.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        {tp.laboratorioNombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Precio */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Precio 
                  </label>
                  <input
                    type="Text"
                    name="precio"
                    value={formData.precio || 0}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ingrese precio"
                    required
                  />
                </div>
                     {/* Precio */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Precio Compra
                  </label>
                  <input
                    type="Text"
                    name="precio_compra"
                    value={formData.precio_compra || 0}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ingrese precio"
                    required
                  />
                </div>

                {/* Stock */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Stock 
                  </label>
                  <input
                    type="text"
                    name="stock"
                    value={formData.stock || 0}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ingrese stock"
                    required
                  />
                </div>

                {/* Casilla */}
                <div className="form-group space-y-1">
                  <label className="block text-sm font-medium text-black text-center">
                    Casilla 
                  </label>
                  <input  
                    type="text"
                    name="casilla"
                    value={formData.casilla || 0}
                    onChange={handleInputChange}
                    className="form-input2"
                    placeholder="N"
                    required
                  />
                </div>

                {/* Fecha de Vencimiento */}
                <div className="form-group space-y-2">
                  <label className="block text-sm font-medium text-black text-center">
                    Fecha de Vencimiento 
                  </label>
                  <input
                    type="date"
                    name="vencimiento"
                    value={formData.vencimiento || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                {/* Botones */}
                <div className="form-group flex flex-col space-y-4 mt-8 text-center col-span-full">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    style={{background: 'blue'}}
                  >
                    {editProducto ? "Actualizar Producto" : "Registrar Producto"}
                  </button>
                  <button 
                    type="submit"
                    onClick={handleReset}
                    className="btn-primary"
                    style={{background: 'blue'}}
                  >
                    Nuevo
                  </button>
                </div>
              </div>
            </form>

            {/* Tabla de Productos */}
            <div className="overflow-x-auto mt-8">
              <div className="search-container flex mb-4">
                <input
                  type="text"
                  className=""
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Resetear a la primera página al buscar
                  }}
                />
                <button
                  style={{ background: 'blue' }}
                  className="search-button text-white px-4 rounded-r hover:bg-blue-600 transition"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  <Search size={18} />
                </button>
              </div>
              
              <table className="w-full border-collapse table-auto">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Código</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Nombre</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Descripción</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Tipo</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Presentación</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Laboratorio</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Precio Compra</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Precio</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Stock</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Casilla</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Fecha Venc.</th>
                    <th style={{background:'blue'}} className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductos.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        {searchTerm ? "No se encontraron productos que coincidan con la búsqueda" : "No hay productos registrados"}
                      </td>
                    </tr>
                  ) : (
                    currentProducts.map((product) => {
                      const tipoNombre = tipo.find((tp) => tp.id === product.idtipo)?.nombre || "Desconocido";
                      const laboratorioNombre = laboratorio.find((lab) => lab.id === product.idlaboratorio)?.laboratorioNombre || "Desconocido";
                      const presentacionNombre = presentacion.find((pre) => pre.id === product.idpresentacion)?.nombreCorto || "Desconocido";

                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">{product.codigo}</td>
                          <td className="px-4 py-2 border">{product.nombre}</td>
                          <td className="px-4 py-2 border">{product.descripcion}</td>
                          <td className="px-4 py-2 border">{tipoNombre}</td>
                          <td className="px-4 py-2 border">{product.concentracion && `${product.concentracion} ${presentacionNombre}`}</td>
                          <td className="px-4 py-2 border">{laboratorioNombre}</td>
                           <td className="px-4 py-2 border">{product.precio_compra.toFixed(2)}Bs</td>
                          <td className="px-4 py-2 border">{product.precio.toFixed(2)}Bs</td>
                          <td className="px-4 py-2 border">{product.stock}</td>
                          <td className="px-4 py-2 border">{product.casilla}</td>
                          <td className="px-4 py-2 border">{product.vencimiento}</td>
                          <td className="px-4 py-2 border flex gap-2">
                            <button 
                              style={{background:'blue'}}  
                              className="btn btn-warning p-1 rounded text-white" 
                              onClick={() => handleEdit(product)}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              className="btn btn-danger p-1 rounded text-white bg-red-500" 
                              onClick={() => handleEliminar(product.id)}
                            >
                              <Trash2 size={18}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {filteredProductos.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Mostrando registros del {startIndex + 1} al {Math.min(endIndex, filteredProductos.length)} 
                  de un total de {filteredProductos.length} registros
                </div>
                <div className="pagination-buttons flex gap-2">
                  <button 
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <button 
                    style={{background:'blue'}} 
                    className="px-3 py-1 rounded text-white"
                  >
                    {currentPage}
                  </button>
                  <button 
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductManagement;