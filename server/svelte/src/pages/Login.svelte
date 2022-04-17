<!-- 
    A login form with two input fields for email and password and a submit button.
    The form has an on:submit handler with an event modifier to prevent the default reloading action of the form 
        when it gets submitted.
    Just bellow the form we have a simple link with an on:click handler that allows the user to navigate to 
        the sign up page. 
-->
<script>
  import axios from "axios";
  import { user } from "../stores/user";
  import { navigate } from "svelte-routing";

  // In the script we declare two variables email and password to handle the bindings to the input fields of the form.
  let email = "";
  let password = "";

  // We need a function called handleSubmit that is the <on:submit> handler for the Login form.
  // This function right now is simply encapsulating the email and password bindings into a JavaScript Object.
  // Later we will send a request to the Login API from this function.
  // const handleSubmit = (e) => {
  //    let loginFields = { email, password };
  // };

  // We will declare a loginResponse variable that we can optionally save in the local storage of the browser
  //    or in a svelte store and access from anywhere & a loding variable for interactive UI while logging in.
  let loading;
  let loginResponse = {
    error: null,
    success: null,
    profile: null,
  };

  // Now let's define the function that we will use to handle submition of the form
  // We will use axios to send the request & svelte-spa-router to redirect.
  // $: marks a statement as reactive, runs immediately before the component updates,
  //    whenever the values that they depend on have changed.
  $: submit = async () => {
    loading = true;
    const response = await axios.post(
      "accounts/authenticate",
      {
        email,
        password,
      },
      { withCredentials: true }
    );
      
    if (response.statusText !== "OK") {
      loginResponse.error = "Bad Credentials";
      loading = false;
    } else {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      loginResponse = {
        ...loginResponse,
        success: true,
        profile: response.data,
      };
      let _user = {
        id: loginResponse.profile.id,
        fullname: loginResponse.profile.lastName + " " + loginResponse.profile.firstName,
        token: loginResponse.profile.jwtToken
      };
      localStorage.setItem("user", JSON.stringify(_user));
      user.set(_user);
      loading = false;
      await navigate("/", { replace: true });
    }
  };

</script>

<main class="form-signin">
  <form on:submit|preventDefault={submit}>
    <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

    <div class="form-floating">
      <input bind:value={email} type="email" class="form-control" />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>Email address</label>
    </div>

    <div class="form-floating">
      <input bind:value={password} type="password" class="form-control" />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>Password</label>
    </div>

    <button class="w-100 btn btn-lg btn-primary" type="submit">
      {#if loading}Logging in...{:else}Log in 🔒{/if}
    </button>
    {#if loginResponse.error !== null}
      <p class="errors">Error ❌ {loginResponse.error}</p>
    {/if}
    {#if loginResponse.success}
      <p class="success">Success ✔</p>
    {/if}
  </form>
</main>