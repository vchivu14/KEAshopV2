<script>
    // We want to validate the password on the front-end so we declare two variables
    //  that we will use to check if the password is matching the conditions for a strong password
    //  using regex expressions.
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

</script>