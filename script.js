// --- DATA STORE ---
// Weights and absolute values for Single (S) and Couple (C) profiles
const dataStore = {
    single: {
        income: [1050, 17500, 35000], // 1965, 1995, 2025
        housePrice: [3600, 55000, 285000],
        breakdown: { // % of Gross Income
            1965: { tax: 28, housing: 15, food: 25, transport: 10, other: 22 },
            1995: { tax: 24, housing: 22, food: 12, transport: 14, other: 28 },
            2025: { tax: 22, housing: 42, food: 10, transport: 12, other: 14 } // High housing squeeze
        },
        bigTicket: { // Cost as multiple of annual income
            car: [0.5, 0.6, 0.75], // New car cost relative to income
            education: [0, 0, 1.5] // Total loan/cost relative to annual income
        }
    },
    couple: {
        income: [1800, 32000, 70000], // Combined income (lower female participation in 65)
        housePrice: [3600, 55000, 285000], // House price stays same
        breakdown: { 
            1965: { tax: 25, housing: 10, food: 20, transport: 12, other: 33 }, // Dual income in 65 was wealthy
            1995: { tax: 22, housing: 15, food: 10, transport: 15, other: 38 },
            2025: { tax: 24, housing: 28, food: 8, transport: 15, other: 25 } // Better off than single, but childcare hits "other"
        },
        bigTicket: {
            car: [0.3, 0.35, 0.4],
            education: [0, 0, 0.8] 
        }
    }
};

let currentProfile = 'single';
let charts = {};

// --- UTILS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumSignificantDigits: 3 }).format(val);

// --- MAIN RENDER FUNCTION ---
function updateDashboard() {
    const data = dataStore[currentProfile];
    
    // 1. Update Metrics Cards (DOM)
    const eras = [1965, 1995, 2025];
    eras.forEach((year, index) => {
        document.getElementById(`val-inc-${year}`).innerText = formatCurrency(data.income[index]);
        document.getElementById(`val-house-${year}`).innerText = formatCurrency(data.housePrice[index]);
        
        const ratio = (data.housePrice[index] / data.income[index]).toFixed(1);
        const el = document.getElementById(`ratio-${year}`);
        el.innerText = `${ratio}x Salary`;
        
        // Color coding ratio severity
        if(ratio > 5) el.className = "text-xl font-bold text-red-600";
        else if(ratio < 3.5) el.className = "text-xl font-bold text-green-600";
        else el.className = "text-xl font-bold text-yellow-600";
    });

    // 2. Update Charts
    renderDecouplingChart(data);
    renderWalletChart(data);
    renderBigTicketChart(data);
    
    // Update button styles
    const btnSingle = document.getElementById('btn-single');
    const btnCouple = document.getElementById('btn-couple');
    
    if(currentProfile === 'single') {
        btnSingle.className = "px-6 py-2 rounded-md text-sm font-semibold transition-all bg-white text-slate-900 shadow-sm transform scale-105";
        btnCouple.className = "px-6 py-2 rounded-md text-sm font-semibold transition-all text-slate-300 hover:text-white";
    } else {
        btnCouple.className = "px-6 py-2 rounded-md text-sm font-semibold transition-all bg-white text-slate-900 shadow-sm transform scale-105";
        btnSingle.className = "px-6 py-2 rounded-md text-sm font-semibold transition-all text-slate-300 hover:text-white";
    }
}

function setProfile(profile) {
    currentProfile = profile;
    updateDashboard();
}

// --- CHART CONFIGURATIONS ---

function renderDecouplingChart(data) {
    const ctx = document.getElementById('chart-decoupling').getContext('2d');
    
    if (charts.decoupling) charts.decoupling.destroy();

    charts.decoupling = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1965', '1995', '2025'],
            datasets: [
                {
                    label: 'Avg Annual Income (£)',
                    data: data.income,
                    backgroundColor: '#CBD5E1',
                    borderRadius: 4,
                    order: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Avg House Price (£)',
                    data: data.housePrice,
                    type: 'line',
                    borderColor: '#1E293B',
                    backgroundColor: '#1E293B',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    order: 1,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top' },
                tooltip: { 
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) label += new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#E2E8F0' },
                    ticks: { callback: (value) => '£' + value / 1000 + 'k' }
                }
            }
        }
    });
}

function renderWalletChart(data) {
    const ctx = document.getElementById('chart-wallet').getContext('2d');
    const bd = data.breakdown;

    if (charts.wallet) charts.wallet.destroy();

    charts.wallet = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1965', '1995', '2025'],
            datasets: [
                { label: 'Housing', data: [bd[1965].housing, bd[1995].housing, bd[2025].housing], backgroundColor: '#1E293B' },
                { label: 'Tax & NI', data: [bd[1965].tax, bd[1995].tax, bd[2025].tax], backgroundColor: '#64748B' },
                { label: 'Food', data: [bd[1965].food, bd[1995].food, bd[2025].food], backgroundColor: '#0F766E' },
                { label: 'Transport', data: [bd[1965].transport, bd[1995].transport, bd[2025].transport], backgroundColor: '#F59E0B' },
                { label: 'Other/Save', data: [bd[1965].other, bd[1995].other, bd[2025].other], backgroundColor: '#E2E8F0' },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: { stacked: true, max: 100, ticks: { callback: (v) => v + '%' } },
                y: { stacked: true }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterBody: (ctx) => {
                            // Calculate estimated monthly cash
                            const yearIdx = ctx[0].dataIndex;
                            const year = [1965, 1995, 2025][yearIdx];
                            const percentage = ctx[0].raw;
                            const annualInc = data.income[yearIdx];
                            const monthlyVal = (annualInc * (percentage/100)) / 12;
                            return `Est. Monthly Cost: ${formatCurrency(monthlyVal)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderBigTicketChart(data) {
    const ctx = document.getElementById('chart-bigticket').getContext('2d');
    
    if (charts.bigticket) charts.bigticket.destroy();

    // Calculate "Years of Income" needed for house
    const houseYears = [
        data.housePrice[0]/data.income[0],
        data.housePrice[1]/data.income[1],
        data.housePrice[2]/data.income[2]
    ];

    charts.bigticket = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1965', '1995', '2025'],
            datasets: [
                {
                    label: 'Years of Salary to Buy House',
                    data: houseYears,
                    backgroundColor: '#4338CA',
                },
                 {
                    label: 'Years of Salary to Pay for Degree',
                    data: data.bigTicket.education,
                    backgroundColor: '#BE123C',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: { display: true, text: 'Years of Full Salary' },
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
});

