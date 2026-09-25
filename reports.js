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

if (user) {

    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");

    if (userName) {
        userName.textContent = user.fullName;
    }

    if (userEmail) {
        userEmail.textContent = user.email;
    }
}


// ========================================
// GLOBAL REPORT DATA
// ========================================

let reports = [];


// ========================================
// LOAD REPORTS FROM BACKEND
// ========================================

async function loadReports() {

    try {

        // Get user's verifications
        const verificationResponse =
            await fetch(
                `http://127.0.0.1:8080/api/verifications/user/${user.id}`
            );


        if (!verificationResponse.ok) {
            throw new Error("Failed to load verifications");
        }


        const verifications =
            await verificationResponse.json();


        // Get user's documents
        const documentResponse =
            await fetch(
                `http://127.0.0.1:8080/api/documents/user/${user.id}`
            );


        if (!documentResponse.ok) {
            throw new Error("Failed to load documents");
        }


        const documents =
            await documentResponse.json();


        // ========================================
        // CREATE REPORT DATA
        // ========================================

        reports = verifications.map(function (verification) {

            const document =
                documents.find(
                    doc =>
                        doc.id === verification.documentId
                );


            return {

                id: verification.id,

                document:
                    document
                        ? document.documentType
                        : "Unknown Document",

                date:
                    formatDate(
                        verification.verifiedAt ||
                        verification.createdAt
                    ),

                confidence:
                    verification.verificationScore !== null
                        ? Number(
                            verification.verificationScore
                        )
                        : 0,

                status:
                    formatStatus(
                        verification.verificationStatus
                    )

            };

        });


        // Update UI
        updateReports();


    } catch (error) {

        console.error(
            "Reports loading error:",
            error
        );


        alert(
            "Unable to load reports. Please make sure the backend server is running."
        );

    }

}


// ========================================
// FORMAT STATUS
// ========================================

function formatStatus(status) {

    if (!status) {
        return "Pending";
    }


    const value =
        status.toUpperCase();


    if (value === "VERIFIED") {
        return "Verified";
    }

    if (value === "SUSPICIOUS") {
        return "Suspicious";
    }

    return "Pending";
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return "-";
    }


    return date.toLocaleDateString();

}


// ========================================
// UPDATE REPORTS
// ========================================

function updateReports() {

    const total =
        reports.length;


    const verified =
        reports.filter(
            item => item.status === "Verified"
        ).length;


    const suspicious =
        reports.filter(
            item => item.status === "Suspicious"
        ).length;


    const pending =
        reports.filter(
            item => item.status === "Pending"
        ).length;


    // ========================================
    // STATISTICS
    // ========================================

    document.getElementById("totalCount")
        .textContent = total;


    document.getElementById("verifiedCount")
        .textContent = verified;


    document.getElementById("suspiciousCount")
        .textContent = suspicious;


    document.getElementById("pendingCount")
        .textContent = pending;


    // ========================================
    // PERCENTAGES
    // ========================================

    let verifiedPercent = 0;
    let suspiciousPercent = 0;
    let pendingPercent = 0;


    if (total > 0) {

        verifiedPercent =
            Math.round(
                (verified / total) * 100
            );


        suspiciousPercent =
            Math.round(
                (suspicious / total) * 100
            );


        pendingPercent =
            Math.round(
                (pending / total) * 100
            );

    }


    document.getElementById("successRate")
        .textContent =
        verifiedPercent + "%";


    document.getElementById("verifiedPercentage")
        .textContent =
        verifiedPercent + "%";


    document.getElementById("suspiciousPercentage")
        .textContent =
        suspiciousPercent + "%";


    document.getElementById("pendingPercentage")
        .textContent =
        pendingPercent + "%";


    // ========================================
    // SUCCESS CIRCLE
    // ========================================

    const circle =
        document.querySelector(".circle");


    if (circle) {

        circle.style.background =
            `conic-gradient(
                #2563eb ${verifiedPercent * 3.6}deg,
                #e2e8f0 ${verifiedPercent * 3.6}deg
            )`;

    }


    // ========================================
    // DOCUMENT TYPES
    // ========================================

    const types = {

        "Aadhaar Card": 0,

        "PAN Card": 0,

        "Passport": 0,

        "Driving Licence": 0,

        "Voter ID": 0

    };


    reports.forEach(function (item) {

        if (
            types[item.document] !== undefined
        ) {

            types[item.document]++;

        }

    });


    const maxCount =
        Math.max(
            ...Object.values(types),
            1
        );


    updateBar(
        "aadhaar",
        types["Aadhaar Card"],
        maxCount
    );


    updateBar(
        "pan",
        types["PAN Card"],
        maxCount
    );


    updateBar(
        "passport",
        types["Passport"],
        maxCount
    );


    updateBar(
        "licence",
        types["Driving Licence"],
        maxCount
    );


    updateBar(
        "voter",
        types["Voter ID"],
        maxCount
    );


    // ========================================
    // TABLE
    // ========================================

    displayReports();

}


