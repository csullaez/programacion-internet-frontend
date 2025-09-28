import React, { ComponentProps, useState } from "react";

interface IButtonCounterProps extends ComponentProps<"button"> {
	name: string;
	onClicked?: (e: number) => void;
}

export const ButtonCounter = ({ name, onClicked }: IButtonCounterProps) => {
	const [count, setCount] = useState<number>(0);

	const handleClick = () => {
		const result = count + 1;
		setCount(result);
		onClicked && onClicked(result);
	};

	return (
		<button type="button" onClick={() => handleClick()} className="btn btn-primary">
			{name} - You clicked me {count} times
		</button>
	);
};
