import React from "react";

export function Select({ value, onValueChange, disabled, children }) {
	return (
		<select
			value={value}
			onChange={(e) => onValueChange(e.target.value)}
			disabled={disabled}
			className="flex px-3 py-2 w-full h-10 text-sm bg-white rounded-md border ring-offset-white border-slate-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
		>
			{children}
		</select>
	);
}

export function SelectTrigger({ children, className, ...props }) {
	return (
		<div className={className} {...props}>
			{children}
		</div>
	);
}

export function SelectContent({ children }) {
	return <>{children}</>;
}

export function SelectItem({ value, children }) {
	return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }) {
	return placeholder;
}
