/* =========================================
   BALANCE
   Sistema dati principale
========================================= */

const STORAGE_KEY = "balance_app_data";

/* =========================================
   DATI DI DEFAULT
========================================= */

function getDefaultData() {
    return {
        setupComplete: false,

        user: {
            name: "",
            initialBalance: 0
        },

        movements: [],

        goals: []
    };
}

/* =========================================
   CARICA DATI
========================================= */

function getAppData() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
        return getDefaultData();
    }

    try {
        return JSON.parse(savedData);
    } catch (error) {
        console.error("Errore nella lettura dei dati:", error);

        return getDefaultData();
    }
}

/* =========================================
   SALVA DATI
========================================= */

function saveAppData(data) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

/* =========================================
   CONTROLLO PRIMO ACCESSO
========================================= */

function checkSetup() {
    const data = getAppData();

    const currentPage = window.location.pathname;

    const isIndexPage =
        currentPage.endsWith("/") ||
        currentPage.endsWith("index.html");

    if (data.setupComplete && isIndexPage) {
        window.location.href = "dashboard.html";
    }
}

/* =========================================
   FORM DI CONFIGURAZIONE
========================================= */

function setupForm() {

    const form = document.getElementById("setupForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const nameInput =
            document.getElementById("name");

        const balanceInput =
            document.getElementById("initialBalance");

        const name =
            nameInput.value.trim();

        const initialBalance =
            Number(balanceInput.value);

        /* -----------------------------
           VALIDAZIONE
        ----------------------------- */

        if (!name) {
            nameInput.focus();
            return;
        }

        if (
            Number.isNaN(initialBalance) ||
            initialBalance < 0
        ) {
            balanceInput.focus();
            return;
        }

        /* -----------------------------
           CREA DATI
        ----------------------------- */

        const data = getAppData();

        data.setupComplete = true;

        data.user = {
            name: name,
            initialBalance: initialBalance
        };

        data.movements = [];

        data.goals = [];

        saveAppData(data);

        /* -----------------------------
           ANIMAZIONE USCITA
        ----------------------------- */

        const card =
            document.querySelector(".onboarding-card");

        card.style.transition =
            "opacity 0.35s ease, transform 0.35s ease";

        card.style.opacity = "0";

        card.style.transform =
            "translateY(-10px) scale(0.98)";

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 350);

    });
}

/* =========================================
   AVVIO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkSetup();

        setupForm();

    }
);
