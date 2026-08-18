/* =========================================================
   GCASH PUHUNAN CALCULATOR
   SIMPLE CURRENT-BALANCE SYSTEM
========================================================= */


/* =========================================================
   DEFAULT BALANCES
========================================================= */

const DEFAULT_DATA = {

    gcash: 12000,

    cash: 12000,

    coins: 500,

    transactions: []

};


const STORAGE_KEY =
    "gcashPuhunanCalculatorV7";


/* =========================================================
   LOAD
========================================================= */

let data;

try {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (saved) {

        data =
            JSON.parse(saved);

    } else {

        data =
            JSON.parse(
                JSON.stringify(
                    DEFAULT_DATA
                )
            );

    }

} catch (error) {

    data =
        JSON.parse(
            JSON.stringify(
                DEFAULT_DATA
            )
        );

}


/* =========================================================
   MAKE SURE DATA IS VALID
========================================================= */

function prepareData() {

    if (
        typeof data.gcash !== "number" ||
        !Number.isFinite(data.gcash)
    ) {

        data.gcash = 12000;

    }


    if (
        typeof data.cash !== "number" ||
        !Number.isFinite(data.cash)
    ) {

        data.cash = 12000;

    }


    if (
        typeof data.coins !== "number" ||
        !Number.isFinite(data.coins)
    ) {

        data.coins = 500;

    }


    if (
        !Array.isArray(data.transactions)
    ) {

        data.transactions = [];

    }


    data.transactions =
        data.transactions.map(
            transaction => ({

                id:
                    transaction.id ||
                    Date.now() +
                    Math.random(),

                date:
                    transaction.date ||
                    new Date().toLocaleString(
                        "en-PH"
                    ),

                customer:
                    transaction.customer ||
                    "Unknown",

                type:
                    transaction.type ===
                    "cashout"
                        ? "cashout"
                        : "cashin",

                amount:
                    roundMoney(
                        transaction.amount
                    ),

                fee:
                    roundMoney(
                        transaction.fee
                    ),

                amountStatus:
                    transaction.amountStatus ===
                    "unpaid"
                        ? "unpaid"
                        : "paid",

                feeStatus:
                    transaction.feeStatus ===
                    "unpaid"
                        ? "unpaid"
                        : "paid"

            })
        );

}


prepareData();


/* =========================================================
   SAVE
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   MONEY
========================================================= */

function roundMoney(value) {

    return Math.round(
        (Number(value) || 0) * 100
    ) / 100;

}


function peso(value) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(
        Number(value) || 0
    );

}


/* =========================================================
   FEE
========================================================= */

function calculateFee(amount) {

    amount =
        Number(amount) || 0;


    if (amount <= 0) {

        return 0;

    }

    if (amount <= 500) {

        return 5;

    }

    if (amount <= 1999) {

        return 10;

    }

    if (amount <= 5000) {

        return 15;

    }

    if (amount <= 9999) {

        return 35;

    }

    return 60;

}


/* =========================================================
   BALANCES
========================================================= */

function getBalances() {

    const gcash =
        roundMoney(data.gcash);

    const cash =
        roundMoney(data.cash);

    const coins =
        roundMoney(data.coins);


    /*
     * IMPORTANT:
     *
     * Coins are NOT included.
     */

    const totalMoney =
        roundMoney(
            gcash + cash
        );


    return {

        gcash,

        cash,

        coins,

        totalMoney

    };

}


/* =========================================================
   RECEIVABLE
========================================================= */

function getReceivable() {

    let total = 0;


    data.transactions.forEach(
        transaction => {

            if (
                transaction.amountStatus ===
                "unpaid"
            ) {

                total +=
                    Number(
                        transaction.amount
                    ) || 0;

            }

        }
    );


    return roundMoney(total);

}


/* =========================================================
   PROFIT
========================================================= */

