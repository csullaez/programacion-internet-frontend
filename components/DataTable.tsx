import React, { useMemo, useState } from "react";

export type Columna<T> = {
	clave: keyof T | string;
	encabezado: React.ReactNode;
	ancho?: string | number;
	alinear?: "left" | "center" | "right";
	ordenable?: boolean;
	render?: (valor: unknown, fila: T, indiceFila: number) => React.ReactNode;
	acceso?: (fila: T) => unknown;
};

export type EstadoOrden<T> = {
	clave: keyof T | string;
	direccion: "asc" | "desc";
};

export type Accion<T> = {
	etiqueta: React.ReactNode;
	onClick: (fila: T) => void;
};

export type PropsTabla<T> = {
	columnas: Array<Columna<T>>;
	datos: T[];
	buscable?: boolean;
	seleccionable?: boolean;
	ordenInicial?: EstadoOrden<T>;
	opcionesTamPagina?: number[];
	tamPaginaInicial?: number;
	cargando?: boolean;
	alClickFila?: (fila: T) => void;
	obtenerIdFila?: (fila: T, indice: number) => string | number;
	funcionFiltro?: (fila: T, consulta: string) => boolean;
	textos?: Partial<{
		placeholderBusqueda: string;
		filasPorPagina: string;
		sinResultados: string;
		de: string;
		seleccionados: string;
		acciones: string;
	}>;
	clase?: string;
	acciones?: Accion<T>[];
};

