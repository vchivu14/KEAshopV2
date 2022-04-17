<script>
    import { Route } from 'svelte-routing';
    import AccessDenied from './AccessDenied.svelte';
    import { user } from "../stores/user";

    export let path;
    export let component;

</script>

<!-- Here we can import the token we exported from stores.js, and use it as a reactive variable. 
    If the user is authenticated, we’re good to render the requested page, otherwise, we can throw a 403. 
    The 403 page, in this case, can render a link back to a safe place; the home page -->
{#if $user }
    <Route path={path} component={component}/>
{:else}
    <Route path={path} component={AccessDenied}/>
{/if}