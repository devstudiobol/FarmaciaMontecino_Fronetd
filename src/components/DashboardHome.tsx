import React, { useState, useEffect } from "react";
import moment from 'moment';
import {
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import NavBarRoot from "./NavBarRoot";
import "./DashboardHome.css";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { style } from "framer-motion/client";

interface Product {
  codigo: string;
  nombre: string;
  vencimiento: string;
  idtipo: number;
  idpresentacion: number;
  precio: number;
  stock: number;
}

interface Tipo {
  id: number;
  nombre: string;
}

interface Presentaciones {
  id: number;
  nombre: string;
}

interface StatItem {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const DashboardHome: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [usuariosActivos, setUsuariosActivos] = useState(0);
  const [clientes, setClientes] = useState(0);
  const [productos, setProductos] = useState(0);
  const [ventas, setVentas] = useState(0);
  const [tipo, setTipo] = useState<Tipo[]>([]);
  const [presentacion, setPresentacion] = useState<Presentaciones[]>([]);
  const [productosConMenorStock, setProductosConMenorStock] = useState<Product[]>([]);
  const [masVendidosData, setMasVendidosData] = useState<{ name: string; value: number }[]>([]);
  const [ingresosMensuales, setIngresosMensuales] = useState<{ mes: string; total: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener ingresos mensuales
        const responseIngresos = await fetch(
          "http://localhost:5000/api/Ventas/SumarTotalesPorMes"
        );
        const dataIngresos = await responseIngresos.json();

        // Transformar los datos de la API
        const transformedData = Object.keys(dataIngresos).map((mes) => ({
          mes: mes, // Usar el mes como clave
          total: dataIngresos[mes], // Usar el valor como total
        }));

        setIngresosMensuales(transformedData);

        // Obtener productos activos
        const responseProductos = await fetch(
          "http://localhost:5000/api/Productos/ListarProductosActivos"
        );
        const dataProductos = await responseProductos.json();
        setProductos(dataProductos.length);

        // Obtener tipos de productos
        const responseTipo = await fetch(
          "http://localhost:5000/api/Tipos/ListarTiposActivos"
        );
        const dataTipo = await responseTipo.json();
        setTipo(dataTipo);

        // Obtener presentaciones
        const responsePresentacion = await fetch(
          "http://localhost:5000/api/Presentaciones"
        );
        const dataPresentacion = await responsePresentacion.json();
        setPresentacion(dataPresentacion);

        // Obtener usuarios activos
        const responseUsuarios = await fetch(
          "http://localhost:5000/api/Usuarios/ListarUsuariosActivos"
        );
        const dataUsuarios = await responseUsuarios.json();
        setUsuariosActivos(dataUsuarios.length);

        // Obtener clientes activos
        const responseClientes = await fetch(
          "http://localhost:5000/api/Clientes/ListarClientesActivos"
        );
        const dataClientes = await responseClientes.json();
        setClientes(dataClientes.length);

        // Obtener ventas activas
        const responseVentas = await fetch(
          "http://localhost:5000/api/Ventas/ListarVentasActivos"
        );
        const dataVentas = await responseVentas.json();
        setVentas(dataVentas.length);

        // Obtener productos con menor stock
        const responseMenorStock = await fetch(
          "http://localhost:5000/api/Productos/listarProductosConMenorStock"
        );
        const dataMenorStock = await responseMenorStock.json();
        setProductosConMenorStock(dataMenorStock);

        // Obtener productos más vendidos
        const responseMasVendidos = await fetch(
          "http://localhost:5000/api/Detalle_Ventas/ProductosMasVendidos"
        );
        const dataMasVendidos = await responseMasVendidos.json();

        // Transformar los datos para el gráfico
        const transformedMasVendidosData = dataMasVendidos.map((item: any) => ({
          name: item.nombre,
          value: item.totalVendido,
        }));
        setMasVendidosData(transformedMasVendidosData);

      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stockMinimoData = productosConMenorStock.map((producto) => ({
    name: producto.nombre,
    value: producto.stock,
  }));
  // Actualizar el reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatear la hora
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const now = moment().format('DD [de] MMMM [de] YYYY');

  // Estadísticas
  const stats: StatItem[] = [
    {
      title: "Usuarios",
      value: usuariosActivos,
      icon: Users,
      bgColor: "bg-orange-500",
      textColor: "",
      borderColor: "",
    },
    {
      title: "Clientes",
      value: clientes,
      icon: Users2,
      bgColor: "bg-green-500",
      textColor: "",
      borderColor: "",
    },
    {
      title: "Productos",
      value: productos,
      icon: Package,
      bgColor: "bg-red-500",
      textColor: "",
      borderColor: "",
    },
    {
      title: "Ventas",
      value: ventas,
      icon: ShoppingCart,
      bgColor: "bg-cyan-500",
      textColor: "",
      borderColor: "",
    },
  ];

  // Obtener el nombre del usuario desde localStorage
  const name = localStorage.getItem("userName");

  return (
    <div className="flex h-screen bg-gray-50">
      <NavBarRoot />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Banner de bienvenida */}
          <div
            style={{ background: "blue" }}
            className="w-full mb-8 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg p-6 text-white shadow-lg transform hover:scale-[1.01] transition-transform"
          >
            <h1 className="text-3xl font-bold mb-2">
              Bienvenido {name} al sistema de gestión farmacéutica!
            </h1>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              
              <span className="text-xl font-semibold">
                {formatTime(currentTime)}    {now}
              </span>
            </div>
            <p className="opacity-90">Panel de Control</p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {stats.map((stat) => (
    <Card key={stat.title} className="stat-card">
      <CardContent className="stat-content flex items-center gap-4"> {/* Cambio aquí */}
        <div className={`stat-icon-container ${stat.bgColor}`}>
          <stat.icon className="h-9 w-9 text-black" />
        </div>
        <div className="stat-text">
          <h3 className="text-sm font-bold text-gray-600">
            {stat.title}
          </h3>
          <p className="text-2xl font-semibold">{stat.value}</p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

          {/* Gráfico de ingresos mensuales */}
          <Card className="mb-8 shadow-lg">
            <CardHeader
              style={{ background: "blue" }}
              className="bg-gradient-to-r from-blue to-purple-600 text-white rounded-t-lg"
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Ingresos Mensuales</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[380px] p-4">
              <BarChart
                dataset={ingresosMensuales}
                xAxis={[
                  {
                    scaleType: 'band',
                    dataKey: 'mes',
                    tickPlacement: 'middle',
                    tickLabelPlacement: 'middle',
                  },
                ]}
                yAxis={[
                  { label: 'Ingresos/Bs' }, 
                ]}
                series={[
                  {
                    dataKey: 'total',
                    label: 'Ingresos Mensuales',
                    valueFormatter: (value) => `${value} Bs`,
                  },
                ]}
                height={300}
                sx={{
                  [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
                    transform: 'translateX(-10px)',
                  },
                }}
              />
            </CardContent>
          </Card>
{/* Gráficos */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de stock mínimo */}
            <Card className="shadow-lg transform hover:scale-[1.02] transition-transform">
              <CardHeader style={{ background: "blue" }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Stock Mínimo
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockMinimoData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {stockMinimoData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#818cf8", "#6366f1", "#4f46e5", "#4338ca"][index % 4]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
               {/* Gráfico de productos más vendidos */}
            <Card className="shadow-lg transform hover:scale-[1.02] transition-transform">
              <CardHeader style={{ background: "blue" }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Productos más vendidos
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={masVendidosData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {masVendidosData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#f87171", "#ef4444", "#dc2626", "#b91c1c"][index % 4]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Estilos CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;