<script>
  import axios from "axios";
  import { navigate } from "svelte-routing";

  // the values from the fields we are going to use to register an account are captured in these variables
  let title = "",
    firstName = "",
    lastName = "",
    email = "",
    password = "",
    confirmPassword = "",
    acceptTerms = true;
  let message = "";

  // We want to validate the password on the front-end so we declare two variables
  //  that we will use to check if the password is matching the conditions for a strong password using regex expressions.
  let strength = 0;
  let validations = [];
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

  function validatePasswordsMatch(e) {
    const passwordElement = document.getElementById("passMatch");
    if (document.getElementById("password").value == e.target.value) {
      passwordElement.innerHTML = "✔️ Passwords Match"
    } else {
      passwordElement.innerHTML = "❌ Passwords Do Not Match"
    }
  }

  function validateEmail(e) {
    const emailElement = document.getElementById("emailC")
    if (e.target.value.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      emailElement.innerHTML = "✔️ Valid Email"
    } else {
      emailElement.innerHTML = "❌ Not a Valid Email"
    }
  }

  function activateButton() {
    const terms = document.getElementById("terms");
    const button = document.getElementById("submit");
    if(terms.checked) {
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  }

  // we will make this function async to prevent any errors that might interrupt our application
  $: submit = async () => {
    // axios will make this call for us together with all the parameters we will define bellow
    // we can abstract the location of our API in this form by setting axios to one default base URL
    // we can also implement some protocol for our application requests with axiox so first we will open
    //  a separate file called axios.js where we can write this logic and import it in the main.js file that starts
    //  the app component.
    const response = await axios.post(
      "accounts/register", 
      {
        // title: title,
        // if the name of the variables and the name of the json fields we want to send in the request
        //  are the same we could write the name just once.
        title,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        acceptTerms,
      }
    );

    if (response.statusText !== "OK") {
      message = response;
      console.log(message);
    }
    // and if this is successful we want to redirect to the login page
    await navigate("/login");
  };
</script>

<main class="form-signin">
  <form on:submit|preventDefault={submit}>
    <h1 class="h3 mb-3 fw-normal">Please register</h1>

    <div class="form-floating">
      <select bind:value={title} class="form-control">
        <option selected="selected" value="Mr.">Mr.</option>
        <option value="Mrs.">Mrs.</option>
        <option value="Miss">Miss</option>
      </select>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>Title</label>
    </div>

    <div class="form-floating">
      <input bind:value={firstName} class="form-control" />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>First Name</label>
    </div>

    <div class="form-floating">
      <input bind:value={lastName} class="form-control" />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>Last Name</label>
    </div>

    <div class="form-floating">
      <input bind:value={email} 
      type="email" 
      class="form-control"
      on:keyup={validateEmail}
      />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>Email address</label>
    </div>

    <div class="form-floating">
      <input 
      bind:value={password}
      id = "password" 
      type="password" 
      class="form-control" 
      on:input={validatePassword}
      />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>Password</label>
    </div>

    <div class="form-floating">
      <input
        bind:value={confirmPassword}
        id = "confirmPassword"
        type="password"
        class="form-control"
        on:input={validatePasswordsMatch}
      />
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label>Confirm Password</label>
    </div>
    <input type="checkbox" name="terms" id="terms" on:change={activateButton}>  I Agree Terms & Coditions
    <br><br>
    <button id="submit" class="w-100 btn btn-lg btn-primary" type="submit" disabled=true>Submit</button>

    <div class="strength">
      <span class="bar bar-1" class:bar-show={strength > 0} />
      <span class="bar bar-2" class:bar-show={strength > 1} />
      <span class="bar bar-3" class:bar-show={strength > 2} />
      <span class="bar bar-4" class:bar-show={strength > 3} />
    </div>

    <ul id="passValidations">
      <li id="emailC">❌ Not a Valid Email</li>
      <li>{validations[0] ? "✔️" : "❌"} Must be at least 6 characters</li>
      <li>{validations[1] ? "✔️" : "❌"} Must contain a capital letter</li>
      <li>{validations[2] ? "✔️" : "❌"} Must contain a number</li>
      <li>{validations[3] ? "✔️" : "❌"} Must contain a special character</li>
      <li id="passMatch">❌ Passwords Do Not Match</li>
    </ul>

  </form>
</main>

<style>
  .form-signin {
    width: 100%;
    max-width: 330px;
    padding: 15px;
    margin: auto;
  }

  .form-signin .checkbox {
    font-weight: 400;
  }

  .form-signin .form-floating:focus-within {
    z-index: 2;
  }

  .form-signin input[type="email"] {
    margin-bottom: -1px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .form-signin input[type="password"] {
    margin-bottom: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
</style>
