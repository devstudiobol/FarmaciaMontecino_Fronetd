import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Modal from "./Modal";
import { FaRegEye  } from "react-icons/fa";

import {
  Trash2,
  Users,
  Users2,
  Package,
  ShoppingCart,
  Search,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Clock,
} from "lucide-react";
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: any;
  }
}

interface Venta {
  id: number;
  idcliente: number;
  nombre: string;
  total: number;
  fecha: string;
}

interface Detalle_Ventas {
  id: number;
  cantidad: number;
  descuento: number;
  precio: number;
  total: number;
  eliminado?: boolean;
  idproducto: number;
  idventa: number;
}

interface Client {
  id: number;
  nombre: string;
  ci: string;
  telefono: string;
  direccion: string;
  eliminado?: boolean;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  vencimiento: string;
  estado?: boolean;
  idpresentacion: number;
  idlaboratorio: number;
  idtipo: number;
}
interface Configuracion {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}
function HistorialVentasCliente() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [search, setSearch] = useState("");
  const [usuario, setUsuario] = useState<Client[]>([]);
  const [detalleventa, setDetalleVenta] = useState<Detalle_Ventas[]>([]);
  const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null);
  const [productos, setProducto] = useState<Producto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fechaIni, setFechaIni] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [configuracion, setConfiguracion] = useState<Configuracion[]>([]);
    useEffect(() => {
    fetch('https://farmaciamontecinoweb.onrender.com/api/Configuracions/ListarConfiguracionActivos')
      .then(response => response.json())
      .then(data => setConfiguracion(data))
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseClientes = await fetch(
          "https://farmaciamontecinoweb.onrender.com/api/Clientes/ListarClientesActivos"
        );
        const dataClientes = await responseClientes.json();
        setUsuario(dataClientes);

        const responseProducto = await fetch(
          "https://farmaciamontecinoweb.onrender.com/api/Productos/ListarProductosActivos"
        );
        const dataProductos = await responseProducto.json();
        setProducto(dataProductos);

        let url = "https://farmaciamontecinoweb.onrender.com/api/Ventas/ListarVentasActivos";
        if (fechaIni && fechaFin) {
          url = `https://farmaciamontecinoweb.onrender.com/api/Ventas/ListarVentasFecha?fechaIni=${fechaIni}&fechafin=${fechaFin}`;
        }

        const responseVentas = await fetch(url);
        const dataVentas = await responseVentas.json();
        setVentas(dataVentas);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [fechaIni, fechaFin]);

  const handlePdfClick = async (idventa: number) => {
    try {
      const responseDetalleVenta = await fetch(
        `https://farmaciamontecinoweb.onrender.com/api/Ventas/listarVentaDetalleVenta?idventa=${idventa}`
      );
      const dataDetalleVenta = await responseDetalleVenta.json();
      setDetalleVenta(dataDetalleVenta);
      setSelectedVentaId(idventa);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener los detalles de la venta:", error);
    }
  };

  const generarPDF = () => {
  try {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 197]
    });
    
    const margin = 5;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (2 * margin);
    
    doc.setFont("helvetica");
    doc.setTextColor(0, 0, 0);
    
    {configuracion.map((item) => (
            doc.text(`${item.nombre}`, margin + 19, 15),
            doc.setFontSize(8),
            doc.setFont(undefined, "normal"),
            doc.text(`Direccion: ${item.direccion}`, margin + 15, 18),
            doc.text(`Cel: ${item.telefono}`, margin + 24, 21)
          ))};
    // Número de factura
    doc.setFontSize(8);
    doc.text(`Recibo Nro: ${Math.floor(Math.random() * 1000000000)}`, margin, 26);
    
    // Línea separadora
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, 29, pageWidth - margin, 29);
    
    // Fecha y hora
    const now = new Date();
    const fecha = now.toLocaleDateString();
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Información del cliente
    const selectedVenta = ventas.find((v) => v.id === selectedVentaId);
    const selectedUser = usuario.find((u) => u.id === selectedVenta?.idcliente);
    
    doc.text(`Sr(a): ${selectedUser?.nombre} ${selectedUser?.ci}`.substring(0, 30), margin, 34);
    doc.text(`CI/NIT: ${selectedUser?.ci}`.substring(0, 35), margin, 38);
    
    doc.text(`FECHA: ${fecha}`, margin, 42);
    doc.text(`${hora}`, margin + 25, 42);
    
    doc.line(margin, 47, pageWidth - margin, 47);
    
    // Encabezados de tabla
    doc.text("CANT", margin, 56);
    doc.text("CONCEPTO", margin + 15, 56);
    doc.text("P.U.", margin + 45, 56);
    doc.text("IMP.", margin + 55, 56);
    
    // Detalles de productos
    let yPos = 63;
    detalleventa.forEach((detalle) => {
      const producto = productos.find((p) => p.id === detalle.idproducto);
      const nombreProducto = producto ? producto.nombre : "Producto no encontrado";
      
      doc.text(detalle.cantidad.toString(), margin, yPos);
      doc.text(nombreProducto.substring(0, 20), margin + 15, yPos);
      doc.text(detalle.precio.toFixed(2), margin + 45, yPos);
      doc.text(detalle.total.toFixed(2), margin + 55, yPos);
      
      yPos += 7;
    });
    
    // Línea separadora antes del total
    doc.line(margin, yPos + 7, pageWidth - margin, yPos + 7);
    yPos += 14;
    
    // Total
    doc.setFont(undefined, "bold");
    doc.text("TOTAL:", margin + 45, yPos);
    doc.text(`${selectedVenta?.total.toFixed(2)} Bs`, margin + 55, yPos);
    doc.setFont(undefined, "normal");
    
    yPos += 7;
    
    // Información del vendedor
    doc.text(`Vendedor: ${name}`, margin, yPos);
    yPos += 7;
    
    // Línea final
    doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 10;
    
    // Mensaje de agradecimiento
    doc.setFontSize(8);
    doc.text("GRACIAS POR SU COMPRA.", pageWidth / 2, yPos, { align: "center" });
    
    // Pie de página
    doc.text("Esta factura es válida por 7 días.", margin,  - 15);
    doc.text(`Generado el ${now.toLocaleString()}`, pageWidth - margin,  - 15, { align: "right" });
    
    // Guardar PDF
    doc.save(`factura_${selectedUser?.nombre}_${selectedUser?.ci}_${now.toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error("Error al generar la factura:", error);
  }
};

  const filteredVentas = ventas.filter((venta) => {
    const cliente = usuario.find((user) => user.id === venta.idcliente);
    const clienteNombre = cliente
      ? `${cliente.nombre} ${cliente.ci}`.toLowerCase()
      : "";
    return (
      clienteNombre.includes(search.toLowerCase()) ||
      venta.fecha.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar esta venta?")) {
      try {
        const response = await fetch(
          `https://farmaciamontecinoweb.onrender.com/api/Ventas/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setVentas((prevVentas) =>
            prevVentas.filter((venta) => venta.id !== id)
          );
        } else {
          const errorData = await response.json();
          console.error("Error al eliminar la venta:", errorData.message);
        }
      } catch (error) {
        console.error("Error en la solicitud al servidor:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar Cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
        />

      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-blue text-white uppercase text-sm">
            <tr>
              <th className="px-6 py-3 text-left bg-blue">Cliente</th>
              <th className="px-6 py-3 text-left bg-blue">CI/NIT</th>
              <th className="px-6 py-3 text-left bg-blue">Fecha</th>
              <th className="px-6 py-3 text-left bg-blue">Total</th>
              <th className="px-6 py-3 text-left bg-blue">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVentas.map((venta) => {
              const cliente = usuario.find(
                (user) => user.id === venta.idcliente
              );
              return (
                <tr key={venta.id} className="border-b hover:bg-gray-50">
                  
                  <td className="p-3">
                    {cliente
                      ? `${cliente.nombre} ${cliente.ci}`
                      : "Desconocido"}
                  </td>
                    <td className="p-3">
                    {cliente
                      ? `${cliente.ci}`
                      : "Desconocido"}
                  </td>
                  <td className="p-3">{venta.fecha}</td>
                  <td className="p-3">{venta.total}</td>
                  <td className="p-3 text-center">
                    <button
                      style={{ background: "blue" }}
                      className="btn btn-warning"
                      onClick={() => handlePdfClick(venta.id)}
                    >
                      <FaRegEye />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(venta.id)}
                    >
                 <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 w-full max-w-4xl"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-bold text-blue-600">
                Detalles de la Venta
              </h3>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={
                  ventas.find((v) => v.id === selectedVentaId)?.fecha || ""
                }
                readOnly
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100"
              />
            </div>

            {usuario.length > 0 && (
              <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                  <span className="text-sm text-gray-500">Cliente:</span>
                  <p className="font-medium">
                    {usuario.find(
                      (u) =>
                        u.id ===
                        ventas.find((v) => v.id === selectedVentaId)
                          ?.idcliente
                    )?.nombre || "Desconocido"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">CI/NIT:</span>
                  <p className="font-medium">
                    {usuario.find(
                      (u) =>
                        u.id ===
                        ventas.find((v) => v.id === selectedVentaId)
                          ?.idcliente
                    )?.ci || "Desconocido"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Teléfono:</span>
                  <p className="font-medium">
                    {usuario.find(
                      (u) =>
                        u.id ===
                        ventas.find((v) => v.id === selectedVentaId)
                          ?.idcliente
                    )?.telefono || "Desconocido"}
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded shadow">
                <thead className="bg-blue text-white uppercase text-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-black">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-black">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-black">Precio</th>
                    <th className="px-6 py-3 text-left text-black">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleventa.map((detalle) => {
                    const producto = productos.find(
                      (p) => p.id === detalle.idproducto
                    );
                    return (
                      <motion.tr
                        key={detalle.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                          {producto
                            ? producto.nombre
                            : "Producto no encontrado"}
                        </td>
                        <td className="p-3">{detalle.cantidad}</td>
                        <td className="p-3">{detalle.precio} Bs</td>
                        <td className="p-3">{detalle.total} Bs</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                {ventas.find((v) => v.id === selectedVentaId)?.total || 0} Bs
              </span>
            </div>

            <div className="mt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generarPDF}
                className="bg-blue text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md"
              >
                Generar PDF
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default HistorialVentasCliente;