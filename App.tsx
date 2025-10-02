import React, { useState, useEffect } from "react";
import { RickMortyType } from "./Ricktypes.ts";

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

	useEffect(() => {
		obtenerDatos();
	}, []);

	return (
		<div
			style={{
				padding: 24,
				border: "4px solid red",
				background: "#fffbe6",
				color: "#111",
				fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
			}}
			className="container"
		>
			<h1 className="display-5">✅CODESANDBOX Vite + React {contador}</h1>
			<p>Si ves este bloque con borde rojo, la app está montando bien.</p>
			<button className="btn btn-primary" onClick={() => setContador(contador + 1)}>
				Botón Bootstrap
			</button>
			{datos.map((dato) => (
				<>
					{dato.id % 2 == 0 ? dato.id : ""} <h1> {dato.name} </h1>
					<img src={dato.image} />
				</>
			))}
		</div>
	);
}
