import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoPeopleSharp } from "react-icons/io5";
import { IoMdPerson } from "react-icons/io";
import { FcDataConfiguration } from "react-icons/fc";
import { BsMenuButtonWide } from "react-icons/bs";
import { FaProductHunt } from "react-icons/fa";
import { FaFlask } from "react-icons/fa6";
import { MdOutlinePointOfSale } from "react-icons/md";
import { FaCartPlus } from "react-icons/fa";
import { FaTags } from "react-icons/fa";
import icono from '../img/logo1.png';
import { FcBusinessman } from "react-icons/fc";

function NavBarRoot() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsAuthenticated(true);
      fetchUserPermissions(userId);
    }
  }, []);

  const fetchUserPermissions = async (userId) => {
    try {
      const response = await fetch(`https://farmaciamontecinoweb.onrender.com/api/Detalle_Permisos/ListarDetallePermisosActivosUsuario?id=${userId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los permisos');
      }
      const data = await response.json();
      setUserPermissions(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const hasPermission = (permissionId) => {
    return userPermissions.some(perm => perm.idpermiso === permissionId && perm.estado === "Activo");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    navigate("/"); // Redirigir a Home tras cerrar sesión
  };

  return (
    <div className="flex">
      {/* Navbar en columna */}
      <nav className="bg-blue text-white h-screen w-56 flex flex-col items-center py-5">
        <div className="mb-5">
          <a href="/home"> <img src={icono} alt="Icon" className="w-32 h-20" />
          </a>
        </div>
        <ul className="flex flex-col gap-6">
          {hasPermission(2) && (
            <li>
              <a href="/usuario" className="hover:text-gray-300 flex items-center gap-2">
                <IoMdPerson /> Usuarios
              </a>
            </li>
          )}

          {hasPermission(1) && (
            <li>
              <a href="/configuracion" className="hover:text-gray-300 flex items-center gap-2">
                <FcDataConfiguration /> Configuracion
              </a>
            </li>
          )}

          {hasPermission(7) && (
            <li>
              <a href="/tipos" className="hover:text-gray-300 flex items-center gap-2">
                <FaTags /> Tipos
              </a>
            </li>
          )}

          {hasPermission(8) && (
            <li>
              <a href="/presentacion" className="hover:text-gray-300 flex items-center gap-2">
                <BsMenuButtonWide /> Presentacion
              </a>
            </li>
          )}

          {hasPermission(9) && (
            <li>
              <a href="/laboratorio" className="hover:text-gray-300 flex items-center gap-2">
                <FaFlask />Laboratorio
              </a>
            </li>
          )}

          {hasPermission(4) && (
            <li>
              <a href="/producto" className="hover:text-gray-300 flex items-center gap-2">
                <FaProductHunt /> Producto
              </a>
            </li>
          )}

          {hasPermission(3) && (
            <li>
              <a href="/clientes" className="hover:text-gray-300 flex items-center gap-2">
                <IoPeopleSharp />Clientes
              </a>
            </li>
          )}

          {hasPermission(5) && (
            <li>
              <a href="/ventas" className="hover:text-gray-300 flex items-center gap-2">
                <MdOutlinePointOfSale /> Ventas
              </a>
            </li>
          )}

          {hasPermission(6) && (
            <li>
              <a href="/historialVentas" className="hover:text-gray-300 flex items-center gap-2">
                <FaCartPlus />
                H.Ventas
              </a>
            </li>
          )}

          {isAuthenticated ? (
            <>
              <li>
                <button
                  onClick={handleLogout}
                  className=" text-white px-3 py-2 rounded hover:bg-red bg-blue w-48"
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li>
              <a
                href="/login"
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                Iniciar Sesión/Registrarse
              </a>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default NavBarRoot;