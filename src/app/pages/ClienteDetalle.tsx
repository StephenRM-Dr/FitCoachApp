import { useParams, Link } from "react-router";
import { ArrowLeft, Calendar, TrendingUp, Activity, Apple } from "lucide-react";

export function ClienteDetalle() {
  const { clienteId } = useParams();

  return (
    <div className="p-8">
      <Link
        to="/gestion"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        Volver a Gestión
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">JP</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Juan Pérez</h1>
            <p className="text-gray-600">Cliente #{clienteId}</p>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          to={`/diagnostico/${clienteId}`}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <Activity className="text-blue-600 mb-3" size={32} />
          <h3 className="font-bold text-gray-900 mb-1">Diagnóstico</h3>
          <p className="text-sm text-gray-600">Ver evaluación completa</p>
        </Link>

        <Link
          to={`/planificacion/${clienteId}`}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <Calendar className="text-green-600 mb-3" size={32} />
          <h3 className="font-bold text-gray-900 mb-1">Planificación</h3>
          <p className="text-sm text-gray-600">Rutinas y programas</p>
        </Link>

        <Link
          to={`/seguimiento/${clienteId}`}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <TrendingUp className="text-purple-600 mb-3" size={32} />
          <h3 className="font-bold text-gray-900 mb-1">Seguimiento</h3>
          <p className="text-sm text-gray-600">Progreso y métricas</p>
        </Link>

        <Link
          to={`/nutricion/${clienteId}`}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <Apple className="text-orange-600 mb-3" size={32} />
          <h3 className="font-bold text-gray-900 mb-1">Nutrición</h3>
          <p className="text-sm text-gray-600">Plan nutricional</p>
        </Link>
      </div>

      {/* Resumen del Cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Información Personal
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">juan.perez@email.com</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-semibold text-gray-900">+34 600 111 222</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
              <p className="font-semibold text-gray-900">15/03/1994 (32 años)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ocupación</p>
              <p className="font-semibold text-gray-900">Ingeniero de Software</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Estado de Suscripción
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Plan Actual</p>
              <p className="font-semibold text-purple-600">Premium</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Próximo Pago</p>
              <p className="font-semibold text-gray-900">20/05/2026</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cliente Desde</p>
              <p className="font-semibold text-gray-900">10/01/2026</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Adherencia General</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "87%" }}
                  />
                </div>
                <span className="font-bold text-green-600">87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
