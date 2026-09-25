
// ========================================
// REGISTER FORM
// ========================================

const registerForm = document.getElementById("registerForm");

const message = document.getElementById("message");


// ========================================
// PASSWORD TOGGLE
// ========================================

const password = document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");


togglePassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.textContent = "🙈";

    } else {

        password.type = "password";

        togglePassword.textContent = "👁";
    }

});


toggleConfirmPassword.addEventListener("click", function () {

    if (confirmPassword.type === "password") {

        confirmPassword.type = "text";

        toggleConfirmPassword.textContent = "🙈";

    } else {

        confirmPassword.type = "password";

        toggleConfirmPassword.textContent = "👁";
    }

});


// ========================================
// REGISTER
// ========================================

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const fullName =
        document.getElementById("fullName").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const passwordValue =
        password.value;

    const confirmPasswordValue =
        confirmPassword.value;

    const terms =
        document.getElementById("terms").checked;


    // ========================================
    // VALIDATION
    // ========================================

    if (!fullName ||
        !email ||
        !phone ||
        !passwordValue ||
        !confirmPasswordValue) {

        message.textContent =
            "Please fill all fields.";

        message.style.color = "#ff6b6b";

        return;
    }


    if (phone.length !== 10 ||
        !/^\d{10}$/.test(phone)) {

        message.textContent =
            "Please enter a valid 10-digit phone number.";

        message.style.color = "#ff6b6b";

        return;
    }


    if (passwordValue.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        message.style.color = "#ff6b6b";

        return;
    }


    if (passwordValue !== confirmPasswordValue) {

        message.textContent =
            "Passwords do not match.";

        message.style.color = "#ff6b6b";

        return;
    }


    if (!terms) {

        message.textContent =
            "Please accept the terms and conditions.";

        message.style.color = "#ff6b6b";

        return;
    }


    // ========================================
    // BUTTON
    // ========================================

    const registerButton =
        document.querySelector(".register-btn");

    registerButton.disabled = true;

    registerButton.innerHTML =
        "Creating Account...";


    message.textContent = "";


    try {

        // ========================================
        // BACKEND API
        // ========================================

        const response = await fetch(
            "http://127.0.0.1:8080/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    fullName: fullName,

                    email: email,

                    password: passwordValue,

                    phone: phone

                })
            }
        );


        // ========================================
        // RESPONSE
        // ========================================

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);
        }


        const user =
            await response.json();


        console.log(
            "Registration successful:",
            user
        );


        message.textContent =
            "Account created successfully!";

        message.style.color = "#35e58a";


        // ========================================
        // GO TO LOGIN
        // ========================================

        setTimeout(function () {

            window.location.href = "index.html";

        }, 1500);


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        message.textContent =
            "Registration failed: " +
            error.message;

        message.style.color = "#ff6b6b";


        registerButton.disabled = false;

        registerButton.innerHTML =
            'Create Account <span>→</span>';
    }

});