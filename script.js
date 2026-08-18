/* =========================================================
   GCASH PUHUNAN CALCULATOR
   DIRECT EDIT BALANCE VERSION

   RULES
   ---------------------------------------------------------
   GCash + Cash = Total Money

   Coins are independent.

   CASH IN:
   - Paid:
       GCash decreases
       Cash increases
   - Unpaid:
       GCash decreases
       Cash does not increase
       Customer owes amount

   CASH OUT:
   - Paid:
       Cash decreases
       GCash increases
   - Unpaid:
       Cash decreases
       GCash does not increase
       Customer owes amount

   FEES:
   - Never affect GCash
   - Never affect Cash
   - Never affect Coins
   - Paid fees = Profit

   BALANCES:
   - GCash is directly editable
   - Cash is directly editable
   - Coins are directly editable
   - No Save Balances button needed
   - Editing happens immediately
========================================================= */


/* =========================================================
   DEFAULT VALUES
========================================================= */

const DEFAULT_DATA = {

    gcash: 12000,

    cash: 12000,

    coins: 500,

    transactions: []

};


const STORAGE_KEY =
    "gcashPuhunanCalculatorDirectV7";


/* =========================================================
   LOAD DATA
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

    console.error(
        "Could not load saved data:",
        error
    );

    data =
        JSON.parse(
            JSON.stringify(
                DEFAULT_DATA
            )
        );

}


/* =========================================================
   PREPARE DATA
========================================================= */

function prepareData() {

    if (
        typeof data.gcash !== "number"
    ) {

        data.gcash =
            Number(
                data.startingGcash
            ) || 12000;

    }


    if (
        typeof data.cash !== "number"
    ) {

        data.cash =
            Number(
                data.startingCash
            ) || 12000;

    }


    if (
        typeof data.coins !== "number"
    ) {

        data.coins =
            Number(
                data.startingCoins
            ) || 500;

    }


    if (
        !Array.isArray(
            data.transactions
        )
    ) {

        data.transactions = [];

    }


    data.gcash =
        roundMoney(
            data.gcash
        );


    data.cash =
        roundMoney(
            data.cash
        );


    data.coins =
        roundMoney(
            data.coins
        );


    data.transactions =
        data.transactions.map(
            transaction => {

                return {

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
                            Number(
                                transaction.amount
                            ) || 0
                        ),

                    fee:
                        roundMoney(
                            Number(
                                transaction.fee
                            ) || 0
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

                };

            }
        );

}


prepareData();


/* =========================================================
   SAVE
========================================================= */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "Could not save data:",
            error
        );

    }

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
   CALCULATE TRANSACTION EFFECT
========================================================= */

/*
    This function calculates what the transaction
    history currently contributes to GCash and Cash.

    This is important when the user edits a balance.

    Example:

        Current GCash = 12,000
        History effect = -500

        User types GCash = 20,000

        We change the base so that:

        base + history effect = 20,000

    Therefore the displayed/current balance stays
    exactly what the user typed.
*/

function calculateHistoryEffect() {

    let gcashEffect = 0;

    let cashEffect = 0;

    data.transactions
        .slice()
        .reverse()
        .forEach(
            transaction => {

                const amount =
                    roundMoney(
                        transaction.amount
                    );


                if (
                    transaction.type ===
                    "cashin"
                ) {

                    /*
                     * GCash always decreases
                     */

                    gcashEffect -= amount;


                    /*
                     * Cash only increases
                     * when customer paid.
                     */

                    if (
                        transaction.amountStatus ===
                        "paid"
                    ) {

                        cashEffect += amount;

                    }

                }


                else if (
                    transaction.type ===
                    "cashout"
                ) {

                    /*
                     * Cash always decreases.
                     */

                    cashEffect -= amount;


                    /*
                     * GCash only increases
                     * when customer paid.
                     */

                    if (
                        transaction.amountStatus ===
                        "paid"
                    ) {

                        gcashEffect += amount;

                    }

                }

            }
        );


    return {

        gcashEffect:
            roundMoney(
                gcashEffect
            ),

        cashEffect:
            roundMoney(
                cashEffect
            )

    };

}


