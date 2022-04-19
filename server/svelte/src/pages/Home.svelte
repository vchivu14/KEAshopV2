<script>
    import { user } from "../stores/user.js";
	import Navbar from "../components/Navbar.svelte";
</script>

<Navbar/>

<h1>👋 Welcome to the home page</h1>
{#if $user}
    <h3>{$user.fullname}</h3>
{/if}