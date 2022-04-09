<script>
    import Login from "./components/Login.svelte";
    import Signup from "./components/Signup.svelte";

    const sdkoptions = {
        // "apiKey": __myapp["env"].API_CLIENT_KEY,
	    // "appName":__myapp["env"].APP_NAME,
        // "apiSecret":__myapp["env"].API_SECRET
        "BASE_URL_LOGIN": __myapp["env"].BASE_URL_LOGIN,
        "BASE_URL_SIGNUP": __myapp["env"].BASE_URL_SIGNUP
    }
</script>

<main>
    <Login {sdkoptions}/>
    <!-- <Signup {sdkoptions}/> -->
</main>