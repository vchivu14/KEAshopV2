<script>
  import { user } from "../stores/user.js";
  import axios from "axios";
  import { onMount } from "svelte";

  onMount(async () => {
    // this call would be useful when trying to edit the profile,
    //  now it's retrieving some data we already have in the store
    const response = await axios.get(`accounts/${$user.id}`, 
      { headers: {'Authorization': `Bearer ${$user.token}`} }, {withCredentials: true});
    if (response.statusText === "OK") {
      document.getElementById("profileEmail").textContent = `${response.data.email}`
    }
  });
</script>

<h1>👋 Welcome to your Profile {$user.fullname}</h1>
<p>Your Email is:</p>
<p id="profileEmail"></p>
