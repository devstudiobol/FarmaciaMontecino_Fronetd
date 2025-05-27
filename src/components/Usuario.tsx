import React, { useEffect } from 'react';
import { Trash2, Edit2, Search, Plus, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

import './Usuario.css';
import { FaKey } from 'react-icons/fa';
import NavBarRoot from "./NavBarRoot";
import { useState } from 'react';

// Define interface for User
interface User {
  id: number;
  nombre: string;
  correo: string;
  usuarioNombre: string;
  password: string;
  permisos: string[]; 
  idrol:number;// Agregamos el campo permisos
}

// Define interface for Alert
interface AlertState {
  show: boolean;
  type: "error" | "success"; // Cambiado de string a literales de tipo
  message: string;
}

const Usuario: React.FC = () => {
  const [users, setUsers] = useState<User[]>([ ]);

  const [formData, setFormData] = useState<User>({
    id: 0,
    nombre: "",
    correo: "",
    usuarioNombre: "",
    password: "",
    permisos: [],
    idrol: 1, // Establece un valor por defecto
  });
  

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success", // Usa un valor válido como predeterminado
    message: ""
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const showAlert = (type: "error" | "success", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 3000);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Validar que todos los campos estén completos
    if (!formData.nombre || !formData.correo || !formData.usuarioNombre || !formData.password || formData.idrol === 0) {
      showAlert("error", "Todos los campos son obligatorios");
      return;
    }
  
    try {
      let response;
      if (editMode) {
        // Si estamos en modo de edición, actualizamos el usuario
        response = await fetch(
          `http://localhost:5000/api/Usuarios/Actualizar?id=${formData.id}&nombre=${formData.nombre}&correo=${formData.correo}&usuarionombre=${formData.usuarioNombre}&password=${formData.password}`,
          { method: "PUT" } // Usamos PUT para actualizar
        );
      } else {
        // Si no estamos en modo de edición, creamos un nuevo usuario
        response = await fetch(
          `http://localhost:5000/api/Usuarios/Crear?nombre=${formData.nombre}&correo=${formData.correo}&usuarionombre=${formData.usuarioNombre}&password=${formData.password}&idrol=${formData.idrol}`,
          { method: "POST" }
        );
      }
  
      if (!response.ok) {
        throw new Error("Error al guardar el usuario");
      }
  
      const savedUser: User = await response.json(); // Asumimos que el API retorna el usuario actualizado o creado
      if (editMode) {
        // Si es edición, actualizamos el usuario en el estado
        setUsers(users.map((user) => (user.id === savedUser.id ? savedUser : user)));
        showAlert("success", "Usuario actualizado exitosamente");
      } else {
        // Si es creación, agregamos el nuevo usuario al estado
        setUsers([...users, savedUser]);
        showAlert("success", "Usuario registrado exitosamente");
      }
  
      handleReset(); // Reseteamos el formulario
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      showAlert("error", "Hubo un problema al guardar el usuario");
    }
  };
  
  const handleEdit = (user: User) => {
    setFormData(user);
    setEditMode(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // Hacer la solicitud DELETE a la API
      const response = await fetch(`http://localhost:5000/api/Usuarios/${id}`, {
        method: 'DELETE',
      });
  
      // Verificar si la solicitud fue exitosa
      if (response.ok) {
        // Actualizar el estado local para marcar el usuario como eliminado
        setUsers((prev) =>
          prev.map((tipos) =>
            tipos.id === id ? { ...tipos, eliminado: true } : tipos
          )
        );
        console.log(`Usuario con ID ${id} eliminado correctamente.`);
      } else {
        console.error(`Error al eliminar el usuario con ID ${id}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };
  const handleReset = () => {
    setFormData({
      id: 0,
      nombre: '',
      email: '',
      usuario: '',
      contrasena: '',
      permisos: []
    });
    setEditMode(false);
  };

  const handlePermissionsChange = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(item => item !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const handleUpdatePermissions = () => {
    const updatedUsers = users.map(user =>
      user.id === formData.id ? { ...user, permisos: selectedPermissions } : user
    );
    setUsers(updatedUsers);
    setShowPermissionsModal(false);
    showAlert('success', 'Permisos actualizados correctamente');
  };

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);

const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentUsers = filteredUsers.slice(startIndex, endIndex);

const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

useEffect(()=>{
  fetch('http://localhost:5000/api/Usuarios/ListarUsuariosActivos').then((response) => {
    if (!response.ok) {
      throw new Error("Error al obtener los tipos");
    }
    return response.json();
  })
  .then((data: User[]) => setUsers(data))
  .catch((error) => console.error("Error al cargar tipos:", error));
}, []);


const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="flex h-screen">
      {/* NavBarRoot ocupa la parte izquierda */}
      <NavBarRoot />
      <div className="p-4 flex-1 overflow-auto w-1/2">
      <div className="flex flex-col items-center justify-center bg-blue text-white -mr-6 -ml-6 -mt-8 mb-7">
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold">Usuarios</h2>
          </div>
        </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Gestión de Usuarios - Farmacia
          </CardTitle>
        </CardHeader>
        <CardContent>
        {alert.show && (
  <Alert type={alert.type} className="mb-4">
    <AlertDescription>{alert.message}</AlertDescription>
  </Alert>
)}

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="Ingrese Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input
                  type="text"
                  name="usuarioNombre"
                  value={formData.usuarioNombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese Usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ingrese Contraseña"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  {editMode ? "Actualizar" : "Registrar"}
                </button>
                <button type="button" onClick={handleReset} className="btn btn-success">
                  Nuevo
                </button>
              </div>
            </div>
          </form>

          <div className="table-controls">
            <div className="flex items-center gap-2">
              <span className="text-sm">Mostrar</span>
              <select 
                className="border rounded p-1" 
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm">registros</span>
            </div>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-auto">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Usuario</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    
                    <td className="p-3">{user.nombre}</td>
                    <td className="p-3">{user.correo}</td>
                    <td className="p-3">{user.usuarioNombre}</td>
                    <td className="p-3 text-center">
                      <button 
                        className="btn btn-warning" 
                        onClick={() => handleEdit(user)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        className="btn btn-purple" 
                        onClick={() => {
                        setFormData(user);
                        setSelectedPermissions(user.permisos);
                        setShowPermissionsModal(true);
                        }}
                        >
                        <FaKey />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Mostrando registros del 1 al {filteredUsers.length} de un total de {filteredUsers.length} registros
            </div>
            <div className="pagination-buttons">
  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
    Anterior
  </button>
  <button className="px-3 py-1 active">{currentPage}</button>
  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
    Siguiente
  </button>
</div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Permissions */}
      {showPermissionsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="text-xl font-semibold mb-4">Editar Permisos</h3>
            <div className="permissions-list">
              {[
                'Configuración',
                'Usuarios',
                'Clientes',
                'Productos',
                'Ventas',
                'Nueva Venta',
                'Tipos',
                'Presentación',
                'Laboratorios'
              ].map((permission) => (
                <div key={permission} className="permission-item">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionsChange(permission)}
                  />
                  <label className="ml-2">{permission}</label>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary" 
                onClick={handleUpdatePermissions}
              >
                Modificar Cambios
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPermissionsModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    
  );
};

export default Usuario;