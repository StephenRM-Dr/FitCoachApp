import { useState } from "react";
import { Link } from "react-router";
import {
  Search,
  Plus,
  DollarSign,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
} from "lucide-react";

const mockClientes = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan.perez@email.com",
    telefono: "+34 600 111 222",
    estado: "activo",
    suscripcion: "Premium",
    proximoPago: "2026-05-20",
    ultimaSesion: "2026-05-12",
    adherencia: 87,
    alerta: null,
  },
  {
    id: 2,
    nombre: "María González",
    email: "maria.gonzalez@email.com",
    telefono: "+34 600 333 444",
    estado: "activo",
    suscripcion: "Básico",
    proximoPago: "2026-05-15",
    ultimaSesion: "2026-05-11",
    adherencia: 92,
    alerta: null,
  },
  {
    id: 3,
    nombre: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    telefono: "+34 600 555 666",
    estado: "alerta",
    suscripcion: "Premium",
    proximoPago: "2026-05-18",
    ultimaSesion: "2026-05-06",
    adherencia: 45,
    alerta: "Inactividad - 6 días sin sesión",
  },
  {
    id: 4,
    nombre: "Ana Martínez",
    email: "ana.martinez@email.com",
    telefono: "+34 600 777 888",
    estado: "activo",
    suscripcion: "Premium",
    proximoPago: "2026-05-25",
    ultimaSesion: "2026-05-12",
    adherencia: 95,
    alerta: null,
  },
  {
    id: 5,
    nombre: "Pedro Sánchez",
    email: "pedro.sanchez@email.com",
    telefono: "+34 600 999 000",
    estado: "pendiente-pago",
    suscripcion: "Básico",
    proximoPago: "2026-05-10",
    ultimaSesion: "2026-05-08",
    adherencia: 78,
    alerta: "Pago pendiente desde hace 2 días",
  },
];

export function Gestion() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const clientesFiltrados = mockClientes.filter((cliente) => {
    const matchBusqueda =
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado =
      filtroEstado === "todos" || cliente.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const stats = {
    total: mockClientes.length,
    activos: mockClientes.filter((c) => c.estado === "activo").length,
    alertas: mockClientes.filter((c) => c.estado === "alerta").length,
    pendientes: mockClientes.filter((c) => c.estado === "pendiente-pago").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600">
            Panel centralizado para administrar tu cartera de clientes
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Clientes</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-green-600" size={18} />
            <p className="text-green-800 text-sm">Activos</p>
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.activos}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-amber-600" size={18} />
            <p className="text-amber-800 text-sm">Con Alertas</p>
          </div>
          <p className="text-3xl font-bold text-amber-700">{stats.alertas}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="text-red-600" size={18} />
            <p className="text-red-800 text-sm">Pagos Pendientes</p>
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.pendientes}</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="alerta">Con alertas</option>
            <option value="pendiente-pago">Pagos pendientes</option>
          </select>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suscripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adherencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {cliente.nombre.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <Link
                          to={`/cliente/${cliente.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {cliente.nombre}
                        </Link>
                        <p className="text-sm text-gray-500">
                          ID: #{cliente.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{cliente.email}</p>
                    <p className="text-sm text-gray-500">{cliente.telefono}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        cliente.suscripcion === "Premium"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cliente.suscripcion}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Próximo: {cliente.proximoPago}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            cliente.adherencia >= 80
                              ? "bg-green-500"
                              : cliente.adherencia >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${cliente.adherencia}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {cliente.adherencia}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.alerta ? (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-sm text-red-600">
                          {cliente.alerta}
                        </span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        Al día
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <MessageSquare size={18} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <DollarSign size={18} />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sistema de Notificaciones */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Notificaciones y Recordatorios
        </h2>
        <div className="space-y-3">
          {[
            {
              tipo: "pago",
              mensaje: "Pedro Sánchez tiene un pago pendiente desde el 10/05",
              prioridad: "alta",
            },
            {
              tipo: "inactividad",
              mensaje: "Carlos Ruiz lleva 6 días sin actividad registrada",
              prioridad: "media",
            },
            {
              tipo: "proximo-pago",
              mensaje: "3 clientes tienen pagos programados esta semana",
              prioridad: "baja",
            },
          ].map((notif, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                notif.prioridad === "alta"
                  ? "bg-red-50 border-red-600"
                  : notif.prioridad === "media"
                  ? "bg-amber-50 border-amber-600"
                  : "bg-blue-50 border-blue-600"
              }`}
            >
              <p className="text-sm text-gray-800">{notif.mensaje}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
