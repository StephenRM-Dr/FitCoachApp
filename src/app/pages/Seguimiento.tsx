import { useParams } from "react-router";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const mockPesoData = [
  { fecha: "01/03", peso: 82.5 },
  { fecha: "15/03", peso: 81.8 },
  { fecha: "01/04", peso: 80.9 },
  { fecha: "15/04", peso: 80.2 },
  { fecha: "01/05", peso: 79.5 },
  { fecha: "12/05", peso: 78.8 },
];

const mockFuerzaData = [
  { ejercicio: "Sentadilla", sem1: 80, sem4: 90, sem8: 100, sem12: 110 },
  { ejercicio: "Press Banca", sem1: 60, sem4: 67, sem8: 75, sem12: 82 },
  { ejercicio: "Peso Muerto", sem1: 100, sem4: 110, sem8: 125, sem12: 135 },
  { ejercicio: "Press Militar", sem1: 40, sem4: 45, sem8: 50, sem12: 55 },
];

const mockSesiones = [
  {
    fecha: "2026-05-12",
    nombre: "Fuerza Tren Superior",
    completada: true,
    rpe: 8,
    biofeedback: "Buena sesión, sin molestias",
  },
  {
    fecha: "2026-05-10",
    nombre: "LISS Cardio",
    completada: true,
    rpe: 5,
    biofeedback: "Recuperación activa, me siento bien",
  },
  {
    fecha: "2026-05-08",
    nombre: "Fuerza Tren Inferior",
    completada: true,
    rpe: 9,
    biofeedback: "Fatiga acumulada en cuádriceps",
  },
  {
    fecha: "2026-05-06",
    nombre: "HIT Metabólico",
    completada: false,
    rpe: null,
    biofeedback: "No asistió - reportó dolor lumbar",
  },
];

export function Seguimiento() {
  const { clienteId } = useParams();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Seguimiento y Control
        </h1>
        <p className="text-gray-600">
          Evolución y métricas del cliente{" "}
          {clienteId ? `#${clienteId}` : ""}
        </p>
      </div>

      {/* Alertas de Biofeedback */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-600 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">
              Alerta de Entrenamiento Emergente
            </h3>
            <p className="text-sm text-amber-800">
              El cliente reportó dolor lumbar el 06/05. Se recomienda ajustar la carga
              de la siguiente semana y evaluar movilidad de cadera.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Evolución de Peso */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Evolución Corporal - Peso
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPesoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis domain={[75, 85]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <TrendingUp size={20} />
            <span className="font-semibold">-3.7 kg en 10 semanas</span>
          </div>
        </div>

        {/* Progresión de Fuerza */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Progresión de Fuerza (1RM en kg)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockFuerzaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ejercicio" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sem1" fill="#94a3b8" name="Sem 1" />
              <Bar dataKey="sem12" fill="#3b82f6" name="Sem 12" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historial de Sesiones */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Historial de Sesiones
        </h2>
        <div className="space-y-4">
          {mockSesiones.map((sesion, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                sesion.completada
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {sesion.completada ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <AlertTriangle className="text-red-600" size={24} />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{sesion.nombre}</h3>
                      <p className="text-sm text-gray-600">{sesion.fecha}</p>
                    </div>
                  </div>
                  <div className="ml-9">
                    {sesion.rpe !== null && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          RPE (Esfuerzo Percibido):
                        </span>
                        <div className="flex gap-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded ${
                                i < sesion.rpe!
                                  ? "bg-blue-600"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-blue-600">{sesion.rpe}/10</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-700 italic">
                      <span className="font-semibold">Biofeedback:</span>{" "}
                      {sesion.biofeedback}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control de Marcas */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Marcas Personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockFuerzaData.map((ejercicio) => (
            <div
              key={ejercicio.ejercicio}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
            >
              <p className="text-sm text-gray-700 mb-1">{ejercicio.ejercicio}</p>
              <p className="text-3xl font-bold text-blue-600">{ejercicio.sem12} kg</p>
              <p className="text-sm text-green-600 mt-1">
                +{ejercicio.sem12 - ejercicio.sem1} kg vs inicio
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de Registro Rápido */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Registro Post-Sesión
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RPE (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              defaultValue="2026-05-12"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biofeedback / Comentarios
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="¿Cómo te sentiste? ¿Alguna molestia o fatiga?"
            />
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Guardar Registro
        </button>
      </div>
    </div>
  );
}
