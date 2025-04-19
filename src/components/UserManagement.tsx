import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Search, Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import './UserManagement.css';
import 'font-awesome/css/font-awesome.min.css';
import { FaKey } from 'react-icons/fa';
import NavBarRoot from "./NavBarRoot";

interface User {
  id: number;
  nombre: string;
  correo: string;
  usuarioNombre: string;
  password: string;
  estado: string;
  idrol: number;
  permisos: string[];
}

interface Role {
  idRol: number;
  nombre: string;
  estado: string;
}

interface Permission {
  idPermiso: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

interface AlertState {
  show: boolean;
  type: "error" | "success";
  message: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState<User>({
    id: 0,
    nombre: '',
    correo: '',
    usuarioNombre: '',
    password: '',
    estado: 'Activo',
    idrol: 1,
    permisos: []
  });
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: ""
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const responseUsers = await fetch('https://farmacia20250407113355.azurewebsites.net/api/Usuarios/ListarUsuariosActivos');
        
        if (!responseUsers.ok) {
          throw new Error(`HTTP error! status: ${responseUsers.status}`);
        }
        
        const dataUsers = await responseUsers.json();
        
        // Verificar que dataUsers es un array
        if (!Array.isArray(dataUsers)) {
          throw new Error('Los datos recibidos no tienen el formato esperado');
        }
        
        setUsers(dataUsers);
        
        // Similar validación para roles y permisos...
        const responseRoles = await fetch('https://farmacia20250407113355.azurewebsites.net/api/Roles/ListarRoles');
        if (!responseRoles.ok) {
          throw new Error(`HTTP error! status: ${responseRoles.status}`);
        }
        const dataRoles = await responseRoles.json();
        setRoles(dataRoles);
  
        const responsePermissions = await fetch('https://farmacia20250407113355.azurewebsites.net/api/Permisos/ListarPermisos');
        if (!responsePermissions.ok) {
          throw new Error(`HTTP error! status: ${responsePermissions.status}`);
        }
        const dataPermissions = await responsePermissions.json();
        setPermissions(dataPermissions);
  
      } catch (error) {
        showAlert("error", "Error en la solicitud al servidor");
      }
    };
  
    fetchData();
  }, []);  // Runs only once when component mounts

// Llenar formulario al editar usuario
useEffect(() => {
  if (editMode && formData.id) {
    setFormData(formData); // Rellena el formulario con los datos del usuario editado.
  }
}, [editMode, formData]);

const handlePageChange = (page: number) => {
  setCurrentPage(page);
};
const permissionsMap = {
  'Configuración': 1,
  'Usuarios': 2,
  'Clientes': 3,
  'Productos': 4,
  'Ventas': 5,
  'Historial de Ventas': 6,
  'Tipos': 7,
  'Presentación': 8,
  'Laboratorios': 9,
};

const handlePermissionsChange = (permission: string) => {
  // Obtener el número del permiso seleccionado
  const permissionNumber = permissionsMap[permission];

  setSelectedPermissions(prevState => {
    if (prevState.includes(permissionNumber)) {
      return prevState.filter(p => p !== permissionNumber); // Eliminar el número si ya está seleccionado
    } else {
      return [...prevState, permissionNumber]; // Agregar el número del permiso si no está seleccionado
    }
  });

};
const handlePermissionsClick = async (userId) => {
  setSelectedUserId(userId); // Establece el ID del usuario seleccionado

  try {
    // Hacer la solicitud para obtener los permisos del usuario
    const response = await fetch(`https://farmacia20250407113355.azurewebsites.net/api/Detalle_Permisos/ListarDetallePermisosActivosUsuario?id=${userId}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener los permisos del usuario');
    }

    const userPermissions = await response.json();
    console.log("Permisos obtenidos del servidor:", userPermissions); // Depuración

    // Mapear los permisos obtenidos a sus IDs correspondientes
    const permissionIds = userPermissions.map(permission => permission.idpermiso); // Usar idpermiso en lugar de idPermiso
    console.log("IDs de permisos mapeados:", permissionIds); // Depuración

    // Actualizar el estado con los permisos del usuario
    setSelectedPermissions(permissionIds);

    // Mostrar el modal de permisos
    setShowPermissionsModal(true);
  } catch (error) {
    console.error('Error al cargar los permisos del usuario:', error);
    showAlert('error', 'Error al cargar los permisos del usuario');
  }
};
const handleUpdatePermissions = async () => {
  try {
    const requestBody = {
      IdUsuario: selectedUserId, // ID del usuario
      Permisos: selectedPermissions // Array de IDs de permisos
    };

    console.log("Datos enviados al backend:", requestBody); // Depuración

    const response = await fetch(`https://farmacia20250407113355.azurewebsites.net/api/Detalle_Permisos/Crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      showAlert('success', 'Permisos actualizados exitosamente');
      setShowPermissionsModal(false); // Cerrar el modal
    } else {
      const errorData = await response.json(); // Obtener detalles del error
      console.error("Error del backend:", errorData); // Depuración
      showAlert('error', 'Error al actualizar los permisos');
    }
  } catch (error) {
    console.error('Error en la solicitud al servidor:', error); // Depuración
    showAlert('error', 'Error en la solicitud al servidor');
  }
};
const totalPages = Math.ceil(users.length / itemsPerPage);
const fetchUsers = async () => {
  try {
    const response = await fetch('https://farmacia20250407113355.azurewebsites.net/api/Usuarios/ListarUsuariosActivos');
    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }
    const data: User[] = await response.json();
    setUsers(data);
  } catch (error) {
    console.error('Error al cargar los usuarios:', error);
    showAlert('error', 'Error al cargar los usuarios');
  }
};