function getProfit() {

    let total = 0;


    data.transactions.forEach(
        transaction => {

            if (
                transaction.feeStatus ===
                "paid"
            ) {

                total +=
                    Number(
                        transaction.fee
                    ) || 0;

            }

        }
    );


    return roundMoney(total);

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const balances =
        getBalances();


    const totalMoney =
        document.getElementById(
            "totalMoney"
        );


    const gcashBalance =
        document.getElementById(
            "gcashBalance"
        );


    const cashBalance =
        document.getElementById(
            "cashBalance"
        );


    const coinsBalance =
        document.getElementById(
            "coinsBalance"
        );


    const profit =
        document.getElementById(
            "profit"
        );


    const receivable =
        document.getElementById(
            "receivable"
        );


    const transactionCount =
        document.getElementById(
            "transactionCount"
        );


    if (totalMoney) {

        totalMoney.textContent =
            peso(
                balances.totalMoney
            );

    }


    if (gcashBalance) {

        gcashBalance.textContent =
            peso(
                balances.gcash
            );

    }


    if (cashBalance) {

        cashBalance.textContent =
            peso(
                balances.cash
            );

    }


    if (coinsBalance) {

        coinsBalance.textContent =
            peso(
                balances.coins
            );

    }


    if (profit) {

        profit.textContent =
            peso(
                getProfit()
            );

    }


    if (receivable) {

        receivable.textContent =
            peso(
                getReceivable()
            );

    }


    if (transactionCount) {

        transactionCount.textContent =
            data.transactions.length;

    }


    updateHistorySummary();

    renderHistory();

}


/* =========================================================
   LIVE EDIT GCASH
========================================================= */

function editGcash() {

    const input =
        document.getElementById(
            "gcashInput"
        );


    if (!input) {

        return;

    }


    /*
     * Empty input is allowed temporarily
     * while typing.
     */

    if (
        input.value === ""
    ) {

        return;

    }


    const value =
        Number(
            input.value
        );


    if (
        !Number.isFinite(value) ||
        value < 0
    ) {

        return;

    }


    data.gcash =
        roundMoney(value);


    saveData();


    /*
     * Update only dashboard.
     *
     * DO NOT reset the input.
     */

    updateDashboardOnly();

}


/* =========================================================
   LIVE EDIT CASH
========================================================= */

function editCash() {

    const input =
        document.getElementById(
            "cashInput"
        );


    if (!input) {

        return;

    }


    if (
        input.value === ""
    ) {

        return;

    }


    const value =
        Number(
            input.value
        );


    if (
        !Number.isFinite(value) ||
        value < 0
    ) {

        return;

    }


    data.cash =
        roundMoney(value);


    saveData();


    updateDashboardOnly();

}


/* =========================================================
   LIVE EDIT COINS
========================================================= */

function editCoins() {

    const input =
        document.getElementById(
            "coinsInput"
        );


    if (!input) {

        return;

    }


    if (
        input.value === ""
    ) {

        return;

    }


    const value =
        Number(
            input.value
        );


    if (
        !Number.isFinite(value) ||
        value < 0
    ) {

        return;

    }


    data.coins =
        roundMoney(value);


    saveData();


    updateDashboardOnly();

}


/* =========================================================
   DASHBOARD ONLY
========================================================= */

function updateDashboardOnly() {

    const balances =
        getBalances();


    const totalMoney =
        document.getElementById(
            "totalMoney"
        );


    const gcashBalance =
        document.getElementById(
            "gcashBalance"
        );


    const cashBalance =
        document.getElementById(
            "cashBalance"
        );


    const coinsBalance =
        document.getElementById(
            "coinsBalance"
        );


    if (totalMoney) {

        totalMoney.textContent =
            peso(
                balances.totalMoney
            );

    }


    if (gcashBalance) {

        gcashBalance.textContent =
            peso(
                balances.gcash
            );

    }


    if (cashBalance) {

        cashBalance.textContent =
            peso(
                balances.cash
            );

    }


    if (coinsBalance) {

        coinsBalance.textContent =
            peso(
                balances.coins
            );

    }

}


/* =========================================================
   PREVIEW
========================================================= */

