export type RunnerStatus = "loading" | "running";

export type RunnerResult = {
	stdout: string;
	stderr: string;
	exitCode: number;
	durationMs: number;
};

type RunRequest = {
	type: "run";
	id: number;
	code: string;
};

type WorkerMessage =
	| {
			type: "status";
			id: number;
			status: RunnerStatus;
	  }
	| {
			type: "result";
			id: number;
			result: RunnerResult;
	  }
	| {
			type: "error";
			id: number;
			message: string;
	  };

type PendingRun = {
	resolve: (result: RunnerResult) => void;
	reject: (reason?: unknown) => void;
	onStatus?: (status: RunnerStatus) => void;
	timer: number;
};

const LOAD_TIMEOUT_MS = 60_000;
const RUN_TIMEOUT_MS = 6_000;

let worker: Worker | null = null;
let nextId = 1;
let pendingRuns = new Map<number, PendingRun>();
let queue: Promise<void> = Promise.resolve();

export class RunnerTimeoutError extends Error {
	constructor() {
		super("A execução passou de 6s e foi interrompida.");
		this.name = "RunnerTimeoutError";
	}
}

export function runPhpCode(
	code: string,
	onStatus?: (status: RunnerStatus) => void,
): Promise<RunnerResult> {
	const job = () => postRun(code, onStatus);
	const run = queue.then(job, job);
	queue = run.then(
		() => undefined,
		() => undefined,
	);
	return run;
}

function postRun(
	code: string,
	onStatus?: (status: RunnerStatus) => void,
): Promise<RunnerResult> {
	const activeWorker = ensureWorker();
	const id = nextId++;

	return new Promise((resolve, reject) => {
		const pending: PendingRun = {
			resolve,
			reject,
			onStatus,
			timer: window.setTimeout(() => {
				rejectRun(id, new Error("O PHP demorou demais para carregar."));
				resetWorker();
			}, LOAD_TIMEOUT_MS),
		};

		pendingRuns.set(id, pending);
		activeWorker.postMessage({ type: "run", id, code } satisfies RunRequest);
	});
}

function ensureWorker(): Worker {
	if (worker) return worker;

	worker = new Worker(new URL("./php-runner.worker.ts", import.meta.url), {
		type: "module",
	});
	worker.addEventListener("message", handleWorkerMessage);
	worker.addEventListener("error", handleWorkerFailure);
	worker.addEventListener("messageerror", handleWorkerFailure);

	return worker;
}

function handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
	const message = event.data;
	const pending = pendingRuns.get(message.id);
	if (!pending) return;

	if (message.type === "status") {
		pending.onStatus?.(message.status);
		if (message.status === "running") {
			window.clearTimeout(pending.timer);
			pending.timer = window.setTimeout(() => {
				rejectRun(message.id, new RunnerTimeoutError());
				resetWorker();
			}, RUN_TIMEOUT_MS);
		}
		return;
	}

	window.clearTimeout(pending.timer);
	pendingRuns.delete(message.id);

	if (message.type === "result") {
		pending.resolve(message.result);
		return;
	}

	pending.reject(new Error(message.message));
	resetWorker();
}

function handleWorkerFailure(event: Event | ErrorEvent): void {
	const message =
		"message" in event && event.message
			? event.message
			: "O worker do PHP falhou antes de responder.";
	for (const id of Array.from(pendingRuns.keys())) {
		rejectRun(id, new Error(message));
	}
	resetWorker();
}

function rejectRun(id: number, error: unknown): void {
	const pending = pendingRuns.get(id);
	if (!pending) return;

	window.clearTimeout(pending.timer);
	pendingRuns.delete(id);
	pending.reject(error);
}

function resetWorker(): void {
	if (worker) {
		worker.removeEventListener("message", handleWorkerMessage);
		worker.removeEventListener("error", handleWorkerFailure);
		worker.removeEventListener("messageerror", handleWorkerFailure);
		worker.terminate();
		worker = null;
	}

	for (const [id, pending] of pendingRuns) {
		window.clearTimeout(pending.timer);
		pending.reject(new Error("O runtime PHP foi reiniciado."));
		pendingRuns.delete(id);
	}
}
