import { Link } from "react-router";
import { Users, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { mes: "Ene", clientes: 12 },
  { mes: "Feb", clientes: 15 },
  { mes: "Mar", clientes: 18 },
  { mes: "Abr", clientes: 22 },
  { mes: "May", clientes: 25 },
];

const mockClientes = [
  { id: 1, nombre: "Juan Pérez", estado: "activo", proximaSesion: "2026-05-13" },
  { id: 2, nombre: "María González", estado: "activo", proximaSesion: "2026-05-14" },
  { id: 3, nombre: "Carlos Ruiz", estado: "alerta", proximaSesion: "2026-05-13" },
  { id: 4, nombre: "Ana Martínez", estado: "activo", proximaSesion: "2026-05-15" },
];

export function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard del Entrenador</h1>
        <p className="text-gray-600">Bienvenido a tu panel de control</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Clientes Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">25</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-green-600 text-sm mt-4">+12% vs mes anterior</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sesiones Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">8</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">3 completadas, 5 pendientes</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Progreso Promedio</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">87%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-green-600 text-sm mt-4">+5% en adherencia</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Alertas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-red-600 text-sm mt-4">Requieren atención</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Crecimiento de Clientes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="clientes" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Clients */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Clientes Recientes</h2>
          <div className="space-y-4">
            {mockClientes.map((cliente) => (
              <Link
                key={cliente.id}
                to={`/cliente/${cliente.id}`}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-600">
                      {cliente.nombre.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                    <p className="text-sm text-gray-600">Próxima sesión: {cliente.proximaSesion}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    cliente.estado === "activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {cliente.estado}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
