import React, { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, Home, Box, Beaker } from "lucide-react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        userMenuRef.current &&
        event.target instanceof Node &&
        !userMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (): void => {
    console.log("Cerrando sesión...");
  };

  const handleSettings = (): void => {
    console.log("Abriendo configuración...");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Botón y menú lateral */}
        <div className="menu-container">
          <button
            className={`menu-toggle ${isSideMenuOpen ? "open" : ""}`}
            onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
          >
            {isSideMenuOpen ? "✖" : "☰"}
          </button>
          {isSideMenuOpen && (
            <div className="menu visible">
              <nav>
                <ul>
                  <li>
                    <Link to="/cliente" onClick={() => setIsSideMenuOpen(false)}>
                      <Home /> Clientes
                    </Link>
                  </li>
                  <li>
                    <Link to="/producto" onClick={() => setIsSideMenuOpen(false)}>
                      <Box /> Productos
                    </Link>
                  </li>
                  <li>
                    <Link to="/laboratorio" onClick={() => setIsSideMenuOpen(false)}>
                      <Beaker /> Laboratorio
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>

        {/* Título */}
        <h1 className="header-title">Sistema de Ventas</h1>

        {/* Icono de Usuario */}
        <div className="user-menu" ref={userMenuRef}>
          <button
            className={`p-2 rounded-full transition-colors ${
              isMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="w-6 h-6 text-gray-600" />
          </button>

          {/* Menú desplegable del usuario */}
          {isMenuOpen && (
            <div className="user-dropdown">
              <button onClick={handleSettings} className="dropdown-item">
                <Settings className="dropdown-icon" />
                Configuración
              </button>
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut className="dropdown-icon" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
