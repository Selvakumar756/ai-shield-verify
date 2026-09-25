// ========================================
// Login Check
// ========================================

const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "index.html";
}

const user = JSON.parse(userData);


// ========================================
// User Details
// ========================================

document.getElementById("userName").textContent =
    user.fullName || "User";

document.getElementById("userEmail").textContent =
    user.email || "";


// ========================================
// Backend API
// ========================================

const API_URL = "http://127.0.0.1:8080";

let documents = [];


// ========================================
// Get Documents From Backend
// ========================================

async function loadDocuments() {

    try {

        const response = await fetch(
            `${API_URL}/api/documents/user/${user.id}`
        );

        if (!response.ok) {
            throw new Error("Failed to load documents");
        }

        documents = await response.json();

        displayDocuments();

    } catch (error) {

        console.error("Documents loading error:", error);

        documents = [];

        displayDocuments();
    }
}


// ========================================
// Get Verification For Document
// ========================================

async function getVerification(documentId) {

    try {

        const response = await fetch(
            `${API_URL}/api/verifications/document/${documentId}`
        );

        if (!response.ok) {
            return null;
        }

        const verifications = await response.json();

        if (verifications.length === 0) {
            return null;
        }

        // Latest verification
        return verifications[verifications.length - 1];

    } catch (error) {

        console.error(
            "Verification loading error:",
            error
        );

        return null;
    }
}


// ========================================
// Display Documents
// ========================================

async function displayDocuments() {

    const table =
        document.getElementById("documentTable");

    const emptyState =
        document.getElementById("emptyState");

    table.innerHTML = "";

    if (documents.length === 0) {

        emptyState.style.display = "block";

        updateStats([]);

        return;
    }

    emptyState.style.display = "none";


    for (let index = 0; index < documents.length; index++) {

        const doc = documents[index];

        const verification =
            await getVerification(doc.id);


        // Document type
        const documentType =
            doc.documentType || "Unknown";


        // Date
        let date = "N/A";

        if (doc.uploadedAt) {

            date =
                new Date(doc.uploadedAt)
                    .toLocaleDateString();

        }


        // Verification status
        let status = "Pending";

        if (verification) {

            status =
                formatStatus(
                    verification.verificationStatus
                );

        }


        // Confidence
        let confidence = "N/A";

        if (
            verification &&
            verification.verificationScore !== null &&
            verification.verificationScore !== undefined
        ) {

            confidence =
                Number(
                    verification.verificationScore
                ).toFixed(0);

        }


        // Create row
        const row =
            document.createElement("tr");


        const statusClass =
            status.toLowerCase();


        row.innerHTML = `
            <td>
                #${doc.id}
            </td>

            <td>
                ${documentType}
            </td>

            <td>
                ${date}
            </td>

            <td>
                ${confidence === "N/A"
                    ? "N/A"
                    : confidence + "%"}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${status}
                </span>
            </td>

            <td>

                <button
                    class="action-btn"
                    onclick="viewDocument(${index})"
                >
                    View
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteDocument(${doc.id})"
                >
                    Delete
                </button>

            </td>
        `;


        table.appendChild(row);
    }


    // Update statistics
    await updateStats(documents);
}


// ========================================
// Format Backend Status
// ========================================

function formatStatus(status) {

    if (!status) {
        return "Pending";
    }

    return status.charAt(0).toUpperCase()
        + status.slice(1).toLowerCase();
}


// ========================================
// Update Statistics
// ========================================

async function updateStats(documentList) {

    let total = documentList.length;

    let verified = 0;

    let suspicious = 0;

    let pending = 0;


    for (const doc of documentList) {

        const verification =
            await getVerification(doc.id);


        let status = "Pending";


        if (verification) {

            status =
                formatStatus(
                    verification.verificationStatus
                );

        }


        if (status === "Verified") {

            verified++;

        }
        else if (status === "Suspicious") {

            suspicious++;

        }
        else {

            pending++;

        }
    }


    document.getElementById("totalDocuments")
        .textContent = total;

    document.getElementById("verifiedDocuments")
        .textContent = verified;

    document.getElementById("suspiciousDocuments")
        .textContent = suspicious;

    document.getElementById("pendingDocuments")
        .textContent = pending;
}


// ========================================
// View Document
// ========================================

async function viewDocument(index) {

    const doc =
        documents[index];

    if (!doc) {
        return;
    }


    // Basic details
    document.getElementById("modalId")
        .textContent = "#" + doc.id;

    document.getElementById("modalType")
        .textContent =
            doc.documentType || "Unknown";


    // Date
    let date = "N/A";

    if (doc.uploadedAt) {

        date =
            new Date(doc.uploadedAt)
                .toLocaleString();

    }

    document.getElementById("modalDate")
        .textContent = date;


    // Get verification
    const verification =
        await getVerification(doc.id);


    if (verification) {

        let confidence = "N/A";

        if (
            verification.verificationScore !== null &&
            verification.verificationScore !== undefined
        ) {

            confidence =
                Number(
                    verification.verificationScore
                ).toFixed(0) + "%";

        }


        document.getElementById("modalConfidence")
            .textContent = confidence;


        document.getElementById("modalStatus")
            .textContent =
                formatStatus(
                    verification.verificationStatus
                );

    }
    else {

        document.getElementById("modalConfidence")
            .textContent = "N/A";

        document.getElementById("modalStatus")
            .textContent = "Pending";

    }


    // Show modal
    document.getElementById("documentModal")
        .style.display = "flex";
}


// ========================================
// Close Modal
// ========================================

document
    .getElementById("closeModal")
    .addEventListener("click", function () {

        document.getElementById("documentModal")
            .style.display = "none";

    });


// ========================================
// Close Modal Outside
// ========================================

window.addEventListener("click", function (event) {

    const modal =
        document.getElementById("documentModal");

    if (event.target === modal) {

        modal.style.display = "none";

    }

});


// ========================================
// Delete Document
// ========================================

async function deleteDocument(documentId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this document?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/documents/${documentId}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to delete document"
            );

        }


        alert("Document deleted successfully");


        // Reload backend data
        await loadDocuments();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Failed to delete document"
        );
    }
}


// ========================================
// Search
// ========================================

document
    .getElementById("searchInput")
    .addEventListener("input", function () {

        const search =
            this.value.toLowerCase().trim();


        const rows =
            document.querySelectorAll(
                "#documentTable tr"
            );


        rows.forEach(function (row) {

            const text =
                row.textContent.toLowerCase();


            if (text.includes(search)) {

                row.style.display = "";

            }
            else {

                row.style.display = "none";

            }

        });

    });


// ========================================
// Status Filter
// ========================================

document
    .getElementById("statusFilter")
    .addEventListener("change", function () {

        const selected =
            this.value;


        const rows =
            document.querySelectorAll(
                "#documentTable tr"
            );


        rows.forEach(function (row) {

            const status =
                row.querySelector(".status");


            if (!status) {
                return;
            }


            const rowStatus =
                status.textContent.trim();


            if (
                selected === "all" ||
                rowStatus === selected
            ) {

                row.style.display = "";

            }
            else {

                row.style.display = "none";

            }

        });

    });


// ========================================
// Go To Verification
// ========================================

function goToVerification() {

    window.location.href =
        "verification.html";

}


// ========================================
// Logout
// ========================================

document
    .getElementById("logoutBtn")
    .addEventListener("click", function () {

        localStorage.removeItem("user");

        window.location.href =
            "index.html";

    });


// ========================================
// Initial Load
// ========================================

loadDocuments();