declare module "@php-wasm/web-8-4" {
	import type { PHPLoaderModule } from "@php-wasm/universal";

	export function getPHPLoaderModule(): Promise<PHPLoaderModule>;
	export function getIntlExtensionPath(): Promise<string>;
	export function jspi(): Promise<boolean>;
}
