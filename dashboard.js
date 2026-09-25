// ========================================
// LOGIN CHECK
// ========================================

const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "index.html";
}

const user = JSON.parse(userData);


// ========================================
// USER DETAILS
// ========================================

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const welcomeName = document.getElementById("welcomeName");

if (user) {

    if (userName) {
        userName.textContent =
            user.fullName || "User";
    }

    if (userEmail) {
        userEmail.textContent =
            user.email || "";
    }

    if (welcomeName) {
        welcomeName.textContent =
            user.fullName || "User";
    }
}


// ========================================
// DASHBOARD STATS
// ========================================

async function loadDashboardStats() {

    try {

        const response = await fetch(
            `http://127.0.0.1:8080/api/dashboard/user/${user.id}`
        );

        if (!response.ok) {
            throw new Error(
                "Dashboard API failed"
            );
        }

        const stats =
            await response.json();

        console.log(
            "Dashboard Stats:",
            stats
        );


        document.getElementById("totalCount")
            .textContent =
            stats.totalCount || 0;

        document.getElementById("verifiedCount")
            .textContent =
            stats.verifiedCount || 0;

        document.getElementById("pendingCount")
            .textContent =
            stats.pendingCount || 0;

        document.getElementById("suspiciousCount")
            .textContent =
            stats.suspiciousCount || 0;


    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );

    }

}


// ========================================
// RECENT VERIFICATIONS
// ========================================

async function loadRecentVerifications() {

    const tableBody =
        document.getElementById(
            "recentVerifications"
        );

    try {

        const verificationResponse =
            await fetch(
                `http://127.0.0.1:8080/api/verifications/user/${user.id}`
            );


        if (!verificationResponse.ok) {
            throw new Error(
                "Verification API failed"
            );
        }


        const verifications =
            await verificationResponse.json();


        console.log(
            "Recent Verifications:",
            verifications
        );


        // ------------------------------------
        // EMPTY
        // ------------------------------------

        if (!verifications ||
            verifications.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="loading">
                        No verification records found.
                    </td>
                </tr>
            `;

            return;
        }


        // ------------------------------------
        // SORT LATEST FIRST
        // ------------------------------------

        verifications.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.verifiedAt ||
                        0
                    );

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.verifiedAt ||
                        0
                    );

                return dateB - dateA;
            }
        );


        // ------------------------------------
        // SHOW ONLY 5
        // ------------------------------------

        const recent =
            verifications.slice(0, 5);


        tableBody.innerHTML = "";


        for (const verification of recent) {

            let documentName =
                "Document #" +
                verification.documentId;


            // Try to get document name
            try {

                const documentResponse =
                    await fetch(
                        `http://127.0.0.1:8080/api/documents/${verification.documentId}`
                    );

                if (documentResponse.ok) {

                    const document =
                        await documentResponse.json();

                    documentName =
                        document.fileName ||
                        document.documentType ||
                        documentName;
                }

            } catch (error) {

                console.log(
                    "Document lookup skipped:",
                    error
                );
            }


            const status =
                verification.verificationStatus ||
                "PENDING";


            const score =
                Number(
                    verification.verificationScore || 0
                );


            const dateValue =
                verification.createdAt ||
                verification.verifiedAt;


            let formattedDate = "-";


            if (dateValue) {

                const date =
                    new Date(dateValue);

                if (!isNaN(date)) {

                    formattedDate =
                        date.toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short"
                            }
                        );
                }
            }


            // STATUS CLASS

            let statusClass =
                "status-review";


            if (status === "VERIFIED") {

                statusClass =
                    "status-verified";

            } else if (
                status === "SUSPICIOUS"
            ) {

                statusClass =
                    "status-suspicious";
            }


            // SCORE CLASS

            let scoreClass =
                "score-medium";


            if (score >= 75) {

                scoreClass =
                    "score-high";

            } else if (score < 50) {

                scoreClass =
                    "score-low";
            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(documentName)}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHtml(status)}
                    </span>
                </td>

                <td>
                    <span class="score ${scoreClass}">
                        ${Math.round(score)}%
                    </span>
                </td>

                <td>
                    ${formattedDate}
                </td>

            `;


            tableBody.appendChild(row);
        }


    } catch (error) {

        console.error(
            "Recent verification error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Unable to load verification data.
                </td>
            </tr>
        `;
    }
}


// ========================================
// HTML SAFETY
// ========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// LOGOUT
// ========================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("user");

            window.location.href =
                "index.html";
        }
    );
}


// ========================================
// MOBILE MENU
// ========================================

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.querySelector(".sidebar");


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("show");

        }
    );
}


// ========================================
// LOAD DASHBOARD
// ========================================

loadDashboardStats();

loadRecentVerifications();