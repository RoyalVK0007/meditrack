let reportCache = { patients: [], bills: [] };

document.addEventListener('DOMContentLoaded', function() {
    loadReportContent();
});

async function fetchWithAuth(url) {
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
    });
    if (!response.ok) throw response;
    return response.json();
}

async function loadReportContent() {
    try {
        const [patients, bills] = await Promise.all([
            fetchWithAuth('/api/patients'),
            fetchWithAuth('/api/billing')
        ]);
        reportCache = { patients, bills };
        renderReportSummary(patients, bills);
    } catch (error) {
        console.error('Error loading report content:', error);
        if (error instanceof Response) {
            await handleApiError(error, 'Failed to load reports');
        } else {
            showAlert('Failed to load reports', 'error');
        }
    }
}

function renderReportSummary(patients, bills) {
    const reportContent = document.getElementById('reportContent');
    const admitted = patients.filter(p => p.status === 'Admitted').length;
    const discharged = patients.filter(p => p.status === 'Discharged').length;
    const revenue = bills.reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

    reportContent.innerHTML = `
        <div class="report-summary">
            <h3>System Overview (${new Date().toLocaleDateString()})</h3>
            <div class="report-stats">
                <div class="report-stat">
                    <span class="label">Patients Admitted:</span>
                    <span class="value">${admitted}</span>
                </div>
                <div class="report-stat">
                    <span class="label">Patients Discharged:</span>
                    <span class="value">${discharged}</span>
                </div>
                <div class="report-stat">
                    <span class="label">Total Revenue:</span>
                    <span class="value">$${revenue.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;
}

async function generateDailyReport() {
    if (!reportCache.patients.length) {
        await loadReportContent();
    }
    renderReportSummary(reportCache.patients, reportCache.bills);
    showAlert('Daily report generated successfully', 'success');
}

async function exportToCSV() {
    try {
        const response = await fetch('/api/reports/csv', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meditrack-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showAlert('CSV report downloaded successfully', 'success');
        } else {
            await handleApiError(response, 'Error generating CSV report');
        }
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showAlert('Error generating CSV report', 'error');
    }
}

async function generatePDF() {
    try {
        const response = await fetch('/api/reports/pdf', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meditrack-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showAlert('PDF report downloaded successfully', 'success');
        } else {
            await handleApiError(response, 'Error generating PDF report');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        showAlert('Error generating PDF report', 'error');
    }
}