// ========================================
// UPDATE BAR
// ========================================

function updateBar(
    name,
    count,
    max
) {

    const bar =
        document.getElementById(
            name + "Bar"
        );


    const counter =
        document.getElementById(
            name + "Count"
        );


    if (!bar || !counter) {
        return;
    }


    const percentage =
        (count / max) * 100;


    bar.style.width =
        percentage + "%";


    counter.textContent =
        count;

}


// ========================================
// DISPLAY TABLE
// ========================================

function displayReports(
    data = reports
) {

    const table =
        document.getElementById(
            "reportTable"
        );


    const empty =
        document.getElementById(
            "emptyState"
        );


    table.innerHTML = "";


    if (data.length === 0) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    data.forEach(function (item) {

        const row =
            document.createElement("tr");


        const statusClass =
            item.status.toLowerCase();


        row.innerHTML = `

            <td>
                #${item.id}
            </td>

            <td>
                ${item.document}
            </td>

            <td>
                ${item.date}
            </td>

            <td>
                ${item.confidence}%
            </td>

            <td>

                <span class="status ${statusClass}">
                    ${item.status}
                </span>

            </td>

        `;


        table.appendChild(row);

    });

}


// ========================================
// SEARCH + STATUS FILTER
// ========================================

function applyFilters() {

    const searchValue =
        document.getElementById(
            "searchInput"
        )
        .value
        .toLowerCase()
        .trim();


    const selectedStatus =
        document.getElementById(
            "statusFilter"
        ).value;


    const filtered =
        reports.filter(function (item) {

            const matchesSearch =

                String(item.id)
                    .toLowerCase()
                    .includes(searchValue)

                ||

                item.document
                    .toLowerCase()
                    .includes(searchValue)

                ||

                item.status
                    .toLowerCase()
                    .includes(searchValue);


            const matchesStatus =

                selectedStatus === "all"

                ||

                item.status === selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    displayReports(filtered);

}


// ========================================
// SEARCH
// ========================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        applyFilters
    );


// ========================================
// STATUS FILTER
// ========================================

document
    .getElementById("statusFilter")
    .addEventListener(
        "change",
        applyFilters
    );


// ========================================
// EXPORT CSV
// ========================================

document
    .getElementById("exportBtn")
    .addEventListener(
        "click",
        function () {

            if (reports.length === 0) {

                alert(
                    "No reports available to export."
                );

                return;

            }


            let csv =
                "ID,Document,Date,Confidence,Status\n";


            reports.forEach(function (item) {

                csv +=
                    `${item.id},` +
                    `"${item.document}",` +
                    `${item.date},` +
                    `${item.confidence}%,` +
                    `${item.status}\n`;

            });


            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;


            link.download =
                "id-verification-report.csv";


            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


            URL.revokeObjectURL(url);

        }
    );


// ========================================
// LOGOUT
// ========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function () {

            localStorage.removeItem("user");

            window.location.href =
                "index.html";

        }
    );


// ========================================
// INITIAL LOAD
// ========================================

loadReports();

