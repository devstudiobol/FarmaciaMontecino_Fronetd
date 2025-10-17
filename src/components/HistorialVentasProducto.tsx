import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Trash2 } from "react-feather";
import { motion } from "framer-motion";
import { ShoppingCart, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaRegEye } from "react-icons/fa";
import Modal from "./Modal";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: any;
  }
}

interface Venta {
  ventaId: number;
  fechaVenta: string;
  totalVenta: number;
  detalles: DetalleVenta[];
}

interface DetalleVenta {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  totalDetalle: number;
}

interface Producto {
  id: number;
  nombre: string;
  stock: number; // Stock actual del producto
}
interface Configuracion {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}
function HistorialVentasProducto() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fechaIni, setFechaIni] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [configuracion,setConfiguracion]=useState<Configuracion[]>([]);

  const calcularTotalGeneral = () => {
    return getProductosVendidos().reduce((total, producto) => total + producto.total, 0);
  };
useEffect(() => {
  fetch('https://farmaciamontecino.onrender.com/api/Configuracions/ListarConfiguracionActivos')
    .then(response => response.json())
    .then(data => setConfiguracion(data))
}, []) ;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProductos = await fetch(
          "https://farmaciamontecino.onrender.com/api/Productos/ListarProductosActivos"
        );
        const dataProductos = await responseProductos.json();
        setProductos(dataProductos);

        let url = "https://farmaciamontecino.onrender.com/api/Ventas/ListarVentasActivos";
        if (fechaIni && fechaFin) {
          url = `https://farmaciamontecino.onrender.com/api/Ventas/ListarVentasFecha?fechaIni=${fechaIni}&fechafin=${fechaFin}`;
        }

        const responseVentas = await fetch(url);
        const dataVentas = await responseVentas.json();
        setVentas(dataVentas.ventas || []);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [fechaIni, fechaFin]);

  const getProductosVendidos = () => {
    const productosVendidos: Record<
      number,
      { nombre: string; cantidad: number; precioUnitario: number; total: number; stock: number }
    > = {};

    ventas?.forEach((venta) => {
      venta.detalles?.forEach((detalle) => {
        const productoId = detalle.productoId;
        const producto = productos.find((p) => p.id === productoId);

        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            nombre: producto ? producto.nombre : "Desconocido",
            cantidad: 0,
            precioUnitario: detalle.precioUnitario,
            total: 0,
            stock: producto ? producto.stock : 0, // Agregar stock actual
          };
        }

        productosVendidos[productoId].cantidad += detalle.cantidad;
        productosVendidos[productoId].total += detalle.totalDetalle;
      });
    });

    return Object.values(productosVendidos);
  };

  const handleViewDetails = (venta: Venta) => {
    setSelectedVenta(venta);
    setIsModalOpen(true);
  };

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
    doc.text("REPORTE DE VENTAS", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(12);
    doc.setFont(undefined, "bold");
      {configuracion.map((item) => (
    doc.text(`${item.nombre}`, 14, 35),
    doc.setFontSize(8),
    doc.setFont(undefined, "normal"),
    doc.text(`Direccion: ${item.direccion}`, 14, 42),
    doc.text(`Cel: ${item.telefono}` ,14, 48 )
  ))};
 

    // Línea divisoria
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(14, 52, pageWidth - 14, 52);

    // Información del rango de fechas
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL REPORTE", 14, 62);

    doc.setFont("helvetica", "normal");
    doc.text(`Fecha Inicio: ${fechaIni}`, 14, 70);
    doc.text(`Fecha Fin: ${fechaFin}`, 14, 76);

    // Tabla de productos vendidos
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE PRODUCTOS VENDIDOS", 14, 90);

    const tableColumn = [
      "Producto",
      "Cantidad Vendida",
      "Precio Unitario",
      "Stock Actual",
      "Total",
    ];

    const productosVendidos = getProductosVendidos();
    const tableRows = productosVendidos.map((producto) => [
      producto.nombre,
      producto.cantidad,
      `Bs${producto.precioUnitario.toFixed(2)}`,
      producto.stock, // Stock actual
      `Bs${producto.total.toFixed(2)}`,
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
        0: { halign: "left" }, // Alinear la columna "Producto" a la izquierda
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250], // Color de fondo alterno para las filas
      },
    });

    // Total general
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, finalY + 10, pageWidth - 14, finalY + 10);

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL GENERAL:", pageWidth - 80, finalY + 18);
    doc.text(`${calcularTotalGeneral().toFixed(2)} Bs`, pageWidth - 25, finalY + 18, {
      align: "right",
    });

    // Pie de página
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text("Este reporte es generado automáticamente.", 14, pageHeight - 20);
    doc.text(`Generado el ${new Date().toLocaleString()}`, pageWidth - 14, pageHeight - 20, {
      align: "right",
    });

    // Guardar el PDF
    doc.save(`reporte_ventas_${fechaIni}_${fechaFin}.pdf`);
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={fechaIni}
          onChange={(e) => setFechaIni(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button
          onClick={generarPDF}
          className="bg-blue text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md"
        >
          Exportar a PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-blue-500 text-white uppercase text-sm">
            <tr>
              <th className="px-6 py-3 bg-blue text-left">Producto</th>
              <th className="px-6 py-3 bg-blue text-left">Cantidad</th>
              <th className="px-6 py-3 bg-blue text-left">Stock Actual</th>
              <th className="px-6 py-3 bg-blue text-left">Precio Unitario</th>
              <th className="px-6 py-3 bg-blue text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {getProductosVendidos().map((producto, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3">{producto.nombre}</td>
                <td className="p-3">{producto.cantidad}</td>
                <td className="p-3">{producto.stock}</td>
                <td className="p-3">{producto.precioUnitario.toFixed(2)} Bs</td>
                <td className="p-3">{producto.total.toFixed(2)} Bs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <label className="text-lg font-bold">
          Total General: {calcularTotalGeneral().toFixed(2)} Bs
        </label>
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

            {selectedVenta && (
              <>
                <div className="mb-6">
                  <p className="text-gray-700">
                    <span className="font-bold">Fecha:</span> {selectedVenta.fechaVenta}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Total Venta:</span> {selectedVenta.totalVenta.toFixed(2)} Bs
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded shadow">
                    <thead className="bg-blue text-white uppercase text-sm">
                      <tr>
                        <th className="px-6 py-3 bg-blue text-left">Producto</th>
                        <th className="px-6 py-3 bg-blue  text-left">Cantidad</th>
                        <th className="px-6 py-3 bg-blue text-left">Precio Unit.</th>
                        <th className="px-6 py-3 bg-blue text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVenta.detalles?.map((detalle, index) => {
                        const producto = productos.find((p) => p.id === detalle.productoId);
                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">{producto ? producto.nombre : "Desconocido"}</td>
                            <td className="p-3">{detalle.cantidad}</td>
                            <td className="p-3">{detalle.precioUnitario.toFixed(2)} Bs</td>
                            <td className="p-3">{detalle.totalDetalle.toFixed(2)} Bs</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generarPDF(selectedVenta)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                  >
                    Generar PDF
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default HistorialVentasProducto;