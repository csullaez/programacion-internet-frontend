import React, { useState, useEffect } from "react";
import { RickMortyType } from "./Ricktypes";
import DataTable from "./components/DataTable.js";

export default function App() {
	const [contador, setContador] = useState<number>(0);
	const [datos, setDatos] = useState<Array<RickMortyType>>([]);

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
			render: (_, row) => (
				<button className="text-sm underline" onClick={() => alert(row.name)}>
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

	return (
		<div>
			<DataTable columnas={columnas} datos={datos2} buscable pageSizeOptions={[15, 10, 20]} />
		</div>
	);
}