function updatePreview() {

    const amountInput =
        document.getElementById(
            "amount"
        );


    const feeInput =
        document.getElementById(
            "fee"
        );


    if (!amountInput || !feeInput) {

        return;

    }


    const amount =
        Number(
            amountInput.value
        ) || 0;


    const fee =
        Number(
            feeInput.value
        ) || 0;


    const previewAmount =
        document.getElementById(
            "previewAmount"
        );


    const previewFee =
        document.getElementById(
            "previewFee"
        );


    const previewTotal =
        document.getElementById(
            "previewTotal"
        );


    if (previewAmount) {

        previewAmount.textContent =
            peso(amount);

    }


    if (previewFee) {

        previewFee.textContent =
            peso(fee);

    }


    if (previewTotal) {

        previewTotal.textContent =
            peso(
                amount + fee
            );

    }

}


/* =========================================================
   AUTO FEE
========================================================= */

function updateAutomaticFee() {

    const amountInput =
        document.getElementById(
            "amount"
        );


    const feeInput =
        document.getElementById(
            "fee"
        );


    if (!amountInput || !feeInput) {

        return;

    }


    const amount =
        Number(
            amountInput.value
        ) || 0;


    feeInput.value =
        calculateFee(
            amount
        );


    updatePreview();

}


/* =========================================================
   RADIO
========================================================= */

