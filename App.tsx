import React, { useState, useEffect } from "react";
import { RickMortyType } from "./Ricktypes";
import DataTable from "./components/DataTable.js";

export default function App() {
	const [datos, setDatos] = useState<Array<RickMortyType>>([]);
	const [personajeSeleccionado, setPersonajeSeleccionado] = useState<RickMortyType | null>(null);
	const [mostrarModal, setMostrarModal] = useState<boolean>(false);

	const obtenerDatos = async () => {
		try {
			const resultado = await fetch("https://rickandmortyapi.com/api/character").then((res) => res.json());
			setDatos(resultado.results);
		} catch (error) {
			console.log("Existe un error al obtener datos", error);
		}
	};

	const columnas = [
		{ clave: "id", encabezado: "Id", ordenable: true },
		{ clave: "nombre", encabezado: "Nombre", ordenable: true },
		{ clave: "imagen", encabezado: "Imagen", ordenable: true },
		{
			clave: "acciones",
			encabezado: "Acciones",
			alinear: "right",
			render: (_, fila) => (
				<button className="text-sm underline" onClick={() => abrirModal(fila)}>
					Ver
				</button>
			),
		},
	];

	const datos2 = datos.map((dato) => {
		return {
			id: dato.id,
			nombre: dato.name,
			imagen: dato.image,
		};
	});

	useEffect(() => {
		obtenerDatos();
	}, []);

	const abrirModal = (fila: RickMortyType) => {
		setPersonajeSeleccionado(fila);
		setMostrarModal(true);
	};

	const cerrarModal = () => {
		setMostrarModal(false);
		setPersonajeSeleccionado(null);
	};

	return (
		<div>
			{mostrarModal && personajeSeleccionado && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-2xl shadow-lg p-6 w-96 relative">
						<button className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg" onClick={cerrarModal}>
							✕
						</button>
						<div className="flex flex-col items-center gap-3">
							<img src={personajeSeleccionado.imagen} alt={personajeSeleccionado.nombre} className="h-28 w-28 rounded-full border" />
							<h2 className="text-xl font-semibold">{personajeSeleccionado.nombre}</h2>
							<p className="text-gray-600">Estado: {personajeSeleccionado.estado}</p>
							<p className="text-gray-600">Especie: {personajeSeleccionado.especie}</p>
							<p className="text-gray-600">Género: {personajeSeleccionado.genero}</p>
						</div>
						<div className="mt-4 flex justify-end">
							<button className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700" onClick={cerrarModal}>
								Cerrar
							</button>
						</div>
					</div>
				</div>
			)}
			<DataTable columnas={columnas} datos={datos2} buscable opcionesTamPagina={[15, 10, 20]} />
		</div>
	);
}
