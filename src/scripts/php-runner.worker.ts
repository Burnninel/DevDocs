type PHPInstance = import("@php-wasm/universal").PHP;
type PHPUniversal = typeof import("@php-wasm/universal");

type RunRequest = {
	type: "run";
	id: number;
	code: string;
};

type StatusMessage = {
	type: "status";
	id: number;
	status: "loading" | "running";
};

type ResultMessage = {
	type: "result";
	id: number;
	result: {
		stdout: string;
		stderr: string;
		exitCode: number;
		durationMs: number;
	};
};

type ErrorMessage = {
	type: "error";
	id: number;
	message: string;
};

let phpPromise: Promise<PHPInstance> | null = null;
let phpExecutionFailureError: PHPUniversal["PHPExecutionFailureError"] | null =
	null;
let phpResponse: PHPUniversal["PHPResponse"] | null = null;

function getPhp(): Promise<PHPInstance> {
	phpPromise ??= (async () => {
		const [{ getPHPLoaderModule }, universal] = await Promise.all([
			import("@php-wasm/web-8-4"),
			import("@php-wasm/universal"),
		]);

		phpExecutionFailureError = universal.PHPExecutionFailureError;
		phpResponse = universal.PHPResponse;

		const loader = await getPHPLoaderModule();
		const runtimeId = await universal.loadPHPRuntime(loader, { debug: false });
		return new universal.PHP(runtimeId);
	})();
	phpPromise.catch(() => {
		phpPromise = null;
	});
	return phpPromise;
}

async function runCode(message: RunRequest): Promise<void> {
	postStatus(message.id, "loading");
	const php = await getPhp();

	postStatus(message.id, "running");
	const startedAt = performance.now();

	try {
		const streamedResponse = await php.runStream({ code: message.code });
		if (!phpResponse) {
			throw new Error("O runtime PHP carregou sem a API de resposta esperada.");
		}

		const response = await phpResponse.fromStreamedResponse(streamedResponse);
		postResult(message.id, {
			stdout: response.text,
			stderr: response.errors,
			exitCode: response.exitCode,
			durationMs: performance.now() - startedAt,
		});
	} catch (error) {
		if (phpExecutionFailureError && error instanceof phpExecutionFailureError) {
			postResult(message.id, {
				stdout: error.response.text,
				stderr: error.response.errors || error.message,
				exitCode: error.response.exitCode,
				durationMs: performance.now() - startedAt,
			});
			return;
		}

		postError(message.id, formatError(error));
	}
}

function postStatus(id: number, status: StatusMessage["status"]): void {
	self.postMessage({ type: "status", id, status } satisfies StatusMessage);
}

function postResult(id: number, result: ResultMessage["result"]): void {
	self.postMessage({ type: "result", id, result } satisfies ResultMessage);
}

function postError(id: number, message: string): void {
	self.postMessage({ type: "error", id, message } satisfies ErrorMessage);
}

function formatError(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

// O worker roda uma execução por vez por construção: use-code-runner.ts (main
// thread) já serializa as chamadas antes de postar a próxima mensagem "run",
// então não é preciso uma fila própria aqui também.
self.addEventListener("message", (event: MessageEvent<RunRequest>) => {
	const message = event.data;
	if (message?.type !== "run") return;

	runCode(message).catch((error) => {
		postError(message.id, formatError(error));
	});
});
