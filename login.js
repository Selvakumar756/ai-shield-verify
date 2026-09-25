const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.textContent = "Logging in...";

    try {

        const response = await fetch("http://127.0.0.1:8080/api/auth/login",  {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (response.ok) {

            const user = await response.json();

            localStorage.setItem("user", JSON.stringify(user));

            message.textContent = "Login successful!";

            window.location.href = "dashboard.html";

        } else {

            message.textContent = "Invalid email or password.";

        }

    } catch (error) {

        console.log(error);

        message.textContent = "Backend connection failed.";

    }

});