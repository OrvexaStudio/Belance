/* =========================================
   BALANCE
   Dashboard
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const data = getAppData();

    if (!data.setupComplete) {
        window.location.href = "index.html";
        return;
    }

    loadUser();
    loadDate();
    calculateBalance();
    loadGoals();
    loadRecentMovements();

});


/* =========================================
   UTENTE
========================================= */

function loadUser() {

    const name = getAppData().user.name;

    const firstLetter =
        name.charAt(0).toUpperCase();

    document.getElementById("welcomeName")
        .textContent = name;

    document.getElementById("sidebarUserName")
        .textContent = name;

    document.getElementById("userAvatar")
        .textContent = firstLetter;

    document.getElementById("profileInitial")
        .textContent = firstLetter;
}


/* =========================================
   DATA
========================================= */

function loadDate() {

    const dateElement =
        document.getElementById("currentDate");

    const now = new Date();

    const formatted =
        now.toLocaleDateString("it-IT", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

    dateElement.textContent =
        formatted.charAt(0).toUpperCase() +
        formatted.slice(1);
}


/* =========================================
   CALCOLO SALDO
========================================= */

function calculateBalance() {

    const data = getAppData();

    let balance =
        Number(data.user.initialBalance) || 0;

    let income = 0;
    let expenses = 0;

    data.movements.forEach(movement => {

        const amount =
            Number(movement.amount) || 0;

        if (movement.type === "income") {

            income += amount;
            balance += amount;

        } else if (movement.type === "expense") {

            expenses += amount;
            balance -= amount;

        }

    });


    document.getElementById("balanceValue")
        .textContent = formatCurrency(balance);

    document.getElementById("incomeValue")
        .textContent = formatCurrency(income);

    document.getElementById("expenseValue")
        .textContent = formatCurrency(expenses);


    loadLastMovement(
        data.movements,
        "income",
        "lastIncome"
    );

    loadLastMovement(
        data.movements,
        "expense",
        "lastExpense"
    );
}


/* =========================================
   ULTIMO MOVIMENTO
========================================= */

function loadLastMovement(
    movements,
    type,
    elementId
) {

    const filtered =
        movements
            .filter(item => item.type === type)
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

    const element =
        document.getElementById(elementId);

    if (filtered.length === 0) {

        element.textContent =
            type === "income"
                ? "Nessuna entrata registrata"
                : "Nessuna uscita registrata";

        return;
    }

    const movement = filtered[0];

    const sign =
        type === "income"
            ? "+"
            : "-";

    element.textContent =
        `${sign} ${formatCurrency(movement.amount)} · ${movement.description}`;
}


/* =========================================
   OBIETTIVI
========================================= */

function loadGoals() {

    const data = getAppData();

    const goals = data.goals || [];

    const goalsCard =
        document.getElementById("goalsCard");

    const goalsList =
        document.getElementById("goalsList");

    if (goals.length === 0) {

        goalsCard.style.display = "none";

        return;
    }

    goalsCard.style.display = "block";

    goalsList.innerHTML = "";

    goals.forEach(goal => {

        const target =
            Number(goal.target) || 0;

        const saved =
            Number(goal.saved) || 0;

        let percentage = 0;

        if (target > 0) {
            percentage =
                Math.min(
                    (saved / target) * 100,
                    100
                );
        }

        const goalElement =
            document.createElement("div");

        goalElement.className = "goal-item";

        goalElement.innerHTML = `

            <div class="goal-top">

                <div>
                    <strong>
                        ${escapeHTML(goal.name)}
                    </strong>

                    <span>
                        ${formatCurrency(saved)}
                        di
                        ${formatCurrency(target)}
                    </span>
                </div>

                <strong>
                    ${Math.round(percentage)}%
                </strong>

            </div>

            <div class="progress-bar">
                <div
                    class="progress-fill"
                    style="width: ${percentage}%"
                ></div>
            </div>

        `;

        goalsList.appendChild(goalElement);
    });
}


/* =========================================
   MOVIMENTI RECENTI
========================================= */

function loadRecentMovements() {

    const data = getAppData();

    const container =
        document.getElementById(
            "recentMovements"
        );

    const movements =
        [...data.movements]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);

    if (movements.length === 0) {
        return;
    }

    container.innerHTML = "";

    movements.forEach(movement => {

        const isIncome =
            movement.type === "income";

        const element =
            document.createElement("div");

        element.className =
            "recent-movement";

        element.innerHTML = `

            <div class="movement-left">

                <div class="
                    movement-icon
                    ${isIncome
                        ? "movement-income"
                        : "movement-expense"}
                ">
                    ${isIncome ? "↑" : "↓"}
                </div>

                <div class="movement-info">

                    <strong>
                        ${escapeHTML(
                            movement.description
                        )}
                    </strong>

                    <span>
                        ${formatDate(movement.date)}
                    </span>

                </div>

            </div>

            <strong class="
                movement-amount
                ${isIncome
                    ? "amount-income"
                    : "amount-expense"}
            ">
                ${isIncome ? "+" : "-"}
                ${formatCurrency(
                    movement.amount
                )}
            </strong>

        `;

        container.appendChild(element);
    });
}


/* =========================================
   FORMATTAZIONE VALUTA
========================================= */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "it-IT",
        {
            style: "currency",
            currency: "EUR"
        }
    ).format(Number(value) || 0);
}


/* =========================================
   FORMATTAZIONE DATA
========================================= */

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "it-IT",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================
   SICUREZZA TESTO
========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================
   AGGIUNTA OBIETTIVO
========================================= */

document
    .getElementById("addGoalButton")
    ?.addEventListener(
        "click",
        () => {

            const name =
                prompt("Nome dell'obiettivo:");

            if (!name) {
                return;
            }

            const target =
                Number(
                    prompt(
                        "Quanto vuoi raggiungere? (€)"
                    )
                );

            if (
                Number.isNaN(target) ||
                target <= 0
            ) {
                return;
            }

            const data = getAppData();

            if (!data.goals) {
                data.goals = [];
            }

            data.goals.push({
                id: Date.now(),
                name: name.trim(),
                target: target,
                saved: 0,
                createdAt:
                    new Date().toISOString()
            });

            saveAppData(data);

            loadGoals();
        }
    );