/* =========================================================
   CURRENT BALANCES
========================================================= */

function calculateBalances() {

    /*
     * data.gcash and data.cash represent the
     * CURRENT editable balance.
     *
     * Transactions are already accounted for
     * by adjusting the stored base when necessary.
     *
     * Therefore we simply return them.
     */

    return {

        gcash:
            roundMoney(
                data.gcash
            ),

        cash:
            roundMoney(
                data.cash
            ),

        coins:
            roundMoney(
                data.coins
            ),

        totalMoney:
            roundMoney(
                data.gcash +
                data.cash
            )

    };

}


/* =========================================================
   FEE PROFIT
========================================================= */

function calculateFeeProfit() {

    let profit = 0;


    data.transactions.forEach(
        transaction => {

            if (
                transaction.feeStatus ===
                "paid"
            ) {

                profit +=
                    Number(
                        transaction.fee
                    ) || 0;

            }

        }
    );


    return roundMoney(
        profit
    );

}


/* =========================================================
   RECEIVABLE
========================================================= */

function calculateReceivable() {

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


    return roundMoney(
        total
    );

}


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard(
    updateInputs = true
) {

    const balances =
        calculateBalances();


    const profit =
        calculateFeeProfit();


    const receivable =
        calculateReceivable();


    /* TOTAL */

    const totalElement =
        document.getElementById(
            "totalMoney"
        );


    if (totalElement) {

        totalElement.textContent =
            peso(
                balances.totalMoney
            );

    }


    /* GCASH */

    const gcashElement =
        document.getElementById(
            "gcashBalance"
        );


    if (gcashElement) {

        gcashElement.textContent =
            peso(
                balances.gcash
            );

    }


    /* CASH */

    const cashElement =
        document.getElementById(
            "cashBalance"
        );


    if (cashElement) {

        cashElement.textContent =
            peso(
                balances.cash
            );

    }


    /* COINS */

    const coinsElement =
        document.getElementById(
            "coinsBalance"
        );


    if (coinsElement) {

        coinsElement.textContent =
            peso(
                balances.coins
            );

    }


    /* PROFIT */

    const profitElement =
        document.getElementById(
            "profit"
        );


    if (profitElement) {

        profitElement.textContent =
            peso(
                profit
            );

    }


    /* CUSTOMER OWES */

    const receivableElement =
        document.getElementById(
            "receivable"
        );


    if (receivableElement) {

        receivableElement.textContent =
            peso(
                receivable
            );

    }


    /* TRANSACTION COUNT */

    const countElement =
        document.getElementById(
            "transactionCount"
        );


    if (countElement) {

        countElement.textContent =
            data.transactions.length;

    }


    /*
     * IMPORTANT:
     *
     * When the user is currently typing into
     * an editable balance field, we DON'T overwrite
     * the input.
     */

    if (updateInputs) {

        syncBalanceInputs();

    }


    renderHistory();

}


/* =========================================================
   SYNC INPUTS
========================================================= */

function syncBalanceInputs() {

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


    if (
        gcashInput &&
        document.activeElement !==
        gcashInput
    ) {

        gcashInput.value =
            data.gcash;

    }


    if (
        cashInput &&
        document.activeElement !==
        cashInput
    ) {

        cashInput.value =
            data.cash;

    }


    if (
        coinsInput &&
        document.activeElement !==
        coinsInput
    ) {

        coinsInput.value =
            data.coins;

    }

}


/* =========================================================
   DIRECT BALANCE EDIT
========================================================= */

/*
    THIS is the part that fixes your problem.

    When you type:

        GCash 15000

    the dashboard immediately becomes:

        GCash ₱15,000
        Total Money updates too.

    There is NO SAVE button.
*/

