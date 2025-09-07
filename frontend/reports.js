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

function exportToExcel() {
    showAlert('Data exported to Excel successfully', 'success');
}

function generatePDF() {
    showAlert('PDF report generated successfully', 'success');
}