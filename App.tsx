import { FaEye, FaTrash } from "react-icons/fa";
import { Accion, Columna, DataTable, EstadoPill } from "./components/DataTable.js";
import { FaPencil } from "react-icons/fa6";

type FilaTarea = {
  empleado: string;
  idTarea: string;
  tarea: string;
  inicio: string;
  fin: string;
  conteo: number;
  estado: string;
  colorEstado: "verde" | "amarillo" | "rojo" | "azul" | "gris";
};

export default function App() {
	// const [contador, setContador] = useState<number>(0);
	// const [datos, setDatos] = useState<Array<RickMortyType>>([]);

	/* const obtenerDatos = async () => {
		try {
			const resultado = await fetch("https://rickandmortyapi.com/api/character").then((res) => res.json());
			setDatos(resultado.results);
		} catch (error) {
			console.log("Existe un error al obtener datos", error);
		}
	};

	useEffect(() => {
		obtenerDatos();
	}, []); */

 const columnas: Array<Columna<FilaTarea>> = [
    { key: "empleado", encabezado: "Empleado", ordenable: true },
    { key: "idTarea", encabezado: "ID Tarea", ordenable: true },
    { key: "tarea", encabezado: "Detalles de Tarea", ordenable: true, ancho: "28%" },
    { key: "inicio", encabezado: "Fecha Inicio", ordenable: true },
    { key: "fin", encabezado: "Fecha Fin", ordenable: true },
    { key: "conteo", encabezado: "Conteo", ordenable: true, alineacion: "center" },
    {
      key: "estado",
      encabezado: "Estado",
      ordenable: true,
      render: (fila) => <EstadoPill etiqueta={fila.estado} color={fila.colorEstado} />,
    },
  ];

  // Datos de ejemplo
  const datos: FilaTarea[] = [
    { empleado: "John, Peterson", idTarea: "TID0002501", tarea: "Desarrollo Frontend", inicio: "12/09/2018", fin: "15/09/2018", conteo: 10, estado: "Completado", colorEstado: "verde" },
    { empleado: "Nattali Rize", idTarea: "TID0002498", tarea: "Desarrollo Tema RWD", inicio: "28/08/2018", fin: "05/09/2018", conteo: 9, estado: "Completado", colorEstado: "verde" },
    { empleado: "Jennifer Lawrence", idTarea: "TID0002497", tarea: "Desarrollo Frontend", inicio: "28/08/2018", fin: "05/09/2018", conteo: 7, estado: "Completado", colorEstado: "verde" },
    { empleado: "Jason Statham", idTarea: "TID0002486", tarea: "Desarrollo Tema RWD", inicio: "20/08/2018", fin: "28/08/2018", conteo: 9, estado: "Completado", colorEstado: "verde" },
    { empleado: "Selena Gomez", idTarea: "TID0002481", tarea: "Tema Wordpress", inicio: "15/08/2018", fin: "26/08/2018", conteo: 6, estado: "Completado", colorEstado: "verde" },
  ];

  // Acciones (ver, editar, eliminar)
  const acciones: Array<Accion<FilaTarea>> = [
    { etiqueta: "Ver", icono: <FaEye size={16} />, onClick: (fila) => alert("Ver: " + fila.idTarea) },
    { etiqueta: "Editar", icono: <FaPencil size={16} />, onClick: (fila) => alert("Editar: " + fila.idTarea) },
    { etiqueta: "Eliminar", icono: <FaTrash size={16} />, onClick: (fila) => alert("Eliminar: " + fila.idTarea) },
  ];

  // Filtro visual (chip)
  const filtros = (
    <div className="flex items-center gap-2">
      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
        Estado : Completado
      </span>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bandeja de Tareas</h1>
      <DataTable<FilaTarea>
        columnas={columnas}
        datos={datos}
        acciones={acciones}
        filtrosUI={filtros}
        ordenInicial={{ key: "empleado", direccion: "asc" }}
        opcionesTamPagina={[5, 10, 20]}
      />
    </div>
  );
}
