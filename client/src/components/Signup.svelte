<script>
  let email;
  let password;
  let firstName;
  let lastName;

  export let sdkoptions;

  //   The signupFields object has a specific format because it aligns with the structure of your signup API.
  //   It will make complete sense when we hook the API here.
  //   const handleSubmit = () => {
  //     const signupFields = {
  //       FirstName: firstName,
  //       LastName: lastName,
  //       Email: [
  //         {
  //           Type: "Primary",
  //           Value: email,
  //         },
  //       ],
  //       Password: password,
  //     };
  //     console.log(signupFields);
  //   };

  const navigateToLogin = () => {};

  // INTEGRATE SIGNUP API
  // We will create a variable called signupResponse to store the result of the SignupAPI.
  // It has properties like success and error to prompt the user on the status of the API calls.
  let signupResponse = {
    success: null,
    error: null,
    uid: null,
    id: null,
    fullname: null,
  };
  // Since an API request is an asynchronous process we also have a loading variable to disable the submit button
  //    until the API responds.
  let loading;

  // We need to send a request to the signup API inside the handleSubmit() function.
  //    First, set the loading variable to true and reset the signupResponse object.
  //    Then, use the fetch API to make a POST request with the signupFields object as post parameter.
  const handleSubmit = () => {
    const signupFields = {
      FirstName: firstName,
      LastName: lastName,
      Email: [
        {
          Type: "Primary",
          Value: email,
        },
      ],
      Password: password,
    };
    loading = true;
    signupResponse = {
      success: null,
      error: null,
      uid: null,
      id: null,
      fullname: null,
    }
    const endpoint = `${sdkoptions.BASE_URL_SIGNUP}`;
    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(signupFields),
    })
    .then(response => response.json())
    // .then(data => {})
    // Inside this callback of the fetch request we can handle any errors returned by the API based on different error codes. 
    // In case of success we will populate the signupResponse object with data from the API.
    // In the finally blck we set the loading to false
    .then(data => {
        if (data.ErrorCode) {
            if (data.ErrorCode == 936) {
                signupResponse = {
                    ...signupResponse,
                    error:data.Message
                }
            } else if (data.ErrorCode == 1134) {
                signupResponse = {
                    ...signupResponse,
                    error:data.Errors[0].ErrorMessage
                }
            } else{
                signupResponse = {
                    ...signupResponse,
                    error:data.Description
                }
            }
        } else {
            signupResponse = {
                ...signupResponse,
                success: "Account created successfully! Please login now!",
                fullname: data.FullName,
                id: data.id,
                uid: data.Uid
            }
        }
    })
    .catch(error => console.log(error))
    .finally(() => (loading = false))
  };
</script>

<h3>Create a New Account</h3>
<form on:submit|preventDefault={handleSubmit}>
  <input
    class="form-field"
    bind:value={firstName}
    type="text"
    placeholder="First Name"
  />
  <input
    class="form-field"
    bind:value={lastName}
    type="text"
    placeholder="Last Name"
  />
  <input
    class="form-field"
    bind:value={email}
    type="email"
    placeholder="Email"
  />
  <input
    class="form-field"
    bind:value={password}
    type="password"
    placeholder="Password"
  />
  <button disabled="{loading}" class="form-field"> Signup </button>
</form>
<!-- <p>
  Already have an account?
  <strong class="link" on:click={navigateToLogin}>Login</strong>
</p> -->

{#if signupResponse.error}
    <p class="error">Error {signupResponse.error}</p>
{:else}
    <p class="success">Success {signupResponse.success}</p>
{/if}