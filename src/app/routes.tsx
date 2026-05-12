import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Diagnostico } from "./pages/Diagnostico";
import { Planificacion } from "./pages/Planificacion";
import { Seguimiento } from "./pages/Seguimiento";
import { Nutricion } from "./pages/Nutricion";
import { Gestion } from "./pages/Gestion";
import { ClienteDetalle } from "./pages/ClienteDetalle";
import { Layout } from "./components/Layout";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "diagnostico/:clienteId?", Component: Diagnostico },
      { path: "planificacion/:clienteId?", Component: Planificacion },
      { path: "seguimiento/:clienteId?", Component: Seguimiento },
      { path: "nutricion/:clienteId?", Component: Nutricion },
      { path: "gestion", Component: Gestion },
      { path: "cliente/:clienteId", Component: ClienteDetalle },
      { path: "*", Component: NotFound },
    ],
  },
]);
