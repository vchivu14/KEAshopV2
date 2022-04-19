<script>
    import axios from "axios";
    import { toast } from '@zerodevx/svelte-toast'

    let email = "";
  
    $: submit = async () => {
      const response = await axios.post("accounts/forgot-password", { email });
      if (response.statusText === "OK") {
        toast.push("Password reset instructions were sent to your email. Please check!")
        document.getElementById("forgotPassForm").reset();
      }
    };
  </script>
  
  <main class="form-signin">
    <form id="forgotPassForm" on:submit|preventDefault={submit}>
      <h1 class="h3 mb-3 fw-normal">Forgot Password</h1>
  
      <div class="form-floating">
        <input bind:value={email} type="email" class="form-control" />
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>Email address</label>
      </div>

      <br>

      <button
        class="w-100 btn btn-lg btn-primary" type="submit">Reset password</button>
    </form>
  </main>