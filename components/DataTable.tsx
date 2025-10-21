import { useMemo, useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

export type Alineacion = "left" | "center" | "right";
export type DireccionOrden = "asc" | "desc";

export interface Columna<T extends Record<string, any>> {
  key: keyof T & string;
  encabezado: string;
  ordenable?: boolean;
  alineacion?: Alineacion;
  ancho?: string;
  render?: (fila: T) => React.ReactNode;
}

export interface Accion<T extends Record<string, any>> {
  etiqueta: string;
  icono: React.ReactNode;
  onClick?: (fila: T) => void;
}

export interface OrdenInicial<T extends Record<string, any>> {
  key: keyof T & string;
  direccion: DireccionOrden;
}

export interface DataTableProps<T extends Record<string, any>> {
  columnas: Array<Columna<T>>;
  datos: T[];
  opcionesTamPagina?: number[]; // por defecto [5, 10, 20]
  acciones?: Array<Accion<T>>;
  placeholderBusqueda?: string; // por defecto "Buscar por palabras..."
  ordenInicial?: OrdenInicial<T>;
  filtrosUI?: React.ReactNode;
  encabezadoFijo?: boolean; // por defecto true
}

export function DataTable<T extends Record<string, any>>({
  columnas,
  datos,
  opcionesTamPagina = [5, 10, 20],
  acciones = [],
  placeholderBusqueda = "Buscar por palabras...",
  ordenInicial,
  filtrosUI,
  encabezadoFijo = true,
}: DataTableProps<T>) {
  const [busqueda, setBusqueda] = useState<string>("");
  const [pagina, setPagina] = useState<number>(1);
  const [porPagina, setPorPagina] = useState<number>(opcionesTamPagina[0] ?? 5);
  const [claveOrden, setClaveOrden] = useState<string | null>(ordenInicial?.key ?? null);
  const [dirOrden, setDirOrden] = useState<DireccionOrden>(ordenInicial?.direccion ?? "asc");

  const filtrados = useMemo(() => {
    if (!busqueda) return datos;
    const k = busqueda.toLowerCase();
    return datos.filter((fila) =>
      Object.values(fila).some((v) => String(v).toLowerCase().includes(k))
    );
  }, [datos, busqueda]);

  const ordenados = useMemo(() => {
    if (!claveOrden) return filtrados;
    const copia = [...filtrados];
    copia.sort((a, b) => {
      const va = a[claveOrden as keyof T];
      const vb = b[claveOrden as keyof T];
      if (va == null && vb == null) return 0;
      if (va == null) return -1;
      if (vb == null) return 1;
      if (typeof va === "number" && typeof vb === "number") {
        return dirOrden === "asc" ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return dirOrden === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return copia;
  }, [filtrados, claveOrden, dirOrden]);

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / porPagina));
  const datosPagina = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return ordenados.slice(inicio, inicio + porPagina);
  }, [ordenados, pagina, porPagina]);

  const alternarOrden = (col: Columna<T>) => {
    if (!col.ordenable) return;
    if (claveOrden !== col.key) {
      setClaveOrden(col.key);
      setDirOrden("asc");
    } else {
      setDirOrden((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  const celdaEncabezado = (col: Columna<T>) => (
    <th
      key={col.key}
      className={`px-4 py-3 text-sm font-semibold text-white ${
        col.alineacion === "right"
          ? "text-right"
          : col.alineacion === "center"
          ? "text-center"
          : "text-left"
      }`}
      style={{ width: col.ancho }}
    >
      <button
        onClick={() => alternarOrden(col)}
        className={`inline-flex items-center gap-1 ${
          col.ordenable ? "cursor-pointer" : "cursor-default"
        }`}
        aria-label={`Ordenar por ${col.encabezado}`}
      >
        <span>{col.encabezado}</span>
        {col.ordenable && (
          claveOrden === col.key ? (
            dirOrden === "asc" ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
          ) : (
            <FaChevronUp size={16} className="opacity-30" />
          )
        )}
      </button>
    </th>
  );

  return (
    <div className="w-full">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 text-slate-700">
            <FaFilter size={16} />
            <span className="text-sm font-medium">Filtros</span>
          </div>
          {filtrosUI}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
            <input
              className="pl-10 pr-3 py-2 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-sky-400 outline-none text-sm"
              placeholder={placeholderBusqueda}
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200">
        <table className="min-w-full">
          <thead className={`${encabezadoFijo ? "sticky top-0" : ""} bg-sky-700`}>
            <tr>
              {columnas.map(celdaEncabezado)}
              {acciones?.length ? (
                <th className="px-4 py-3 text-sm font-semibold text-white text-right">Acción</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="bg-white">
            {datosPagina.map((fila, ri) => (
              <tr key={ri} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                {columnas.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-slate-700 ${
                      col.alineacion === "right"
                        ? "text-right"
                        : col.alineacion === "center"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {col.render ? col.render(fila) : String(fila[col.key] ?? "")}
                  </td>
                ))}
                {acciones?.length ? (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {acciones.map((a, ai) => (
                        <button
                          key={ai}
                          onClick={() => a.onClick?.(fila)}
                          className="inline-flex items-center justify-center px-3 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-[0.98] transition text-sm"
                          title={a.etiqueta}
                        >
                          {a.icono}
                        </button>
                      ))}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {datosPagina.length === 0 && (
              <tr>
                <td colSpan={columnas.length + (acciones?.length ? 1 : 0)} className="px-4 py-10 text-center text-slate-500 text-sm">
                  No se encontraron datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pie / Paginación */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span>Por página</span>
          <select
            className="px-3 py-2 rounded-xl border border-slate-200"
            value={porPagina}
            onChange={(e) => {
              setPorPagina(Number(e.target.value));
              setPagina(1);
            }}
          >
            {opcionesTamPagina.map((n) => (
              <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
            ))}
          </select>
          <span className="text-slate-500">
            Mostrando {ordenados.length === 0 ? 0 : (pagina - 1) * porPagina + 1} a {Math.min(pagina * porPagina, ordenados.length)} de {ordenados.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
            disabled={pagina === 1}
          >
            <FaChevronLeft size={16} />
            Anterior
          </button>
          {Array.from({ length: totalPaginas }).slice(0, 6).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                onClick={() => setPagina(n)}
                className={`w-9 h-9 rounded-xl border text-sm ${
                  pagina === n
                    ? "bg-sky-600 text-white border-sky-600"
                    : "border-slate-200 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
            disabled={pagina === totalPaginas}
          >
            Siguiente
            <FaChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Componente auxiliar de estado (opcional)
// ==============================

type ColorEstado = "verde" | "amarillo" | "rojo" | "azul" | "gris";

const clasesColor: Record<ColorEstado, { punto: string; borde: string; texto: string }> = {
  verde:   { punto: "bg-green-500",   borde: "border-green-200",   texto: "text-green-700" },
  amarillo:{ punto: "bg-yellow-500",  borde: "border-yellow-200",  texto: "text-yellow-700" },
  rojo:    { punto: "bg-red-500",     borde: "border-red-200",     texto: "text-red-700" },
  azul:    { punto: "bg-blue-500",    borde: "border-blue-200",    texto: "text-blue-700" },
  gris:    { punto: "bg-gray-400",    borde: "border-gray-200",    texto: "text-gray-700" },
};

export function EstadoPill({ etiqueta = "Completado", color = "verde" as ColorEstado }) {
  const c = clasesColor[color];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${c.borde} ${c.texto}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${c.punto}`}></span>
      {etiqueta}
    </span>
  );
}

