// ========================================
// AI SHIELD VERIFY - VERIFICATION JS
// ========================================


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

if (user) {

    if (userName) {
        userName.textContent = user.fullName || "User";
    }

    if (userEmail) {
        userEmail.textContent = user.email || "";
    }
}


// ========================================
// ELEMENTS
// ========================================

const documentType =
    document.getElementById("documentType");

const documentFile =
    document.getElementById("documentFile");

const uploadBox =
    document.getElementById("uploadBox");

const fileInfo =
    document.getElementById("fileInfo");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const removeFile =
    document.getElementById("removeFile");

const verifyBtn =
    document.getElementById("verifyBtn");

const progressSection =
    document.getElementById("progressSection");

const progress =
    document.getElementById("progress");

const progressText =
    document.getElementById("progressText");

const result =
    document.getElementById("result");


// ========================================
// RESULT ELEMENTS
// ========================================

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultMessage =
    document.getElementById("resultMessage");

const resultScore =
    document.getElementById("resultScore");


// ========================================
// FILE UPLOAD CLICK
// ========================================

if (uploadBox && documentFile) {

    uploadBox.addEventListener("click", () => {

        documentFile.click();

    });

}


// ========================================
// FILE SELECT
// ========================================

if (documentFile) {

    documentFile.addEventListener("change", () => {

        handleFile(documentFile.files[0]);

    });

}


// ========================================
// HANDLE FILE
// ========================================

function handleFile(file) {

    if (!file) {
        return;
    }


    // Maximum 5MB

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {

        alert("File size must be less than 5MB.");

        documentFile.value = "";

        return;
    }


    // Allowed formats

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert(
            "Please upload JPG, JPEG or PNG image."
        );

        documentFile.value = "";

        return;
    }


    // Show file information

    if (fileName) {

        fileName.textContent =
            file.name;

    }


    if (fileSize) {

        fileSize.textContent =
            formatFileSize(file.size);

    }


    if (fileInfo) {

        fileInfo.style.display = "flex";

    }


    if (uploadBox) {

        uploadBox.style.display = "none";

    }

}


// ========================================
// FORMAT FILE SIZE
// ========================================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }

    return (
        (bytes / (1024 * 1024)).toFixed(1) +
        " MB"
    );
}


// ========================================
// REMOVE FILE
// ========================================

if (removeFile) {

    removeFile.addEventListener("click", () => {

        documentFile.value = "";

        if (fileInfo) {
            fileInfo.style.display = "none";
        }

        if (uploadBox) {
            uploadBox.style.display = "flex";
        }

    });

}


// ========================================
// DRAG & DROP
// ========================================

if (uploadBox) {

    uploadBox.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            uploadBox.style.borderColor =
                "#1685f5";

        }
    );


    uploadBox.addEventListener(
        "dragleave",
        () => {

            uploadBox.style.borderColor =
                "#2a5275";

        }
    );


    uploadBox.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            uploadBox.style.borderColor =
                "#2a5275";

            const file =
                event.dataTransfer.files[0];

            if (file) {

                documentFile.files =
                    event.dataTransfer.files;

                handleFile(file);

            }

        }
    );

}


// ========================================
// VERIFY BUTTON
// ========================================

if (verifyBtn) {

    verifyBtn.addEventListener(
        "click",
        startVerification
    );

}


// ========================================
// START VERIFICATION
// ========================================

