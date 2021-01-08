import { useEffect, useRef, useState } from 'react';

const workerHandler = (fn) => {
	onmessage = (event) => {
		postMessage(fn(event.data));
	};
};

export const useWebworker = (fn) => {
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);
	const [isProcess, setIsProcess] = useState(false);

	const workerRef = useRef(null);

	useEffect(() => {
		setIsProcess(true);
		const worker = new Worker(URL.createObjectURL(new Blob([`(${workerHandler})(${fn})`])));
		workerRef.current = worker;
		worker.onmessage = (event) => {
			setResult(event.data);
			setIsProcess(false);
		};
		worker.onerror = (error) => {
			setError(error.message);
			setIsProcess(false);
		};
		return () => {
			setIsProcess(false);
			worker.terminate();
		};
	}, [fn]);

	return {
		result,
		isProcess,
		error,
		run: (value) => workerRef.current.postMessage(value),
	};
};

export const useDisposableWebworker = (fn) => {
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);
	const [isProcess, setIsProcess] = useState(false);

	const run = (value) => {
		setIsProcess(true);
		const worker = new Worker(URL.createObjectURL(new Blob([`(${workerHandler})(${fn})`])));
		worker.onmessage = (event) => {
			setResult(event.data);
			setIsProcess(false);
			worker.terminate();
		};
		worker.onerror = (error) => {
			setError(error.message);
			setIsProcess(false);
			worker.terminate();
		};
		worker.postMessage(value);
	};

	return {
		result,
		isProcess,
		error,
		run,
	};
};