function getRadioValue(name) {

    const radio =
        document.querySelector(
            `input[name="${name}"]:checked`
        );


    return radio
        ? radio.value
        : "paid";

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    type
) {

    const element =
        document.getElementById(
            "formMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        text;


    element.className =
        "message " +
        (type || "success");


    setTimeout(
        () => {

            element.textContent =
                "";

            element.className =
                "message";

        },
        3500
    );

}


/* =========================================================
   APPLY TRANSACTION
========================================================= */

function applyTransaction(
    transaction
) {

    const amount =
        roundMoney(
            transaction.amount
        );


    /* =====================================================
       CASH IN

       GCash decreases.

       Paid:
           Cash increases.

       Unpaid:
           Cash stays the same.
    ====================================================== */

    if (
        transaction.type ===
        "cashin"
    ) {

        data.gcash =
            roundMoney(
                data.gcash -
                amount
            );


        if (
            transaction.amountStatus ===
            "paid"
        ) {

            data.cash =
                roundMoney(
                    data.cash +
                    amount
                );

        }

    }


    /* =====================================================
       CASH OUT

       Cash decreases.

       Paid:
           GCash increases.

       Unpaid:
           GCash stays the same.
    ====================================================== */

    if (
        transaction.type ===
        "cashout"
    ) {

        data.cash =
            roundMoney(
                data.cash -
                amount
            );


        if (
            transaction.amountStatus ===
            "paid"
        ) {

            data.gcash =
                roundMoney(
                    data.gcash +
                    amount
                );

        }

    }

}


/* =========================================================
   REVERSE TRANSACTION
========================================================= */

function reverseTransaction(
    transaction
) {

    const amount =
        roundMoney(
            transaction.amount
        );


    /* Reverse Cash In */

    if (
        transaction.type ===
        "cashin"
    ) {

        data.gcash =
            roundMoney(
                data.gcash +
                amount
            );


        if (
            transaction.amountStatus ===
            "paid"
        ) {

            data.cash =
                roundMoney(
                    data.cash -
                    amount
                );

        }

    }


    /* Reverse Cash Out */

    if (
        transaction.type ===
        "cashout"
    ) {

        data.cash =
            roundMoney(
                data.cash +
                amount
            );


        if (
            transaction.amountStatus ===
            "paid"
        ) {

            data.gcash =
                roundMoney(
                    data.gcash -
                    amount
                );

        }

    }

}


/* =========================================================
   ADD TRANSACTION
========================================================= */

function addTransaction() {

    const customerInput =
        document.getElementById(
            "customerName"
        );


    const typeInput =
        document.getElementById(
            "transactionType"
        );


    const amountInput =
        document.getElementById(
            "amount"
        );


    const feeInput =
        document.getElementById(
            "fee"
        );


    const customer =
        customerInput.value.trim();


    const type =
        typeInput.value;


    const amount =
        Number(
            amountInput.value
        );


    const fee =
        Number(
            feeInput.value
        );


    const amountStatus =
        getRadioValue(
            "amountStatus"
        );


    const feeStatus =
        getRadioValue(
            "feeStatus"
        );


    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!customer) {

        showMessage(
            "Please enter the customer name.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showMessage(
            "Please enter a valid amount.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(fee) ||
        fee < 0
    ) {

        showMessage(
            "Please enter a valid fee.",
            "error"
        );

        return;

    }


    /* =====================================================
       CHECK AVAILABLE BALANCE
    ====================================================== */

    if (
        type === "cashin" &&
        data.gcash < amount
    ) {

        showMessage(
            "Not enough GCash. Available: " +
            peso(data.gcash),
            "error"
        );

        return;

    }


    if (
        type === "cashout" &&
        data.cash < amount
    ) {

        showMessage(
            "Not enough Cash. Available: " +
            peso(data.cash),
            "error"
        );

        return;

    }


    /* =====================================================
       CREATE
    ====================================================== */

    const transaction = {

        id:
            Date.now() +
            Math.random(),

        date:
            new Date().toLocaleString(
                "en-PH"
            ),

        customer,

        type,

        amount:
            roundMoney(
                amount
            ),

        fee:
            roundMoney(
                fee
            ),

        amountStatus,

        feeStatus

    };


    /* =====================================================
       MODIFY CURRENT BALANCES
    ====================================================== */

    applyTransaction(
        transaction
    );


    /* =====================================================
       SAVE TRANSACTION
    ====================================================== */

    data.transactions.unshift(
        transaction
    );


    saveData();


    updateDashboard();


    /* =====================================================
       CLEAR FORM
    ====================================================== */

    customerInput.value =
        "";


    amountInput.value =
        "";


    feeInput.value =
        "";


    document.querySelector(
        'input[name="amountStatus"][value="paid"]'
    ).checked = true;


    document.querySelector(
        'input[name="feeStatus"][value="paid"]'
    ).checked = true;


    updatePreview();


    showMessage(
        "✓ Transaction added and balance updated.",
        "success"
    );

}


/* =========================================================
   CHANGE PAYMENT STATUS
========================================================= */

function changeStatus(
    id,
    field,
    newStatus
) {

    const transaction =
        data.transactions.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!transaction) {

        return;

    }


    /* =====================================================
       FEE STATUS
       Does NOT affect balance.
    ====================================================== */

    if (
        field ===
        "feeStatus"
    ) {

        transaction.feeStatus =
            newStatus;


        saveData();

        updateDashboard();

        return;

    }


    /* =====================================================
       AMOUNT STATUS
       DOES affect balance.
    ====================================================== */

    if (
        field ===
        "amountStatus"
    ) {

        /*
         * Remove old effect.
         */

        reverseTransaction(
            transaction
        );


        /*
         * Change status.
         */

        transaction.amountStatus =
            newStatus;


        /*
         * Apply new effect.
         */

        applyTransaction(
            transaction
        );


        saveData();

        updateDashboard();

    }

}


/* =========================================================
   EDIT FEE
========================================================= */

function editFee(
    id,
    value
) {

    const transaction =
        data.transactions.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!transaction) {

        return;

    }


    const fee =
        Number(value);


    if (
        !Number.isFinite(fee) ||
        fee < 0
    ) {

        alert(
            "Invalid fee."
        );

        renderHistory();

        return;

    }


    transaction.fee =
        roundMoney(fee);


    saveData();

    updateDashboard();

}


/* =========================================================
   DELETE
========================================================= */

function deleteTransaction(id) {

    const index =
        data.transactions.findIndex(
            item =>
                String(item.id) ===
                String(id)
        );


    if (index === -1) {

        return;

    }


    const transaction =
        data.transactions[index];


    const confirmed =
        confirm(
            "Delete this transaction?\n\n" +
            transaction.customer +
            "\n" +
            (
                transaction.type === "cashin"
                    ? "Cash In"
                    : "Cash Out"
            ) +
            "\n" +
            peso(
                transaction.amount
            )
        );


    if (!confirmed) {

        return;

    }


    /*
     * Remove its effect from balances.
     */

    reverseTransaction(
        transaction
    );


    /*
     * Remove history.
     */

    data.transactions.splice(
        index,
        1
    );


    saveData();

    updateDashboard();

}


