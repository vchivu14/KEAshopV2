<script>
import { component_subscribe } from "svelte/internal";

    // We import the global user object from the Svelte store and store it inside the Home component's state _user
    import { user } from "../store/stores.js";

    let _user;

    user.subscribe(data => _user = data)

    // For the logout function we simply set this user object in your store to null and clear local storage.
    const logout = () => {
        user.set(null);
        localStorage.clear();
    }
</script>

<!-- Here we use Svelte conditionals to render the user's name and a logout button. -->
{#if user && _user}
<h3>Welcome {_user?.profile?.FullName}</h3>
<button on:click="{logout}">Logout</button>
{/if}