function editGcash() {

    const input =
        document.getElementById(
            "gcashInput"
        );


    if (!input) {

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
        roundMoney(
            value
        );


    saveData();


    /*
     * false means:
     *
     * DO NOT overwrite the input while
     * the user is typing.
     */

    updateDashboard(false);

}


function editCash() {

    const input =
        document.getElementById(
            "cashInput"
        );


    if (!input) {

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
        roundMoney(
            value
        );


    saveData();


    updateDashboard(false);

}


function editCoins() {

    const input =
        document.getElementById(
            "coinsInput"
        );


    if (!input) {

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
        roundMoney(
            value
        );


    saveData();


    updateDashboard(false);

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


    if (
        !amountInput ||
        !feeInput
    ) {

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
   AUTOMATIC FEE
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


    if (
        !amountInput ||
        !feeInput
    ) {

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

    const selected =
        document.querySelector(
            `input[name="${name}"]:checked`
        );


    return selected
        ? selected.value
        : "paid";

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    type = "success"
) {

    const message =
        document.getElementById(
            "formMessage"
        );


    if (!message) {

        return;

    }


    message.textContent =
        text;


    message.className =
        "message " +
        type;


    setTimeout(
        () => {

            message.textContent =
                "";

            message.className =
                "message";

        },
        4000
    );

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


    /* VALIDATE CUSTOMER */

    if (!customer) {

        showMessage(
            "Please enter the customer name.",
            "error"
        );

        return;

    }


    /* VALIDATE AMOUNT */

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


    /* VALIDATE FEE */

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


    const balances =
        calculateBalances();


    /* =====================================================
       CASH IN
    ====================================================== */

    if (
        type === "cashin"
    ) {

        /*
         * GCash must always be sent,
         * even when the customer hasn't paid.
         */

        if (
            balances.gcash <
            amount
        ) {

            showMessage(
                "Not enough GCash. Available: " +
                peso(
                    balances.gcash
                ),
                "error"
            );

            return;

        }

    }


    /* =====================================================
       CASH OUT
    ====================================================== */

    if (
        type === "cashout"
    ) {

        /*
         * Cash must always be given,
         * even when the customer hasn't paid.
         */

        if (
            balances.cash <
            amount
        ) {

            showMessage(
                "Not enough Cash. Available: " +
                peso(
                    balances.cash
                ),
                "error"
            );

            return;

        }

    }


    /* =====================================================
       CREATE TRANSACTION
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


    /*
     * UPDATE CURRENT BALANCE
     *
     * CASH IN:
     * GCash always decreases.
     * Cash increases only if paid.
     */

    if (
        type === "cashin"
    ) {

        data.gcash =
            roundMoney(
                data.gcash -
                amount
            );


        if (
            amountStatus ===
            "paid"
        ) {

            data.cash =
                roundMoney(
                    data.cash +
                    amount
                );

        }

    }


    /*
     * CASH OUT:
     * Cash always decreases.
     * GCash increases only if paid.
     */

    else if (
        type === "cashout"
    ) {

        data.cash =
            roundMoney(
                data.cash -
                amount
            );


        if (
            amountStatus ===
            "paid"
        ) {

            data.gcash =
                roundMoney(
                    data.gcash +
                    amount
                );

        }

    }


    /*
     * Add history.
     */

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


    const paidAmountRadio =
        document.querySelector(
            'input[name="amountStatus"][value="paid"]'
        );


    const paidFeeRadio =
        document.querySelector(
            'input[name="feeStatus"][value="paid"]'
        );


    if (paidAmountRadio) {

        paidAmountRadio.checked =
            true;

    }


    if (paidFeeRadio) {

        paidFeeRadio.checked =
            true;

    }


    updatePreview();


    showMessage(
        "✓ Transaction added successfully.",
        "success"
    );

}


/* =========================================================
   CHANGE STATUS
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


    const oldStatus =
        transaction[field];


    if (
        oldStatus ===
        newStatus
    ) {

        return;

    }


    /* =====================================================
       AMOUNT STATUS CHANGED
    ====================================================== */

    if (
        field ===
        "amountStatus"
    ) {

        const amount =
            roundMoney(
                transaction.amount
            );


        /*
         * CASH IN
         */

        if (
            transaction.type ===
            "cashin"
        ) {

            /*
             * NOT PAID -> PAID
             *
             * Customer gives cash now.
             */

            if (
                oldStatus ===
                "unpaid" &&
                newStatus ===
                "paid"
            ) {

                data.cash =
                    roundMoney(
                        data.cash +
                        amount
                    );

            }


            /*
             * PAID -> NOT PAID
             *
             * Remove the cash that
             * was previously received.
             */

            else if (
                oldStatus ===
                "paid" &&
                newStatus ===
                "unpaid"
            ) {

                data.cash =
                    roundMoney(
                        data.cash -
                        amount
                    );

            }

        }


        /*
         * CASH OUT
         */

        else if (
            transaction.type ===
            "cashout"
        ) {

            /*
             * NOT PAID -> PAID
             *
             * Customer gives GCash now.
             */

            if (
                oldStatus ===
                "unpaid" &&
                newStatus ===
                "paid"
            ) {

                data.gcash =
                    roundMoney(
                        data.gcash +
                        amount
                    );

            }


            /*
             * PAID -> NOT PAID
             *
             * Remove the GCash that
             * was previously received.
             */

            else if (
                oldStatus ===
                "paid" &&
                newStatus ===
                "unpaid"
            ) {

                data.gcash =
                    roundMoney(
                        data.gcash -
                        amount
                    );

            }

        }

    }


    /*
     * Fee status doesn't affect balances.
     *
     * It only affects profit.
     */

    transaction[field] =
        newStatus;


    saveData();


    updateDashboard();

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


    const newFee =
        Number(value);


    if (
        !Number.isFinite(newFee) ||
        newFee < 0
    ) {

        alert(
            "Please enter a valid fee."
        );

        renderHistory();

        return;

    }


    transaction.fee =
        roundMoney(
            newFee
        );


    saveData();


    updateDashboard();

}


/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(id) {

    const index =
        data.transactions.findIndex(
            transaction =>
                String(
                    transaction.id
                ) ===
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
                transaction.type ===
                "cashin"
                    ? "Cash In"
                    : "Cash Out"
            ) +
            "\nAmount: " +
            peso(
                transaction.amount
            ) +
            "\n\nThe balance effect will be reversed."
        );


    if (!confirmed) {

        return;

    }


    const amount =
        roundMoney(
            transaction.amount
        );


    /*
     * REVERSE BALANCE EFFECT
     */

    if (
        transaction.type ===
        "cashin"
    ) {

        /*
         * Cash In originally:
         *
         * GCash - amount
         * Cash + amount if paid
         */

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


    else if (
        transaction.type ===
        "cashout"
    ) {

        /*
         * Cash Out originally:
         *
         * Cash - amount
         * GCash + amount if paid
         */

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
   RENDER HISTORY
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
        data.transactions.length ===
        0
    ) {

        if (empty) {

            empty.style.display =
                "block";

        }


        updateHistorySummary();

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

            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.textContent =
                transaction.date;


            /* CUSTOMER */

            const customerCell =
                document.createElement(
                    "td"
                );

            customerCell.textContent =
                transaction.customer;


            /* TYPE */

            const typeCell =
                document.createElement(
                    "td"
                );

            typeCell.textContent =
                transaction.type ===
                "cashin"
                    ? "Cash In"
                    : "Cash Out";


            typeCell.className =
                transaction.type ===
                "cashin"
                    ? "type-cashin"
                    : "type-cashout";


            /* AMOUNT */

            const amountCell =
                document.createElement(
                    "td"
                );

            amountCell.textContent =
                peso(
                    transaction.amount
                );


            /* AMOUNT STATUS */

            const amountStatusCell =
                document.createElement(
                    "td"
                );


            amountStatusCell.appendChild(

                createStatusSelect(

                    transaction.amountStatus,

                    newStatus => {

                        changeStatus(

                            transaction.id,

                            "amountStatus",

                            newStatus

                        );

                    }

                )

            );


            /* FEE */

            const feeCell =
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


            feeCell.appendChild(
                feeInput
            );


            /* FEE STATUS */

            const feeStatusCell =
                document.createElement(
                    "td"
                );


            feeStatusCell.appendChild(

                createStatusSelect(

                    transaction.feeStatus,

                    newStatus => {

                        changeStatus(

                            transaction.id,

                            "feeStatus",

                            newStatus

                        );

                    }

                )

            );


            /* ACTION */

            const actionCell =
                document.createElement(
                    "td"
                );


            const deleteButton =
                document.createElement(
                    "button"
                );


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


            actionCell.appendChild(
                deleteButton
            );


            /* ADD */

            row.appendChild(
                dateCell
            );

            row.appendChild(
                customerCell
            );

            row.appendChild(
                typeCell
            );

            row.appendChild(
                amountCell
            );

            row.appendChild(
                amountStatusCell
            );

            row.appendChild(
                feeCell
            );

            row.appendChild(
                feeStatusCell
            );

            row.appendChild(
                actionCell
            );


            body.appendChild(
                row
            );

        }
    );


    updateHistorySummary();

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


    const paidAmountElement =
        document.getElementById(
            "paidAmountTotal"
        );


    const unpaidAmountElement =
        document.getElementById(
            "unpaidAmountTotal"
        );


    const paidFeeElement =
        document.getElementById(
            "paidFeeTotal"
        );


    const unpaidFeeElement =
        document.getElementById(
            "unpaidFeeTotal"
        );


    if (paidAmountElement) {

        paidAmountElement.textContent =
            peso(
                paidAmount
            );

    }


    if (unpaidAmountElement) {

        unpaidAmountElement.textContent =
            peso(
                unpaidAmount
            );

    }


    if (paidFeeElement) {

        paidFeeElement.textContent =
            peso(
                paidFee
            );

    }


    if (unpaidFeeElement) {

        unpaidFeeElement.textContent =
            peso(
                unpaidFee
            );

    }

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearHistory() {

    if (
        data.transactions.length ===
        0
    ) {

        alert(
            "There are no transactions."
        );

        return;

    }


    const confirmed =
        confirm(
            "Clear all transaction history?\n\n" +
            "The balance effects of these transactions will also be reversed."
        );


    if (!confirmed) {

        return;

    }


    /*
     * Reverse every transaction.
     */

    const transactions =
        data.transactions.slice();


    transactions.forEach(
        transaction => {

            const amount =
                roundMoney(
                    transaction.amount
                );


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


            else if (
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
    );


    data.transactions =
        [];


    saveData();


    updateDashboard();


    alert(
        "Transaction history cleared."
    );

}


/* =========================================================
   RESET EVERYTHING
========================================================= */

function resetEverything() {

    const confirmed =
        confirm(
            "Reset EVERYTHING?\n\n" +
            "This will delete all transactions and restore:\n\n" +
            "GCash: ₱12,000\n" +
            "Cash: ₱12,000\n" +
            "Coins: ₱500"
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


    updateDashboard();


    updatePreview();

}


/* =========================================================
   EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =================================================
           BALANCE INPUTS
        ================================================= */

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
         * INPUT = immediate change.
         *
         * No Save button.
         */

        if (gcashInput) {

            gcashInput.addEventListener(
                "input",
                editGcash
            );

        }


        if (cashInput) {

            cashInput.addEventListener(
                "input",
                editCash
            );

        }


        if (coinsInput) {

            coinsInput.addEventListener(
                "input",
                editCoins
            );

        }


        /* =================================================
           AMOUNT
        ================================================= */

        const amountInput =
            document.getElementById(
                "amount"
            );


        if (amountInput) {

            amountInput.addEventListener(
                "input",
                updateAutomaticFee
            );

        }


        /* =================================================
           FEE
        ================================================= */

        const feeInput =
            document.getElementById(
                "fee"
            );


        if (feeInput) {

            feeInput.addEventListener(
                "input",
                updatePreview
            );

        }


        /* =================================================
           ADD
        ================================================= */

        const addButton =
            document.getElementById(
                "addTransactionBtn"
            );


        if (addButton) {

            addButton.addEventListener(
                "click",
                addTransaction
            );

        }


        /* =================================================
           CLEAR HISTORY
        ================================================= */

        const clearButton =
            document.getElementById(
                "clearHistoryBtn"
            );


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearHistory
            );

        }


        /* =================================================
           RESET
        ================================================= */

        const resetButton =
            document.getElementById(
                "resetBtn"
            );


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetEverything
            );

        }


        /* =================================================
           INITIALIZE
        ================================================= */

        syncBalanceInputs();

        updatePreview();

        updateDashboard();

    }
);