/* =========================================================
   STATUS SELECT
========================================================= */

function createStatusSelect(
    value,
    callback
) {

    const select =
        document.createElement(
            "select"
        );


    select.className =
        "status-select " +
        (
            value === "paid"
                ? "paid"
                : "unpaid"
        );


    select.innerHTML = `

        <option value="paid">
            ✓ Paid
        </option>

        <option value="unpaid">
            ✕ Not Paid
        </option>

    `;


    select.value =
        value;


    select.addEventListener(
        "change",
        () => {

            select.className =
                "status-select " +
                (
                    select.value === "paid"
                        ? "paid"
                        : "unpaid"
                );


            callback(
                select.value
            );

        }
    );


    return select;

}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    const body =
        document.getElementById(
            "historyBody"
        );


    const empty =
        document.getElementById(
            "emptyHistory"
        );


    if (!body) {

        return;

    }


    body.innerHTML =
        "";


    if (
        data.transactions.length === 0
    ) {

        if (empty) {

            empty.style.display =
                "block";

        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    data.transactions.forEach(
        transaction => {

            const row =
                document.createElement(
                    "tr"
                );


            /* DATE */

            const date =
                document.createElement(
                    "td"
                );

            date.textContent =
                transaction.date;


            /* CUSTOMER */

            const customer =
                document.createElement(
                    "td"
                );

            customer.textContent =
                transaction.customer;


            /* TYPE */

            const type =
                document.createElement(
                    "td"
                );

            type.textContent =
                transaction.type ===
                "cashin"
                    ? "Cash In"
                    : "Cash Out";


            type.className =
                transaction.type ===
                "cashin"
                    ? "type-cashin"
                    : "type-cashout";


            /* AMOUNT */

            const amount =
                document.createElement(
                    "td"
                );

            amount.textContent =
                peso(
                    transaction.amount
                );


            /* AMOUNT STATUS */

            const amountStatus =
                document.createElement(
                    "td"
                );


            amountStatus.appendChild(

                createStatusSelect(

                    transaction.amountStatus,

                    status => {

                        changeStatus(

                            transaction.id,

                            "amountStatus",

                            status

                        );

                    }

                )

            );


            /* FEE */

            const fee =
                document.createElement(
                    "td"
                );


            const feeInput =
                document.createElement(
                    "input"
                );


            feeInput.type =
                "number";


            feeInput.min =
                "0";


            feeInput.step =
                "0.01";


            feeInput.value =
                transaction.fee;


            feeInput.className =
                "history-fee-input";


            feeInput.addEventListener(
                "change",
                () => {

                    editFee(

                        transaction.id,

                        feeInput.value

                    );

                }
            );


            fee.appendChild(
                feeInput
            );


            /* FEE STATUS */

            const feeStatus =
                document.createElement(
                    "td"
                );


            feeStatus.appendChild(

                createStatusSelect(

                    transaction.feeStatus,

                    status => {

                        changeStatus(

                            transaction.id,

                            "feeStatus",

                            status

                        );

                    }

                )

            );


            /* ACTION */

            const action =
                document.createElement(
                    "td"
                );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "delete-btn";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTransaction(
                        transaction.id
                    );

                }
            );


            action.appendChild(
                deleteButton
            );


            /* ADD */

            row.appendChild(date);

            row.appendChild(customer);

            row.appendChild(type);

            row.appendChild(amount);

            row.appendChild(amountStatus);

            row.appendChild(fee);

            row.appendChild(feeStatus);

            row.appendChild(action);


            body.appendChild(row);

        }
    );

}


/* =========================================================
   HISTORY SUMMARY
========================================================= */

