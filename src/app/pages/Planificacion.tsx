import { useState } from "react";
import { useParams } from "react-router";
import { Plus, Trash2, Copy, Calendar } from "lucide-react";

type MetodoEntrenamiento = "LISS" | "HIT" | "AMRAP" | "EMOM" | "Fuerza";

interface Ejercicio {
  id: string;
  nombre: string;
  series: number;
  repeticiones: string;
  descanso: number;
  intensidad: string;
  notas: string;
}

interface Sesion {
  id: string;
  nombre: string;
  metodo: MetodoEntrenamiento;
  ejercicios: Ejercicio[];
  duracion: number;
}

export function Planificacion() {
  const { clienteId } = useParams();
  const [sesiones, setSesiones] = useState<Sesion[]>([
    {
      id: "1",
      nombre: "Sesión de Fuerza - Tren Superior",
      metodo: "Fuerza",
      duracion: 60,
      ejercicios: [
        {
          id: "e1",
          nombre: "Press Banca",
          series: 4,
          repeticiones: "8-10",
          descanso: 120,
          intensidad: "75% 1RM",
          notas: "Mantener escápulas retraídas",
        },
      ],
    },
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Planificación y Rutinas
          </h1>
          <p className="text-gray-600">
            Biblioteca de métodos y configuración de sesiones{" "}
            {clienteId ? `- Cliente #${clienteId}` : ""}
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Sesión
        </button>
      </div>

      {/* Métodos de Entrenamiento */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Métodos de Entrenamiento Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              metodo: "LISS",
              nombre: "LISS",
              descripcion: "Cardio de baja intensidad",
              color: "blue",
            },
            {
              metodo: "HIT",
              nombre: "HIT",
              descripcion: "Alta intensidad por intervalos",
              color: "red",
            },
            {
              metodo: "AMRAP",
              nombre: "AMRAP",
              descripcion: "Máximas reps en tiempo",
              color: "purple",
            },
            {
              metodo: "EMOM",
              nombre: "EMOM",
              descripcion: "Cada minuto en el minuto",
              color: "green",
            },
            {
              metodo: "Fuerza",
              nombre: "Fuerza",
              descripcion: "Desarrollo de fuerza máxima",
              color: "orange",
            },
          ].map((metodo) => (
            <div
              key={metodo.metodo}
              className={`p-4 border-2 border-${metodo.color}-200 bg-${metodo.color}-50 rounded-lg`}
            >
              <h3 className={`font-bold text-${metodo.color}-700 mb-1`}>
                {metodo.nombre}
              </h3>
              <p className="text-sm text-gray-600">{metodo.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario Nueva Sesión */}
      {mostrarFormulario && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Sesión</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Sesión
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Fuerza Tren Inferior"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>LISS</option>
                <option>HIT</option>
                <option>AMRAP</option>
                <option>EMOM</option>
                <option>Fuerza</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (min)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="60"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Crear Sesión
            </button>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Sesiones */}
      <div className="space-y-4">
        {sesiones.map((sesion) => (
          <div
            key={sesion.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{sesion.nombre}</h3>
                <p className="text-sm text-gray-600">
                  Método: {sesion.metodo} • Duración: {sesion.duracion} min
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Copy size={20} />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Ejercicios */}
            <div className="space-y-3">
              {sesion.ejercicios.map((ejercicio, idx) => (
                <div
                  key={ejercicio.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Ejercicio {idx + 1}</p>
                      <p className="font-semibold text-gray-900">{ejercicio.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Series</p>
                      <p className="font-semibold text-gray-900">{ejercicio.series}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reps</p>
                      <p className="font-semibold text-gray-900">
                        {ejercicio.repeticiones}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Descanso</p>
                      <p className="font-semibold text-gray-900">{ejercicio.descanso}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Intensidad</p>
                      <p className="font-semibold text-gray-900">
                        {ejercicio.intensidad}
                      </p>
                    </div>
                  </div>
                  {ejercicio.notas && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      Notas: {ejercicio.notas}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              <Plus size={18} />
              Añadir Ejercicio
            </button>
          </div>
        ))}
      </div>

      {/* Periodización */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Periodización - Mesociclos
          </h2>
          <Calendar size={24} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Adaptación Anatómica", "Hipertrofia", "Fuerza Máxima", "Potencia"].map(
            (fase, idx) => (
              <div
                key={fase}
                className={`p-4 rounded-lg border-2 ${
                  idx === 0
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="text-sm text-gray-600 mb-1">Semana {idx * 4 + 1}-{(idx + 1) * 4}</p>
                <p className="font-semibold text-gray-900">{fase}</p>
                {idx === 0 && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">
                    Actual
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
