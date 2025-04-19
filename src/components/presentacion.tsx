import { useEffect, useState } from "react";
import NavBarRoot from "./NavBarRoot";


interface Tipo {
  id: number;
  nombre: string;
  nombreCorto: string;
  eliminado?: boolean;
}

function Presentacion() {
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState(""); // Estado para el nombre del tipo
  const [newShortName, setNewShortName] = useState(""); // Estado para el nombre corto
  const [editTipoId, setEditTipoId] = useState<number | null>(null); // ID del tipo en edición

  const filteredTipos = tipos.filter(
    (tipo) =>
      !tipo.eliminado &&
      (tipo.nombre.toLowerCase().includes(search.toLowerCase()) ||
        tipo.nombreCorto.toLowerCase().includes(search.toLowerCase()))
  );

  // Cargar tipos desde el backend al montar el componente
  useEffect(() => {
    fetch("https://farmacia20250407113355.azurewebsites.net/api/Presentaciones/ListarPresentacionesActivos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los tipos");
        }
        return response.json();
      })
      .then((data: Tipo[]) => setTipos(data))
      .catch((error) => console.error("Error al cargar tipos:", error));
  }, []);

  // Función para agregar un nuevo tipo
  const handleAgregar = async () => {
    if (!newName.trim() || !newShortName.trim()) return;

    try {
      const response = await fetch(
        `https://farmacia20250407113355.azurewebsites.net/api/Presentaciones/Crear?nombre=${newName}&nombreCorto=${newShortName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const newTipo: Tipo = await response.json();
        setTipos((prev) => [...prev, newTipo]); // Agregar el nuevo tipo al estado
        setNewName(""); // Limpiar el campo de nombre
        setNewShortName(""); // Limpiar el campo de nombre corto
        console.log("Tipo agregado correctamente.");
      } else {
        console.error(`Error al agregar el tipo: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  // Función para iniciar la edición de un tipo
  const handleEdit = (tipo: Tipo) => {
    setEditTipoId(tipo.id); // Guardar el ID del tipo que se está editando
    setNewName(tipo.nombre); // Cargar el nombre actual en el campo de edición
    setNewShortName(tipo.nombreCorto); // Cargar el nombre corto actual
  };

  // Función para guardar los cambios en la edición
  const handleSaveEdit = async () => {
    if (editTipoId === null || !newName.trim() || !newShortName.trim()) return;

    try {
      const response = await fetch(
        `https://farmacia20250407113355.azurewebsites.net/api/Presentaciones/Actualizar?id=${editTipoId}&nombre=${newName}&nombreCorto=${newShortName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setTipos((prev) =>
          prev.map((tipo) =>
            tipo.id === editTipoId
              ? { ...tipo, nombre: newName, nombreCorto: newShortName }
              : tipo
          )
        );
        setEditTipoId(null); // Salir del modo de edición
        setNewName(""); // Limpiar el campo de nombre
        setNewShortName(""); // Limpiar el campo de nombre corto
        console.log("Tipo actualizado correctamente.");
      } else {
        console.error(`Error al actualizar el tipo: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      const response = await fetch(`https://farmacia20250407113355.azurewebsites.net/api/Presentaciones/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTipos((prev) =>
          prev.map((tipo) =>
            tipo.id === id ? { ...tipo, eliminado: true } : tipo
          )
        );
        console.log(`Tipo con ID ${id} eliminado correctamente.`);
      } else {
        console.error(
          `Error al eliminar el tipo con ID ${id}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <>
   <div className="flex h-screen">
      {/* NavBarRoot ocupa la parte izquierda */}
      <NavBarRoot />

        {/* Contenido principal */}
        <div className="p-4 flex-1 overflow-auto w-1/2">
          {/* Título */}
          <div className="flex flex-col items-center justify-center bg-blue text-white -mr-6 -ml-6 -mt-8 mb-7">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold">Presentacion</h2>
            </div>
          </div>

          {/* Input de búsqueda */}
          <input
            type="text"
            placeholder="Buscar Tipo o Nombre Corto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded"
          />

          {/* Inputs para agregar o editar tipo */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder={editTipoId ? "Editar nombre del tipo" : "Nombre del tipo"}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded"
            />
            <input
              type="text"
              placeholder={
                editTipoId
                  ? "Editar nombre corto del tipo"
                  : "Nombre corto del tipo"
              }
              value={newShortName}
              onChange={(e) => setNewShortName(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded"
            />
            <button style={{background:'blue'}}
              onClick={editTipoId ? handleSaveEdit : handleAgregar}
              className="bg-blue text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
            >
              {editTipoId ? "Guardar" : "Agregar"}
            </button>
          </div>

          {/* Tabla de tipos */}
          <table className="w-full text-sm text-left text-gray bg-white rounded-md shadow">
            <thead className="text-xs uppercase bg-blue text-white">
              <tr>

                <th style={{background:'blue'}}  scope="col" className="px-6 py-3">
                  Tipo
                </th>
                <th  style={{background:'blue'}}  scope="col" className="px-6 py-3">
                  Nombre Corto
                </th>
                <th style={{background:'blue'}}  scope="col" className="px-6 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTipos.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-100 cursor-pointer">
          
                  <td className="px-6 py-4">{tipo.nombre}</td>
                  <td className="px-6 py-4">{tipo.nombreCorto}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(tipo)}
                      className="bg-green text-white px-3 py-1 rounded shadow hover:bg-green-600 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(tipo.id)}
                      className="bg-red text-white px-3 py-1 rounded shadow hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Presentacion;