const showAlert = (type: "error" | "success", message: string) => {
  setAlert({ show: true, type, message });
  setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 3000);
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!formData.nombre || !formData.correo || !formData.usuarioNombre || !formData.password) {
    showAlert('error', 'Todos los campos son obligatorios');
    return;
  }

  try {
    const url = editMode
      ? `https://farmacia20250407113355.azurewebsites.net/api/Usuarios/Actualizar?id=${formData.id}&nombre=${formData.nombre}&correo=${formData.correo}&usuarioNombre=${formData.usuarioNombre}&password=${formData.password}&estado=${formData.estado}&idrol=${formData.idrol}`
      : `https://farmacia20250407113355.azurewebsites.net/api/Usuarios/Crear?nombre=${formData.nombre}&correo=${formData.correo}&usuarioNombre=${formData.usuarioNombre}&password=${formData.password}&estado=${formData.estado}&idrol=${formData.idrol}`;

    const response = await fetch(url, {
      method: editMode ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      showAlert('success', `Usuario ${editMode ? 'modificado' : 'registrado'} exitosamente`);
      fetchUsers();
      handleReset();
    } else {
      showAlert('error', `Error al ${editMode ? 'modificar' : 'registrar'} el usuario`);
    }
  } catch (error) {
    showAlert('error', 'Error en la solicitud al servidor');
  }
};

const handleDelete = async (id: number) => {
  if (window.confirm('¿Está seguro de eliminar este usuario?')) {
    try {
      const response = await fetch(`https://farmacia20250407113355.azurewebsites.net/api/Usuarios/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showAlert('success', 'Usuario eliminado exitosamente');
        fetchUsers();
      } else {
        showAlert('error', 'Error al eliminar el usuario');
      }
    } catch (error) {
      showAlert('error', 'Error en la solicitud al servidor');
    }
  }
};

const handleReset = () => {
  setFormData({
    id: 0,
    nombre: '',
    correo: '',
    usuarioNombre: '',
    password: '',
    estado: 'Activo', // Agrega esta propiedad
    idrol: 1,         // Agrega esta propiedad
    permisos: []
  });
  setEditMode(false);
};

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
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ingrese Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    placeholder="Ingrese Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input
                  type="text"
                  name="usuario"
                  value={formData.usuarioNombre}
                  onChange={(e) => setFormData({ ...formData, usuarioNombre: e.target.value })}
                    placeholder="Ingrese Usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Ingrese Contraseña"
                />
              </div>
              <div className="button-group">
                <button  style={{background:'blue'}}  type="submit" className="btn btn-primary">
                  {editMode ? "Actualizar" : "Registrar"}
                </button>
                <button style={{background:'blue'}}  type="button" onClick={handleReset} className="btn btn-success">
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
              <button style={{background:'blue'}} className="search-button">
                <Search size={18} />
              </button>
            </div>
          </div>
              
          <div  className="overflow-x-auto">
            <table  className="w-full border-collapse table-auto">
              <thead className="bg-blue-800 text-white">
                <tr >
  
                  <th style={{background:'blue'}}  className="p-3 text-left">Nombre</th>
                  <th style={{background:'blue'}}  className="p-3 text-left">Email</th>
                  <th style={{background:'blue'}}  className="p-3 text-left">Usuario</th>
                  <th style={{background:'blue'}}  className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
              {users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                  
                    <td className="p-3">{user.nombre}</td>
                    <td className="p-3">{user.correo}</td>
                    <td className="p-3">{user.usuarioNombre}</td>
                    <td className="p-3 text-center">
                      <button style={{background:'blue'}} 
                        className="btn btn-warning" 
                        onClick={() => {
                          setEditMode(true);
                          setFormData(user);
                        }}
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
  className="text-lg font-bold bg-blue"
  onClick={() => {
    setSelectedUserId(user.id);
     handlePermissionsClick(user.id)// Establece el ID del usuario seleccionado
   }}
>
  <FaKey size={18} />
</button>


                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
            Mostrando registros del {(currentPage - 1) * itemsPerPage + 1} al {Math.min(currentPage * itemsPerPage, users.length)} de un total de {users.length} registros
            </div>
            <div className="pagination-buttons">
  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
    Anterior
  </button>
  <span className="mx-2">Página {currentPage} de {totalPages}</span>
  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
    Siguiente
  </button>
</div>
          </div>
        </CardContent>
      </Card>
      {showPermissionsModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h3 className="text-xl font-semibold mb-4 ">Editar Permisos</h3>
      <div className="permissions-list">
        {[
          'Configuración',
          'Usuarios',
          'Clientes',
          'Productos',
          'Ventas',
          'Historial de Ventas',
          'Tipos',
          'Presentación',
          'Laboratorios'
        ].map((permission) => {
          const permissionNumber = permissionsMap[permission];

          return (
            <div key={permission} className="permission-item">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permissionNumber)} // Verifica si el permiso está seleccionado
                onChange={() => handlePermissionsChange(permission)} // Cambia el estado cuando se selecciona un permiso
              />
              <label className="ml-2">{permission}</label>
            </div>
          );
        })}
      </div>
      <div className="modal-footer">
        <button 
          className="btn btn-primary" 
          style={{background:'blue'}}
          onClick={handleUpdatePermissions}
        >
          Modificar Cambios
        </button>
        <button 
          className="btn btn-secondary bg-red"
          onClick={() => {
            setShowPermissionsModal(false);
            setSelectedPermissions([]); // Limpiar los permisos seleccionados
          }}
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

export default UserManagement;