export function DataTable<T>(props: PropsTabla<T>) {
	const {
		columnas,
		datos,
		buscable,
		seleccionable,
		ordenInicial,
		opcionesTamPagina = [10, 25, 50],
		tamPaginaInicial = opcionesTamPagina[0] ?? 10,
		cargando = false,
		alClickFila,
		obtenerIdFila,
		funcionFiltro,
		textos,
		clase,
		acciones,
	} = props;

	const tx = {
		placeholderBusqueda: "Buscar...",
		filasPorPagina: "Filas por página",
		sinResultados: "Sin resultados",
		de: "de",
		seleccionados: "seleccionados",
		acciones: "Acciones",
		...(textos || {}),
	};

	const [busqueda, setBusqueda] = useState("");
	const [orden, setOrden] = useState<EstadoOrden<T> | undefined>(ordenInicial);
	const [pagina, setPagina] = useState(1);
	const [tamPagina, setTamPagina] = useState(tamPaginaInicial);
	const [seleccion, setSeleccion] = useState<Set<string | number>>(new Set());

	const idFila = (fila: T, i: number) => (obtenerIdFila ? obtenerIdFila(fila, i) : i);

	const columnasConAcciones: Array<Columna<T>> = useMemo(() => {
		if (!acciones || acciones.length === 0) return columnas;
		const existe = columnas.some((c) => c.clave === "acciones");
		if (existe) return columnas;
		return [
			...columnas,
			{
				clave: "acciones",
				encabezado: tx.acciones,
				alinear: "right",
				render: (_, fila) => (
					<div className="flex items-center justify-end gap-2">
						{acciones.map((a, idx) => (
							<button
								key={idx}
								type="button"
								className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
								onClick={(e) => {
									e.stopPropagation();
									a.onClick(fila);
								}}
							>
								{a.etiqueta}
							</button>
						))}
					</div>
				),
			},
		];
	}, [acciones, columnas, tx.acciones]);

	const filtrados = useMemo(() => {
		if (!buscable || !busqueda) return datos;
		const q = busqueda.toLowerCase();
		if (funcionFiltro) return datos.filter((r) => funcionFiltro(r, q));
		return datos.filter((fila) =>
			Object.values(fila as Record<string, unknown>)
				.filter((v) => typeof v === "string" || typeof v === "number")
				.some((v) => String(v).toLowerCase().includes(q))
		);
	}, [datos, funcionFiltro, busqueda, buscable]);

	const ordenados = useMemo(() => {
		if (!orden) return filtrados;
		const { clave, direccion } = orden;
		const col = columnasConAcciones.find((c) => c.clave === clave);
		const acc = col?.acceso ? (fila: T) => col.acceso!(fila) : (fila: T) => (fila as any)[clave as any];
		const arr = [...filtrados];
		arr.sort((a, b) => {
			const av = acc(a);
			const bv = acc(b);
			if (av == null && bv == null) return 0;
			if (av == null) return direccion === "asc" ? -1 : 1;
			if (bv == null) return direccion === "asc" ? 1 : -1;
			if (typeof av === "number" && typeof bv === "number") return direccion === "asc" ? av - bv : bv - av;
			return direccion === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
		});
		return arr;
	}, [columnasConAcciones, filtrados, orden]);

	const total = ordenados.length;
	const totalPaginas = Math.max(1, Math.ceil(total / tamPagina));
	const paginaActual = Math.min(pagina, totalPaginas);
	const inicio = (paginaActual - 1) * tamPagina;
	const datosPagina = ordenados.slice(inicio, inicio + tamPagina);

	const paginaCompletaSeleccionada = Boolean(seleccionable && datosPagina.length > 0 && datosPagina.every((r, i) => seleccion.has(idFila(r, inicio + i))));

	const alternarPagina = () => {
		if (!seleccionable || datosPagina.length === 0) return;
		const nuevo = new Set(seleccion);
		if (paginaCompletaSeleccionada) {
			datosPagina.forEach((r, i) => nuevo.delete(idFila(r, inicio + i)));
		} else {
			datosPagina.forEach((r, i) => nuevo.add(idFila(r, inicio + i)));
		}
		setSeleccion(nuevo);
	};

	const alternarUna = (rid: string | number) => {
		if (!seleccionable) return;
		const s = new Set(seleccion);
		s.has(rid) ? s.delete(rid) : s.add(rid);
		setSeleccion(s);
	};

	const clickEncabezado = (c: Columna<T>) => {
		if (!c.ordenable) return;
		setPagina(1);
		setOrden((prev) => {
			if (!prev || prev.clave !== c.clave) return { clave: c.clave, direccion: "asc" } as EstadoOrden<T>;
			return { clave: c.clave, direccion: prev.direccion === "asc" ? "desc" : "asc" } as EstadoOrden<T>;
		});
	};

	return (
		<div className={`w-full ${clase ?? ""}`}>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
				<div className="flex items-center gap-2">
					{buscable && (
						<input
							type="text"
							value={busqueda}
							onChange={(e) => {
								setBusqueda(e.target.value);
								setPagina(1);
							}}
							placeholder={tx.placeholderBusqueda}
							className="w-64 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
							aria-label={tx.placeholderBusqueda}
						/>
					)}
				</div>
				<div className="flex items-center gap-3">
					{seleccionable && seleccion.size > 0 && (
						<div className="text-sm text-gray-600">
							{seleccion.size} {tx.seleccionados}
						</div>
					)}
					<div className="flex items-center gap-2">
						<label className="text-sm text-gray-600">{tx.filasPorPagina}</label>
						<select
							className="rounded-xl border border-gray-300 px-2 py-1 text-sm"
							value={tamPagina}
							onChange={(e) => {
								setTamPagina(Number(e.target.value));
								setPagina(1);
							}}
						>
							{opcionesTamPagina.map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{seleccionable && (
								<th className="w-10 px-3 py-3">
									<input
										type="checkbox"
										aria-label="Seleccionar página"
										checked={paginaCompletaSeleccionada}
										onChange={alternarPagina}
										className="h-4 w-4 rounded border-gray-300"
									/>
								</th>
							)}
							{columnasConAcciones.map((c) => (
								<th
									key={String(c.clave)}
									scope="col"
									style={{ width: c.ancho }}
									onClick={() => clickEncabezado(c)}
									className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 select-none ${
										c.alinear === "right" ? "text-right" : c.alinear === "center" ? "text-center" : "text-left"
									} ${c.ordenable ? "cursor-pointer hover:text-gray-900" : ""}`}
								>
									<div className="inline-flex items-center gap-1">
										{c.encabezado}
										{c.ordenable && orden?.clave === c.clave && (
											<span aria-hidden className="text-gray-400">
												{orden.direccion === "asc" ? "▲" : "▼"}
											</span>
										)}
									</div>
								</th>
							))}
						</tr>
					</thead>

					<tbody className="divide-y divide-gray-100">
						{cargando ? (
							Array.from({ length: Math.min(tamPagina, 5) }).map((_, i) => (
								<tr key={`skeleton-${i}`} className="animate-pulse">
									{seleccionable && (
										<td className="px-3 py-3">
											<div className="h-4 w-4 rounded bg-gray-200" />
										</td>
									)}
									{columnasConAcciones.map((_, j) => (
										<td key={j} className="px-4 py-3">
											<div className="h-4 w-32 rounded bg-gray-200" />
										</td>
									))}
								</tr>
							))
						) : datosPagina.length === 0 ? (
							<tr>
								<td colSpan={(columnasConAcciones.length || 1) + (seleccionable ? 1 : 0)} className="px-4 py-10 text-center text-sm text-gray-500">
									{tx.sinResultados}
								</td>
							</tr>
						) : (
							datosPagina.map((fila, i) => {
								const indiceGlobal = inicio + i;
								const rid = idFila(fila, indiceGlobal);
								return (
									<tr key={String(rid)} className={`hover:bg-gray-50 ${alClickFila ? "cursor-pointer" : ""}`} onClick={() => alClickFila?.(fila)}>
										{seleccionable && (
											<td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
												<input
													type="checkbox"
													aria-label={`Seleccionar fila ${indiceGlobal + 1}`}
													checked={seleccion.has(rid)}
													onChange={() => alternarUna(rid)}
													className="h-4 w-4 rounded border-gray-300"
												/>
											</td>
										)}
										{columnasConAcciones.map((c, j) => {
											const valor = c.acceso ? c.acceso(fila) : (fila as any)[c.clave as any];
											return (
												<td
													key={j}
													className={`px-4 py-3 text-sm text-gray-800 ${
														c.alinear === "right" ? "text-right" : c.alinear === "center" ? "text-center" : "text-left"
													}`}
												>
													{c.render ? c.render(valor, fila, indiceGlobal) : String(valor ?? "—")}
												</td>
											);
										})}
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
				<div className="text-sm text-gray-600">
					{total === 0 ? (
						"0"
					) : (
						<>
							{inicio + 1}-{Math.min(inicio + tamPagina, total)} {tx.de} {total}
						</>
					)}
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="rounded-xl border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
						onClick={() => setPagina(1)}
						disabled={paginaActual === 1}
					>
						«
					</button>
					<button
						type="button"
						className="rounded-xl border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
						onClick={() => setPagina((p) => Math.max(1, p - 1))}
						disabled={paginaActual === 1}
					>
						Anterior
					</button>
					<span className="px-2 text-sm text-gray-700">
						{paginaActual} / {totalPaginas}
					</span>
					<button
						type="button"
						className="rounded-xl border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
						onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
						disabled={paginaActual === totalPaginas}
					>
						Siguiente
					</button>
					<button
						type="button"
						className="rounded-xl border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
						onClick={() => setPagina(totalPaginas)}
						disabled={paginaActual === totalPaginas}
					>
						»
					</button>
				</div>
			</div>
		</div>
	);
}

export default DataTable;
