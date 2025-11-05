document.addEventListener('DOMContentLoaded', function() {
    loadReportContent();
});

function loadReportContent() {
    document.getElementById('reportContent').innerHTML = `
        <div class="report-summary">
            <h3>System Overview</h3>
            <p>Reports and analytics will be displayed here.</p>
        </div>
    `;
}

function generateDailyReport() {
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <div class="report-summary">
            <h3>Daily Report - ${new Date().toLocaleDateString()}</h3>
            <div class="report-stats">
                <div class="report-stat">
                    <span class="label">Patients Admitted:</span>
                    <span class="value">5</span>
                </div>
                <div class="report-stat">
                    <span class="label">Patients Discharged:</span>
                    <span class="value">2</span>
                </div>
                <div class="report-stat">
                    <span class="label">Total Revenue:</span>
                    <span class="value">$15,000</span>
                </div>
            </div>
        </div>
    `;
    showAlert('Daily report generated successfully', 'success');
}

async function exportToCSV() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/reports/csv', {
            headers: { 'Authorization': `Bearer ${token}` }
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
            showAlert('Error generating CSV report', 'error');
        }
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showAlert('Error generating CSV report', 'error');
    }
}

function generatePDF() {
    showAlert('PDF report generated successfully', 'success');
}