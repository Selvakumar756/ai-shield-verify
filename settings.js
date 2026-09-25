// ========================================
// Login Check
// ========================================

const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "index.html";
}

const user = JSON.parse(userData);


// ========================================
// Backend API
// ========================================

const API_URL = "http://127.0.0.1:8080";


// ========================================
// Load User Details
// ========================================

function loadUserDetails() {

    document.getElementById("topUserName").textContent =
        user.fullName || "User";

    document.getElementById("topUserEmail").textContent =
        user.email || "";

    document.getElementById("name").value =
        user.fullName || "";

    document.getElementById("email").value =
        user.email || "";

    document.getElementById("phone").value =
        user.phone || "";
}


// ========================================
// Load Settings From Backend
// ========================================

async function loadSettings() {

    try {

        const response = await fetch(
            `${API_URL}/api/settings/user/${user.id}`
        );

        if (!response.ok) {
            throw new Error("Failed to load settings");
        }

        const settings = await response.json();

        console.log("Settings loaded:", settings);


        // Notification settings
        document.getElementById("verificationAlerts").checked =
            settings.verificationNotifications ?? true;

        document.getElementById("securityAlerts").checked =
            settings.securityAlerts ?? true;

        document.getElementById("emailNotifications").checked =
            settings.emailNotifications ?? true;


        // Appearance
        document.getElementById("darkMode").checked =
            settings.darkMode ?? false;


        // Apply dark mode
        applyDarkMode(
            settings.darkMode ?? false
        );

    } catch (error) {

        console.error(
            "Settings loading error:",
            error
        );

    }
}


// ========================================
// Save Settings To Backend
// ========================================

async function saveSettings() {

    const settingsData = {

        userId: user.id,

        emailNotifications:
            document.getElementById(
                "emailNotifications"
            ).checked,

        verificationNotifications:
            document.getElementById(
                "verificationAlerts"
            ).checked,

        securityAlerts:
            document.getElementById(
                "securityAlerts"
            ).checked,

        darkMode:
            document.getElementById(
                "darkMode"
            ).checked,

        language: "English"

    };


    try {

        const response = await fetch(
            `${API_URL}/api/settings/user/${user.id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(settingsData)
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to save settings"
            );

        }


        const savedSettings =
            await response.json();

        console.log(
            "Settings saved:",
            savedSettings
        );


        applyDarkMode(
            savedSettings.darkMode
        );


        alert(
            "Settings saved successfully!"
        );


    } catch (error) {

        console.error(
            "Settings save error:",
            error
        );

        alert(
            "Failed to save settings."
        );
    }
}


// ========================================
// Save Settings Button
// ========================================

document
    .getElementById("saveProfile")
    .addEventListener(
        "click",
        async function () {

            /*
             * Current backend does not have
             * User Profile Update API yet.
             *
             * So this button saves the application
             * settings that are available.
             */

            await saveSettings();

        }
    );


// ========================================
// Notification Changes
// ========================================

document
    .getElementById("verificationAlerts")
    .addEventListener(
        "change",
        saveSettings
    );


document
    .getElementById("securityAlerts")
    .addEventListener(
        "change",
        saveSettings
    );


document
    .getElementById("emailNotifications")
    .addEventListener(
        "change",
        saveSettings
    );


// ========================================
// Dark Mode
// ========================================

document
    .getElementById("darkMode")
    .addEventListener(
        "change",
        async function () {

            const enabled = this.checked;

            applyDarkMode(enabled);

            await saveSettings();

        }
    );


// ========================================
// Apply Dark Mode
// ========================================

function applyDarkMode(enabled) {

    if (enabled) {

        document.body.classList.add("dark-mode");

    } else {

        document.body.classList.remove("dark-mode");

    }
}


// ========================================
// Change Password
// ========================================

document
    .getElementById("changePassword")
    .addEventListener(
        "click",
        function () {

            const currentPassword =
                document.getElementById(
                    "currentPassword"
                ).value.trim();

            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value.trim();

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value.trim();


            if (!currentPassword) {

                alert(
                    "Please enter your current password."
                );

                return;
            }


            if (!newPassword) {

                alert(
                    "Please enter a new password."
                );

                return;
            }


            if (newPassword.length < 6) {

                alert(
                    "New password must contain at least 6 characters."
                );

                return;
            }


            if (newPassword !== confirmPassword) {

                alert(
                    "New password and confirm password do not match."
                );

                return;
            }


            /*
             * Password API is not available in the
             * current backend yet.
             */

            alert(
                "Password validation successful. Password backend API will be connected next."
            );

        }
    );


// ========================================
// Logout
// ========================================

function logout() {

    localStorage.removeItem("user");

    window.location.href =
        "index.html";
}


document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById("logoutMain")
    .addEventListener(
        "click",
        logout
    );


// ========================================
// Initial Load
// ========================================

loadUserDetails();

loadSettings();