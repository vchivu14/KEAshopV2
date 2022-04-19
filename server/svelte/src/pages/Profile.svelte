<script>
  import { user } from "../stores/user.js";
  import axios from "axios";

  const uid = $user.id;
  let email;

  $: getProfile = async () => {
    const response = await axios.get(`accounts/:${uid}`, {
      email,
    }, { withCredentials: true });
    if (response.statusText !== "OK") {
      console.log(response);
    } else {
      document.getElementById("profileEmail").innerHTML(email);
    }
  };
</script>

<h1>👋 Welcome to your Profile {$user.fullname}</h1>
<button on:click={getProfile} type="submit">Get Email</button>
<p id="profileEmail" />
