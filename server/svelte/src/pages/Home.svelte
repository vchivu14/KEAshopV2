<script>
    import { user } from "../stores/user.js";
    import { Link, navigate } from "svelte-routing";
	import axios from "axios";

	$: logout = async () => {
        await axios.post('accounts/logout');
        axios.defaults.headers.common['Authorization'] = '';
		localStorage.clear();
        await navigate('/login');
    }
</script>

<header class="p-3 bg-dark text-white">
	<div class="container">
		<div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
			<ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
				<li class="btn btn-outline-light me-2">
					<Link to="/">Home</Link>
				</li>
			</ul>
			<div class="text-end">
				{#if $user}
					<button on:click={logout} type="submit">Logout</button>
					<li class="btn btn-outline-light me-2">
						<Link to="profile">Profile</Link>
					</li>
				{/if}
				{#if !$user}
				<li class="btn btn-outline-light me-2">
					<Link to="login">Login</Link>
				</li>
				<li class="btn btn-outline-light me-2">
					<Link to="register">Register</Link>
				</li>
				{/if}
			</div>
		</div>
	</div>
</header>

<h1>👋 Welcome to the home page</h1>
{#if $user}
    <h3>{$user.fullname}</h3>
{/if}