let transactions = [];
const transactionForm = document.getElementById('transaction-form');
const reportForm = document.getElementById('report-form');
const transactionsList = document.getElementById('transactions-list');
const reportResults = document.getElementById('report-results');
const reportTimeGap = document.getElementById('report-time-gap');
const customRange = document.getElementById('custom-range');
const startDate = document.getElementById('start-date');
const endDate = document.getElementById('end-date');
reportTimeGap.addEventListener('change', () => {
    customRange.style.display = reportTimeGap.value === 'custom' ? 'block' : 'none';
});
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const today = new Date().toISOString().split('T')[0];
    if (!description || isNaN(amount) || amount <= 0 || !date || !category) {
        alert("Please fill in all required fields correctly.");
        return;
    }
    if (date > today) {
        alert("Future dates are not allowed.");
        return;
    }
    transactions.push({ description, amount, date, category });
    transactionForm.reset();
    updateTransactions();
    updateChart();
});
function updateTransactions() {
    transactionsList.innerHTML = '';
    transactions.forEach((transaction) => {
        const div = document.createElement('div');
        div.classList.add('transaction-item');
        div.innerHTML = `
            <p><strong>${transaction.description}</strong> - $${transaction.amount}</p>
            <p>Date: ${transaction.date} | Category: ${transaction.category}</p>
        `;
        transactionsList.appendChild(div);
    });
}
reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let filteredTransactions;
    if (reportTimeGap.value === 'custom') {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end;
        });
    } else {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(reportTimeGap.value, 10));
        filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= daysAgo;
        });
    }
    generateReport(filteredTransactions);
});
function generateReport(filteredTransactions) {
    reportResults.innerHTML = '';
    if (filteredTransactions.length === 0) {
        reportResults.innerHTML = '<p>No transactions found.</p>';
        return;
    }
    const totalExpenses = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    reportResults.innerHTML = `
        <p><strong>Total Transactions:</strong> ${filteredTransactions.length}</p>
        <p><strong>Total Amount:</strong> $${totalExpenses.toFixed(2)}</p>
    `;
}
const pieChartElement = document.getElementById('pieChart');
if (pieChartElement) {
    const ctx = pieChartElement.getContext('2d');
    const transactionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['blue', 'orange', 'green', 'red', 'purple']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
    function updateChart() {
        const categoryTotals = {};
        transactions.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        transactionChart.data.labels = Object.keys(categoryTotals);
        transactionChart.data.datasets[0].data = Object.values(categoryTotals);
        transactionChart.update();
    }
}
