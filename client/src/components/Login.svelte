<!-- A login form with two input fields for email and password and a submit button.
The form has an on:submit handler with an event modifier to prevent the default reloading action of the form when it gets submitted
After the form we have a simple link with an on:click handler that allows the user to navigate to the sign up page. -->
<script>
  // Inside the script we have two variables email and password to handle the bindings to the input fields.
  // Also make the sdkoptions variable exportable since we will receive it as props from the app component
  let email = "";
  let password = "";

  export let sdkoptions;

  // We need a function called handleSubmit that is the on:submit handler for the Login form
  // This function right now is simply encapsulating the email and password bindings into a JavaScript Object.
  // Later we will send a request to the Login API.
  //   const handleSubmit = (e) => {
  //     let loginFields = { email, password };
  //   };
  //   const navigateToSignup = () => {};

  // VALIDATE PASSWORD
  let strength = 0;
  let validations = [];
  let showPassword = false;

  function validatePassword(e) {
    const password = e.target.value;
    validations = [
      password.length > 5,
      password.search(/[A-Z]/) > -1,
      password.search(/[0-9]/) > -1,
      password.search(/[!@#$%^&*]/) > -1,
    ];
    strength = validations.reduce((acc, current) => acc + current);
  }

  //   INTEGRATE LOGIN API
  import { user } from "../store/stores.js";

  let loading;
  let isSuccess;
  let loginResponse = {
    error: null,
    success: null,
    profile: null,
  };

  const handleSubmit = (e) => {
    let loginFields = { email, password };
    loading = true;
    isSuccess = false;
    loginResponse = {
      error: null,
      success: null,
      profile: null,
    };

    const endpoint = `${sdkoptions.BASE_URL_LOGIN}`;

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginFields),
    })
      .then(response => {
        if (!response.ok) {
          loginResponse.error = response.statusText;
        }
        return response;
      })
      .then(response => response.json())
      .then(data => {
          isSuccess = true;
          loginResponse = {
            ...loginResponse,
            success: true,
            profile: data.Profile,
          };
        user.set(loginResponse);
        localStorage.setItem("user", JSON.stringify(loginResponse));
      })
      .catch((error) => {
        loginResponse.error == error
      })
      .finally(() => {
        loading = false
      });
  };
</script>

<div class="login-form">
  <h3>Login</h3>
  <form on:submit|preventDefault={handleSubmit}>
    {#if isSuccess}
      <div class="success">
        🔓
        <br />
        You've been successfully logged in.
      </div>
    {:else}
      <h1>👤</h1>
    {/if}

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Email</label>
    <input
      name="email"
      class="form-field"
      bind:value={email}
      type="email"
      placeholder="name@example.com"
    />
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Password</label>
    <input
      name="password"
      class="form-field"
      bind:value={password}
      type="password"
      on:input={validatePassword}
    />
    <button type="submit">
      {#if loading}Logging in...{:else}Log in 🔒{/if}
    </button>

    <div class="strength">
      <span class="bar bar-1" class:bar-show={strength > 0}/>
      <span class="bar bar-2" class:bar-show={strength > 1}/>
      <span class="bar bar-3" class:bar-show={strength > 2}/>
      <span class="bar bar-4" class:bar-show={strength > 3}/>

    </div>

    <ul>
      <li>{validations[0] ? '✔️' : '❌'} Must be at least 6 characters</li>
      <li>{validations[1] ? '✔️' : '❌'} Must contain a capital letter</li>
      <li>{validations[2] ? '✔️' : '❌'} Must contain a number</li>
      <li>{validations[3] ? '✔️' : '❌'} Must contain a special character</li>

    </ul>

    {#if loginResponse.error}
      <p class="errors">Error ❌ {loginResponse.error}</p>
    {/if}
    {#if loginResponse.success}
      <p class="success">Success ✔</p>
    {/if}

    <!-- <p>
        Don't have an account?
        <strong class="link" on:click={navigateToSignup}>Sign up</strong>
    </p> -->
  </form>
</div>

<style>
  .login-form {
    background: #fff;
    padding: 50px;
    width: 250px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 20px 14px 8px rgba(0, 0, 0, 0.58);
  }
  label {
    margin: 10px 0;
    align-self: flex-start;
    font-weight: 500;
  }
  input {
    border: none;
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
    transition: all 300ms ease-in-out;
    width: 100%;
  }
  input:focus {
    outline: 0;
    border-bottom: 1px solid #666;
  }
  button {
    margin-top: 20px;
    background: black;
    color: white;
    padding: 10px 0;
    width: 200px;
    border-radius: 25px;
    text-transform: uppercase;
    font-weight: bold;
    cursor: pointer;
    transition: all 300ms ease-in-out;
  }
  button:hover {
    transform: translateY(-2.5px);
    box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.58);
  }
  h1 {
    margin: 10px 20px 30px 20px;
    font-size: 40px;
  }
  .errors {
    list-style-type: none;
    padding: 10px;
    margin: 0;
    border: 2px solid #be6283;
    color: #be6283;
    background: rgba(190, 98, 131, 0.3);
  }
  .success {
    font-size: 24px;
    text-align: center;
  }
</style>
