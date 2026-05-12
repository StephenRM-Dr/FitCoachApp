import { useParams } from "react-router";
import { Calculator, TrendingUp, Droplet, Moon, CheckCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const mockMacros = [
  { name: "Proteínas", value: 30, color: "#3b82f6" },
  { name: "Carbohidratos", value: 45, color: "#10b981" },
  { name: "Grasas", value: 25, color: "#f59e0b" },
];

const mockAdherencia = [
  { dia: "Lun", sesion: true, agua: true, sueno: true },
  { dia: "Mar", sesion: true, agua: true, sueno: false },
  { dia: "Mié", sesion: true, agua: false, sueno: true },
  { dia: "Jue", sesion: false, agua: true, sueno: true },
  { dia: "Vie", sesion: true, agua: true, sueno: true },
  { dia: "Sáb", sesion: true, agua: true, sueno: true },
  { dia: "Dom", sesion: false, agua: true, sueno: false },
];

export function Nutricion() {
  const { clienteId } = useParams();

  // Cálculo simulado
  const peso = 78.8;
  const altura = 175;
  const edad = 32;
  const imc = (peso / ((altura / 100) ** 2)).toFixed(1);
  const tmb = Math.round(10 * peso + 6.25 * altura - 5 * edad + 5);
  const tdee = Math.round(tmb * 1.55); // Factor actividad moderada

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nutrición y Adherencia
        </h1>
        <p className="text-gray-600">
          Seguimiento nutricional y gestión de hábitos{" "}
          {clienteId ? `- Cliente #${clienteId}` : ""}
        </p>
      </div>

      {/* Cálculo de Requerimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Calculator className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">IMC</p>
              <p className="text-2xl font-bold text-gray-900">{imc}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Peso: {peso} kg • Altura: {altura} cm
          </p>
          <div className="mt-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Peso Normal
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">TMB (Metabolismo Basal)</p>
              <p className="text-2xl font-bold text-gray-900">{tmb}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Calorías en reposo</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">TDEE (Gasto Total)</p>
              <p className="text-2xl font-bold text-gray-900">{tdee}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Calorías diarias recomendadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribución de Macronutrientes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Distribución de Macronutrientes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockMacros}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {mockMacros.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Proteínas (30%)</span>
              <span className="font-bold text-blue-600">
                {Math.round(tdee * 0.30 / 4)}g
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Carbohidratos (45%)</span>
              <span className="font-bold text-green-600">
                {Math.round(tdee * 0.45 / 4)}g
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Grasas (25%)</span>
              <span className="font-bold text-amber-600">
                {Math.round(tdee * 0.25 / 9)}g
              </span>
            </div>
          </div>
        </div>

        {/* Plan Nutricional */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Plan Nutricional Sugerido
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Objetivo Actual</h3>
              <p className="text-sm text-blue-800">
                Pérdida de grasa moderada con preservación de masa muscular
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                  Déficit: -300 kcal/día
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Recomendaciones
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                  <span>4-5 comidas al día para mantener metabolismo activo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                  <span>Proteína en cada comida (25-35g por ingesta)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                  <span>Carbohidratos concentrados pre/post entrenamiento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                  <span>Grasas saludables: aguacate, frutos secos, aceite de oliva</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoreo de Adherencia Semanal */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Adherencia Semanal
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {mockAdherencia.map((dia) => (
            <div key={dia.dia} className="text-center">
              <p className="text-sm font-semibold text-gray-700 mb-2">{dia.dia}</p>
              <div className="space-y-2">
                <div
                  className={`p-2 rounded ${
                    dia.sesion ? "bg-green-100" : "bg-red-100"
                  }`}
                  title="Sesión de entrenamiento"
                >
                  <TrendingUp
                    size={16}
                    className={`mx-auto ${
                      dia.sesion ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </div>
                <div
                  className={`p-2 rounded ${
                    dia.agua ? "bg-blue-100" : "bg-gray-100"
                  }`}
                  title="Hidratación"
                >
                  <Droplet
                    size={16}
                    className={`mx-auto ${
                      dia.agua ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div
                  className={`p-2 rounded ${
                    dia.sueno ? "bg-purple-100" : "bg-gray-100"
                  }`}
                  title="Calidad del sueño"
                >
                  <Moon
                    size={16}
                    className={`mx-auto ${
                      dia.sueno ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" />
            <span>Sesiones: 5/7 (71%)</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplet size={16} className="text-blue-600" />
            <span>Hidratación: 6/7 (86%)</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-purple-600" />
            <span>Sueño adecuado: 5/7 (71%)</span>
          </div>
        </div>
      </div>

      {/* Checklist de Hábitos Diarios */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Checklist de Hábitos - Hoy
        </h2>
        <div className="space-y-3">
          {[
            { habito: "Desayuno completo con proteína", completado: true },
            { habito: "2L de agua antes de las 14:00", completado: true },
            { habito: "Snack pre-entrenamiento", completado: true },
            { habito: "Sesión de entrenamiento", completado: false },
            { habito: "Comida post-entrenamiento (30-60 min)", completado: false },
            { habito: "Cena balanceada antes de las 21:00", completado: false },
            { habito: "7-8 horas de sueño", completado: false },
          ].map((item, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={item.completado}
                className="w-5 h-5 text-blue-600 rounded"
                readOnly
              />
              <span
                className={`flex-1 ${
                  item.completado
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }`}
              >
                {item.habito}
              </span>
              {item.completado && (
                <CheckCircle className="text-green-600" size={20} />
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