function updateHistorySummary() {

    let paidAmount = 0;

    let unpaidAmount = 0;

    let paidFee = 0;

    let unpaidFee = 0;


    data.transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            const fee =
                Number(
                    transaction.fee
                ) || 0;


            if (
                transaction.amountStatus ===
                "paid"
            ) {

                paidAmount +=
                    amount;

            } else {

                unpaidAmount +=
                    amount;

            }


            if (
                transaction.feeStatus ===
                "paid"
            ) {

                paidFee +=
                    fee;

            } else {

                unpaidFee +=
                    fee;

            }

        }
    );


    document.getElementById(
        "paidAmountTotal"
    ).textContent =
        peso(paidAmount);


    document.getElementById(
        "unpaidAmountTotal"
    ).textContent =
        peso(unpaidAmount);


    document.getElementById(
        "paidFeeTotal"
    ).textContent =
        peso(paidFee);


    document.getElementById(
        "unpaidFeeTotal"
    ).textContent =
        peso(unpaidFee);

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearHistory() {

    if (
        data.transactions.length === 0
    ) {

        alert(
            "No transactions to clear."
        );

        return;

    }


    const confirmed =
        confirm(
            "Clear all transaction history?\n\n" +
            "Your current balances will stay exactly as they are."
        );


    if (!confirmed) {

        return;

    }


    /*
     * IMPORTANT:
     *
     * Clearing history does NOT change
     * the current GCash/Cash/Coins.
     */

    data.transactions =
        [];


    saveData();

    updateDashboard();

}


/* =========================================================
   RESET EVERYTHING
========================================================= */

function resetEverything() {

    const confirmed =
        confirm(
            "Reset everything?\n\n" +
            "GCash will become ₱12,000\n" +
            "Cash will become ₱12,000\n" +
            "Coins will become ₱500\n" +
            "All transactions will be deleted."
        );


    if (!confirmed) {

        return;

    }


    data =
        JSON.parse(
            JSON.stringify(
                DEFAULT_DATA
            )
        );


    saveData();


    /*
     * Put reset values into inputs.
     */

    document.getElementById(
        "gcashInput"
    ).value =
        data.gcash;


    document.getElementById(
        "cashInput"
    ).value =
        data.cash;


    document.getElementById(
        "coinsInput"
    ).value =
        data.coins;


    updateDashboard();

    updatePreview();

}


/* =========================================================
   START APP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =================================================
           BALANCE INPUTS
        ================================================== */

        const gcashInput =
            document.getElementById(
                "gcashInput"
            );


        const cashInput =
            document.getElementById(
                "cashInput"
            );


        const coinsInput =
            document.getElementById(
                "coinsInput"
            );


        /*
         * Set actual saved values.
         */

        gcashInput.value =
            data.gcash;


        cashInput.value =
            data.cash;


        coinsInput.value =
            data.coins;


        /*
         * LIVE EDIT
         */

        gcashInput.addEventListener(
            "input",
            editGcash
        );


        cashInput.addEventListener(
            "input",
            editCash
        );


        coinsInput.addEventListener(
            "input",
            editCoins
        );


        /* =================================================
           TRANSACTION AMOUNT
        ================================================== */

        const amountInput =
            document.getElementById(
                "amount"
            );


        amountInput.addEventListener(
            "input",
            updateAutomaticFee
        );


        /* =================================================
           FEE
        ================================================== */

        const feeInput =
            document.getElementById(
                "fee"
            );


        feeInput.addEventListener(
            "input",
            updatePreview
        );


        /* =================================================
           ADD TRANSACTION
        ================================================== */

        document.getElementById(
            "addTransactionBtn"
        ).addEventListener(
            "click",
            addTransaction
        );


        /* =================================================
           CLEAR HISTORY
        ================================================== */

        document.getElementById(
            "clearHistoryBtn"
        ).addEventListener(
            "click",
            clearHistory
        );


        /* =================================================
           RESET
        ================================================== */

        document.getElementById(
            "resetBtn"
        ).addEventListener(
            "click",
            resetEverything
        );


        /* =================================================
           INITIAL DISPLAY
        ================================================== */

        updatePreview();

        updateDashboard();

    }
);
