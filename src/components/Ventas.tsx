import { useEffect, useState } from "react";
import NavBarRoot from "./NavBarRoot";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  Search,
  User,
  Package,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: any;
  }
}

interface Venta {
  id: number;
  total: number;
  fecha: string;
  idusuario: number;
  idcliente: number;
}

interface Detalle_Ventas {
  id: number;
  cantidad: number;
  descuento: number;
  precio: number;
  total: number;
  idproducto: number;
  idventa: number;
}

interface Clientes {
  id: number;
  nombre: string;
  apellido: string;
  telefono: number;
  direccion: string;
  eliminado?: boolean;
}

interface Producto {
  id: number;
  stock: number;
  casilla: number;
  nombre: string;
  descripcion: string;
  precio: number;
  concentracion: number;
  eliminado?: boolean;
  idpresentacion: number;
  idlaboratorio: number;
  idtipo: number;
}

interface Tipo {
  id: number;
  nombre: string;
}

interface Presentacion {
  id: number;
  nombreCorto: string;
}

interface Laboratory {
  id: number;
  laboratorioNombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
}

function Ventas() {
  const [usuarios, setUsuarios] = useState<Clientes[]>([]);
  const [producto, setProducto] = useState<Producto[]>([]);
  const [venta, setVenta] = useState<Venta[]>([]);
  const [Dventa, setDVenta] = useState<Detalle_Ventas[]>([]);
  const [addVenta, setAddVenta] = useState<Partial<Venta>>({
    fecha: "",
    total: 0,
    idusuario: 0,
    idcliente: 0, // Asegúrate de tener este valor
  });

  const [tipo, setTipos] = useState<Tipo[]>([]);
  const [presentacion, setPresentacion] = useState<Presentacion[]>([]);
  const [laboratorio, setLaboratorio] = useState<Laboratory[]>([]);
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [search, setSearch] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [selectedUser, setSelectedUser] = useState<Clientes | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto[]>([]);
  const [cantidadProducto, setCantidadProducto] = useState<{
    [key: number]: number;
  }>({});
  useEffect(() => {
    const nuevoTotal = selectedProducto.reduce((total, producto) => {
      const cantidad = cantidadProducto[producto.id] || 0;
      return total + cantidad * producto.precio;
    }, 0);
    setTotalGeneral(nuevoTotal);
  }, [selectedProducto, cantidadProducto]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time function
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProductos = await fetch(
          "https://farmacia20250407113355.azurewebsites.net/api/Productos/ListarProductosActivos"
        );
        const dataProductos = await responseProductos.json();
        setProducto(dataProductos);

        const responseVentas = await fetch(
          "https://farmacia20250407113355.azurewebsites.net/api/Ventas/ListarVentasActivos"
        );
        const dataVentas = await responseVentas.json();
        setVenta(dataVentas);

        const responseUsuario = await fetch(
          "https://farmacia20250407113355.azurewebsites.net/api/Clientes/ListarClientesActivos"
        );
        const dataUsuarios = await responseUsuario.json();
        setUsuarios(dataUsuarios);

        const responseDVenta = await fetch(
          "https://farmacia20250407113355.azurewebsites.net/api/Detalle_Ventas/ListarDetalleVentasActivos"
        );
        const dataDventa = await responseDVenta.json();
        setDVenta(dataDventa);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      const responseTipos = await fetch(
        "https://farmacia20250407113355.azurewebsites.net/api/Tipos/ListarTiposActivos"
      );
      const dataTipos = await responseTipos.json();
      setTipos(dataTipos);

      const responseLaboratorios = await fetch(
        "https://farmacia20250407113355.azurewebsites.net/api/Laboratorios/ListarLaboratoriosActivos"
      );
      const dataLaboratorios = await responseLaboratorios.json();
      setLaboratorio(dataLaboratorios);

      const responsePresentacion = await fetch(
        "https://farmacia20250407113355.azurewebsites.net/api/Presentaciones/ListarPresentacionesActivos"
      );
      const dataPresentacion = await responsePresentacion.json();
      setPresentacion(dataPresentacion);
    };

    fetchData();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    productoId: number
  ) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 0) return;
    setCantidadProducto((prev) => ({
      ...prev,
      [productoId]: value,
    }));
  };

  const calcularTotal = () => {
    return selectedProducto.reduce((acumulado, producto) => {
      const cantidad = cantidadProducto[producto.id] || 0;
      return acumulado + cantidad * producto.precio;
    }, 0);
  };

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    if (
      !addVenta.fecha ||
      totalGeneral <= 0 ||
      !selectedUser ||
      !selectedUser.id
    ) {
      console.error("Faltan campos requeridos");
      return;
    }

    // Obtener el ID del usuario desde el localStorage
    const iduser = localStorage.getItem("userId");

    // Construir los parámetros de la consulta para crear la venta
    const queryParams = new URLSearchParams({
      fecha: addVenta.fecha,
      total: totalGeneral.toString(),
      idusuario: iduser ? iduser : "0",
      idcliente: selectedUser.id.toString(),
    }).toString();

    try {
      // Crear la venta
      const responseVenta = await fetch(
        `https://farmacia20250407113355.azurewebsites.net/api/Ventas/Crear?${queryParams}`,
        {
          method: "POST",
        }
      );

      if (!responseVenta.ok) {
        throw new Error("Error al crear la venta.");
      }

      // Obtener la respuesta de la venta creada
      const newVenta = await responseVenta.json();
      const idventa = newVenta.id; // Obtener el ID de la venta generada

      // Crear los detalles de la venta para cada producto seleccionado
      for (const producto of selectedProducto) {
        const cantidad = cantidadProducto[producto.id] || 0;
        const totalProducto = cantidad * producto.precio;

        // Construir los parámetros de la consulta para crear el detalle de la venta
        const queryParamsDetalle = new URLSearchParams({
          cantidad: cantidad.toString(),
          descuento: "0", // Puedes ajustar esto si tienes descuentos
          precio: producto.precio.toString(),
          total: totalProducto.toString(),
          idproducto: producto.id.toString(),
          idventa: idventa.toString(),
        }).toString();

        // Crear el detalle de la venta
        const responseDetalle = await fetch(
          `https://farmacia20250407113355.azurewebsites.net/api/Detalle_Ventas/Crear?${queryParamsDetalle}`,
          {
            method: "POST",
          }
        );

        if (!responseDetalle.ok) {
          throw new Error("Error al crear el detalle de la venta.");
        }
      }

      // Actualizar el estado de la venta
      setVenta([...venta, newVenta]);

      // Limpiar el estado después de la creación exitosa
      setAddVenta({});
      setSelectedProducto([]);
      setCantidadProducto({});
      setTotalGeneral(0);

      // Generar PDF
      const generarPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Agregar un fondo de color suave en la parte superior
        doc.setFillColor(235, 247, 255);
        doc.rect(0, 0, pageWidth, 40, "F");

        // Título principal
        doc.setFontSize(24);
        doc.setTextColor(44, 62, 80);
        doc.setFont("helvetica", "bold");
        doc.text("FACTURA DE VENTA", pageWidth / 2, 20, { align: "center" });

        // Información de la farmacia (encabezado)
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(52, 73, 94);
        doc.text("FARMACIA MEDICITY S.A.", 14, 35);
        doc.setFontSize(10);
        doc.text("Dirección: Av. Principal #452", 14, 42);
        doc.text("Tel: (951) 456-7890", 14, 48);

        // Línea divisoria
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(14, 52, pageWidth - 14, 52);

        // Información del cliente y la venta
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN DEL CLIENTE", 14, 62);

        doc.setFont("helvetica", "normal");
        doc.text(
          `Cliente: ${selectedUser.nombre} ${selectedUser.apellido}`,
          14,
          70
        );
        doc.text(`Teléfono: ${selectedUser.telefono}`, 14, 76);
        doc.text(
          `Fecha: ${new Date(addVenta.fecha || "").toLocaleDateString()}`,
          pageWidth - 60,
          70
        );
        doc.text(
          `No. Proforma: ${Math.floor(Math.random() * 10000)}`,
          pageWidth - 60,
          76
        );

        // Tabla de productos
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("DETALLE DE PRODUCTOS", 14, 90);

        const tableColumn = [
          "Descripción",
          "Precio Unit.",
          "Cantidad",
          "Subtotal",
        ];

        const tableRows = selectedProducto.map((producto) => [
          producto.nombre,
          `Bs${producto.precio.toFixed(2)}`,
          cantidadProducto[producto.id] || 0,
          `Bs${((cantidadProducto[producto.id] || 0) * producto.precio).toFixed(
            2
          )}`,
        ]);

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 95,
          theme: "grid",
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 10,
            halign: "center",
          },
          bodyStyles: {
            fontSize: 9,
            halign: "center",
          },
          columnStyles: {
            0: { halign: "left" },
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
        });

        // Total
        const finalY = doc.lastAutoTable.finalY || 150;
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 80, finalY + 10, pageWidth - 14, finalY + 10);

        doc.setFont("helvetica", "bold");
        doc.text("TOTAL:", pageWidth - 80, finalY + 18);
        doc.text(`${totalGeneral.toFixed(2)} Bs`, pageWidth - 25, finalY + 18, {
          align: "right",
        });

        // Pie de página
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(128, 128, 128);
        doc.text("Esta proforma es válida por 7 días.", 14, pageHeight - 20);
        doc.text(
          `Generado el ${new Date().toLocaleString()}`,
          pageWidth - 14,
          pageHeight - 20,
          { align: "right" }
        );

        // Guardar el PDF
        doc.save(`proforma${selectedUser.nombre}${selectedUser.apellido}_${addVenta.fecha}.pdf`);
      };

      generarPDF(); // Llamar a la función para generar el PDF
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };
  const handleSelectProducto = (producto: Producto) => {
    setSelectedProducto((prevSelected) => {
      if (prevSelected.some((p) => p.id === producto.id)) {
        // Si el producto ya está seleccionado, lo eliminamos
        return prevSelected.filter((p) => p.id !== producto.id);
      } else {
        // Si el producto no está seleccionado, lo agregamos
        return [...prevSelected, producto];
      }
    });

    // Si el producto se elimina de la selección, también eliminamos su cantidad
    if (selectedProducto.some((p) => p.id === producto.id)) {
      setCantidadProducto((prev) => {
        const newCantidadProducto = { ...prev };
        delete newCantidadProducto[producto.id];
        return newCantidadProducto;
      });
    }
  };

  const filteredUsuarios = search
    ? usuarios.filter(
        (usuario) =>
          !usuario.eliminado &&
          usuario.nombre.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const filteredProducto = searchProducto
    ? producto.filter(
        (producto) =>
          !producto.eliminado &&
          producto.nombre.toLowerCase().includes(searchProducto.toLowerCase())
      )
    : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <NavBarRoot />

      <div className="flex-1 overflow-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div
            style={{ background: "blue" }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">
                Sistema de Ventas
              </h2>
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5" />
                <span className="text-xl font-semibold">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search and Client Selection Section */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Selección de Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3/4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th
                          style={{ background: "blue" }}
                          className="px-4 py-2"
                        >
                          Nombre
                        </th>
                        <th
                          style={{ background: "blue" }}
                          className="px-4 py-2"
                        >
                          Apellido
                        </th>
                        <th
                          style={{ background: "blue" }}
                          className="px-4 py-2"
                        >
                          Teléfono
                        </th>
                        <th
                          style={{ background: "blue" }}
                          className="px-4 py-2"
                        >
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsuarios.map((usuario) => (
                        <motion.tr
                          key={usuario.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.01 }}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{usuario.nombre}</td>
                          <td className="px-4 py-2">{usuario.apellido}</td>
                          <td className="px-4 py-2">{usuario.telefono}</td>
                          <td className="px-4 py-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedUser(usuario)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors shadow-sm"
                            >
                              Seleccionar
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Section */}
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Factura
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <input
                          type="date"
                          value={addVenta.fecha || ""}
                          onChange={(e) =>
                            setAddVenta({ ...addVenta, fecha: e.target.value })
                          }
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Cliente:
                          </span>
                          <p className="font-medium">{selectedUser.nombre}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Apellido:
                          </span>
                          <p className="font-medium">{selectedUser.apellido}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Teléfono:
                          </span>
                          <p className="font-medium">{selectedUser.telefono}</p>
                        </div>
                      </div>

                      {selectedProducto.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-4">
                            Productos Seleccionados
                          </h3>
                          <div className="max-h-64 overflow-y-auto rounded-lg border">
                            <table className="w-full">
                              <thead className="bg-blue-600 text-white">
                                <tr>
                                  <th
                                    style={{ background: "blue" }}
                                    className="px-4 py-2"
                                  >
                                    Producto
                                  </th>
                                  <th
                                    style={{ background: "blue" }}
                                    className="px-4 py-2"
                                  >
                                    Precio U.
                                  </th>
                                  <th
                                    style={{ background: "blue" }}
                                    className="px-4 py-2"
                                  >
                                    Cantidad
                                  </th>
                                  <th
                                    style={{ background: "blue" }}
                                    className="px-4 py-2"
                                  >
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedProducto.map((producto) => (
                                  <motion.tr
                                    key={producto.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-t"
                                  >
                                    <td className="px-4 py-2">
                                      {producto.nombre}
                                    </td>
                                    <td className="px-4 py-2">
                                      {producto.precio} Bs
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="flex items-center gap-2">
                                        <motion.button
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => {
                                            const currentQty =
                                              cantidadProducto[producto.id] ||
                                              0;
                                            if (currentQty > 0) {
                                              handleChange(
                                                {
                                                  target: {
                                                    value: (
                                                      currentQty - 1
                                                    ).toString(),
                                                  },
                                                } as any,
                                                producto.id
                                              );
                                            }
                                          }}
                                          className="p-1 rounded-full hover:bg-red-100 bg-red-50 text-red-600"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </motion.button>
                                        <input
                                          type="number"
                                          value={
                                            cantidadProducto[producto.id] || 0
                                          }
                                          onChange={(e) =>
                                            handleChange(e, producto.id)
                                          }
                                          className="w-16 px-2 py-1 border rounded-lg text-center"
                                        />
                                        <motion.button
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => {
                                            const currentQty =
                                              cantidadProducto[producto.id] ||
                                              0;
                                            handleChange(
                                              {
                                                target: {
                                                  value: (
                                                    currentQty + 1
                                                  ).toString(),
                                                },
                                              } as any,
                                              producto.id
                                            );
                                          }}
                                          className="p-1 rounded-full hover:bg-green-100 bg-green-50 text-green-600"
                                        >
                                          <Plus className="h-4 w-4" />
                                        </motion.button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">
                                      {(cantidadProducto[producto.id] || 0) *
                                        producto.precio}{" "}
                                      Bs
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-4 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <span className="text-lg font-semibold">
                              Total:
                            </span>
                            <span className="text-xl font-bold text-blue-600">
                              {totalGeneral}Bs
                            </span>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAgregar}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md"
                          >
                            Guardar Venta
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Products Section */}
          <Card className="mt-6 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3/4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchProducto}
                  onChange={(e) => setSearchProducto(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-96 overflow-y-auto rounded-lg border">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Producto
                      </th>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Descripcion
                      </th>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Laboratorio
                      </th>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Tipo
                      </th>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Presentación
                      </th>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Stock
                      </th>
                      <th
                        style={{ background: "blue" }}
                        className="px-4 py-2 text-left"
                      >
                        Casilla
                      </th>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Precio
                      </th>
                      <th style={{ background: "blue" }} className="px-4 py-2">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducto.map((producto) => {
                      const laboratorioNombre =
                        laboratorio.find(
                          (lab) => lab.id === producto.idlaboratorio
                        )?.laboratorioNombre || "N/A";
                      const tipoNombre =
                        tipo.find((t) => t.id === producto.idtipo)?.nombre ||
                        "N/A";
                      const presentacionNombre =
                        presentacion.find(
                          (pres) => pres.id === producto.idpresentacion
                        )?.nombreCorto || "N/A";

                      return (
                        <motion.tr
                          key={producto.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.01 }}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{producto.nombre}</td>
                          <td className="px-4 py-2">{producto.descripcion}</td>
                          <td className="px-4 py-2">{laboratorioNombre}</td>
                          <td className="px-4 py-2">{tipoNombre}</td>
                          <td className="px-4 py-2">
                            {producto.concentracion &&
                              `${producto.concentracion}  ${presentacionNombre}`}
                          </td>
                          <td className="px-4 py-2">{producto.stock}</td>
                          <td className="px-4 py-2">{producto.casilla}</td>
                          <td className="px-4 py-2">{producto.precio} Bs</td>
                          <td className="px-4 py-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSelectProducto(producto)}
                              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-1.5 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-colors shadow-sm"
                            >
                              Seleccionar
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
export default Ventas;
