import App from './App.svelte';
import "./_interceptors/axios";

const app = new App({
	target: document.body,
	props: {
	}
});

export default app;