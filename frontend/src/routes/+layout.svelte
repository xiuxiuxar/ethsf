<script>
	export const ssr = false;
	export const prerender = false;

	import "../app.postcss";
	import { AppShell, AppBar } from "@skeletonlabs/skeleton";
	import { initializeStores, Toast } from "@skeletonlabs/skeleton";
	import Logo from "../lib/components/Logo.svelte";

	// Highlight JS
	import hljs from "highlight.js/lib/core";
	import "highlight.js/styles/github-dark.css";
	import { storeHighlightJs } from "@skeletonlabs/skeleton";
	import xml from "highlight.js/lib/languages/xml"; // for HTML
	import css from "highlight.js/lib/languages/css";
	import javascript from "highlight.js/lib/languages/javascript";
	import typescript from "highlight.js/lib/languages/typescript";

	hljs.registerLanguage("xml", xml); // for HTML
	hljs.registerLanguage("css", css);
	hljs.registerLanguage("javascript", javascript);
	hljs.registerLanguage("typescript", typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import {
		computePosition,
		autoUpdate,
		flip,
		shift,
		offset,
		arrow,
	} from "@floating-ui/dom";
	import { storePopup } from "@skeletonlabs/skeleton";

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<Toast />
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header"
		><AppBar>
			<div class="flex items-center">
				<svelte:component this={Logo} />
				<h2>EDUCATION STATION</h2>
			</div></AppBar
		></svelte:fragment
	>
	<!-- Page Route Content -->
	<slot />
</AppShell>