async function startVerification() {

    try {

        // --------------------------------
        // VALIDATION
        // --------------------------------

        if (!documentType.value) {

            alert(
                "Please select document type."
            );

            return;
        }


        if (
            !documentFile.files ||
            documentFile.files.length === 0
        ) {

            alert(
                "Please upload a document."
            );

            return;
        }


        const file =
            documentFile.files[0];


        // --------------------------------
        // DISABLE BUTTON
        // --------------------------------

        verifyBtn.disabled = true;

        verifyBtn.textContent =
            "Processing...";


        // Show progress

        if (progressSection) {

            progressSection.style.display =
                "block";

        }


        // ========================================
        // STEP 1 - UPLOAD DOCUMENT
        // ========================================

        updateProgress(
            15,
            "Uploading document..."
        );


        const formData =
            new FormData();

        formData.append(
            "userId",
            user.id
        );

        formData.append(
            "documentType",
            documentType.value
        );

        formData.append(
            "file",
            file
        );


        const uploadResponse =
            await fetch(
                "http://127.0.0.1:8080/api/documents/upload",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!uploadResponse.ok) {

            const error =
                await uploadResponse.text();

            throw new Error(
                "Document upload failed: " +
                error
            );

        }


        const savedDocument =
            await uploadResponse.json();


        console.log(
            "Document saved:",
            savedDocument
        );


        // ========================================
        // STEP 2 - OCR
        // ========================================

        updateProgress(
            35,
            "Extracting text with OCR..."
        );


        const ocrFormData =
            new FormData();

        ocrFormData.append(
            "file",
            file
        );


        const ocrResponse =
            await fetch(
                "http://127.0.0.1:8080/api/ocr/extract",
                {
                    method: "POST",
                    body: ocrFormData
                }
            );


        if (!ocrResponse.ok) {

            const ocrError =
                await ocrResponse.text();

            throw new Error(
                "OCR failed: " +
                ocrError
            );

        }


        const ocrResult =
            await ocrResponse.json();


        const extractedText =
            ocrResult.text;


        console.log(
            "OCR Text:",
            extractedText
        );


        if (
            !extractedText ||
            extractedText.trim() === ""
        ) {

            throw new Error(
                "No readable text found in document."
            );

        }


        // ========================================
        // STEP 3 - AI ANALYSIS
        // ========================================

        updateProgress(
            65,
            "AI analyzing document..."
        );


        const aiResponse =
            await fetch(
                "http://127.0.0.1:8080/api/ai/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        text: extractedText

                    })
                }
            );


        if (!aiResponse.ok) {

            const aiError =
                await aiResponse.text();

            throw new Error(
                "AI analysis failed: " +
                aiError
            );

        }


        const aiResult =
            await aiResponse.json();


        console.log(
            "AI Analysis Result:",
            aiResult
        );


        // --------------------------------
        // AI RESULT
        // --------------------------------

        const riskScore =
            Number(aiResult.score);

        const verificationStatus =
            aiResult.status;

        const verificationReason =
            aiResult.reason;


        // Confidence

        const confidence =
            100 - riskScore;


        console.log(
            "Risk Score:",
            riskScore
        );

        console.log(
            "Confidence:",
            confidence
        );

        console.log(
            "Status:",
            verificationStatus
        );

        console.log(
            "Reason:",
            verificationReason
        );


        // ========================================
        // STEP 4 - SAVE VERIFICATION
        // ========================================

        updateProgress(
            85,
            "Saving verification result..."
        );


        const verificationData = {

            documentId:
                savedDocument.id,

            userId:
                user.id,

            verificationStatus:
                verificationStatus,

            verificationScore:
                confidence,

            identityMatch:
                verificationStatus === "VERIFIED",

            documentAuthentic:
                verificationStatus === "VERIFIED",

            faceMatch:
                false,

            fraudDetected:
                verificationStatus === "SUSPICIOUS",

            fraudReason:
                verificationStatus === "VERIFIED"
                    ? null
                    : verificationReason

        };


        console.log(
            "Verification Data:",
            verificationData
        );


        const verificationResponse =
            await fetch(
                "http://127.0.0.1:8080/api/verifications",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        verificationData
                    )

                }
            );


        if (!verificationResponse.ok) {

            const verificationError =
                await verificationResponse.text();

            throw new Error(
                "Verification save failed: " +
                verificationError
            );

        }


        const savedVerification =
            await verificationResponse.json();


        console.log(
            "Verification saved:",
            savedVerification
        );


        // ========================================
        // STEP 5 - COMPLETE
        // ========================================

        updateProgress(
            100,
            "Verification completed."
        );


        // ========================================
        // SHOW RESULT
        // ========================================

        showResult(
            confidence,
            verificationStatus,
            verificationReason
        );


    } catch (error) {

        console.error(
            "Verification Error:",
            error
        );


        alert(
            "Verification failed: " +
            error.message
        );


        verifyBtn.disabled = false;

        verifyBtn.textContent =
            "🔍 Verify Document →";

    }

}


// ========================================
// UPDATE PROGRESS
// ========================================

function updateProgress(
    percentage,
    message
) {

    if (progress) {

        progress.style.width =
            percentage + "%";

    }


    if (progressText) {

        progressText.textContent =
            message;

    }

}


// ========================================
// SHOW RESULT
// ========================================

function showResult(
    confidence,
    verificationStatus,
    verificationReason
) {

    if (!result) {
        return;
    }


    result.style.display =
        "block";


    // --------------------------------
    // VERIFIED
    // --------------------------------

    if (
        verificationStatus ===
        "VERIFIED"
    ) {

        if (resultIcon) {

            resultIcon.textContent =
                "✓";

        }


        if (resultTitle) {

            resultTitle.textContent =
                "Identity Verified";

        }


        if (resultMessage) {

            resultMessage.textContent =
                "The document passed the initial AI screening checks.";

        }

    }


    // --------------------------------
    // REVIEW
    // --------------------------------

    else if (
        verificationStatus ===
        "REVIEW"
    ) {

        if (resultIcon) {

            resultIcon.textContent =
                "!";

        }


        if (resultTitle) {

            resultTitle.textContent =
                "Needs Manual Review";

        }


        if (resultMessage) {

            resultMessage.textContent =
                verificationReason ||
                "Some document details require manual verification.";

        }

    }


    // --------------------------------
    // SUSPICIOUS
    // --------------------------------

    else {

        if (resultIcon) {

            resultIcon.textContent =
                "⚠";

        }


        if (resultTitle) {

            resultTitle.textContent =
                "Suspicious Document";

        }


        if (resultMessage) {

            resultMessage.textContent =
                verificationReason ||
                "The document contains suspicious patterns.";

        }

    }


    // --------------------------------
    // SCORE
    // --------------------------------

    if (resultScore) {

        resultScore.textContent =
            "Confidence Score " +
            Math.round(confidence) +
            "%";

    }


    // --------------------------------
    // BUTTON
    // --------------------------------

    verifyBtn.disabled =
        false;

    verifyBtn.textContent =
        "Verify Another ID";

}


// ========================================
// LOGOUT
// ========================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

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

if (mobileMenu && sidebar) {

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "show"
            );

        }
    );

}