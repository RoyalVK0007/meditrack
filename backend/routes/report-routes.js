const pool = require('../db');
const PDFDocument = require('pdfkit');

// Generate CSV report
async function generateCSVReport(req, res) {
    try {
        console.log('📊 Generating CSV report...');

        const [patients] = await pool.query('SELECT * FROM patients');
        const [bills] = await pool.query('SELECT * FROM bills');

        let csvContent = 'Type,ID,Name,Date,Amount,Status\n';

        patients.forEach(patient => {
            csvContent += `Patient,${patient.patient_id},"${patient.name}",${patient.admission_date},,${patient.status}\n`;
        });

        bills.forEach(bill => {
            csvContent += `Bill,${bill.bill_id},Patient ${bill.patient_id},${bill.bill_date},${bill.total_amount},${bill.status}\n`;
        });

        console.log('✅ CSV report generated successfully');

        res.writeHead(200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="meditrack-report.csv"'
        });
        res.end(csvContent);
    } catch (err) {
        console.error('Error generating CSV report:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    }
}

async function generatePDFReport(req, res) {
    try {
        console.log('📝 Generating PDF report...');
        const [patients] = await pool.query('SELECT * FROM patients ORDER BY admission_date DESC LIMIT 10');
        const [bills] = await pool.query('SELECT * FROM bills ORDER BY bill_date DESC LIMIT 10');

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="meditrack-report-${new Date().toISOString().split('T')[0]}.pdf"`
        });

        const doc = new PDFDocument({ margin: 40 });
        doc.pipe(res);

        doc.fontSize(20).text('MediTrack Summary Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown(1.5);

        doc.fontSize(16).text('Recent Patients', { underline: true });
        doc.moveDown(0.5);
        patients.forEach(patient => {
            doc.fontSize(12).text(`${patient.name} (${patient.gender}), admitted on ${new Date(patient.admission_date).toLocaleDateString()} - Status: ${patient.status}`);
        });

        doc.moveDown(1);
        doc.fontSize(16).text('Recent Bills', { underline: true });
        doc.moveDown(0.5);
        bills.forEach(bill => {
            doc.fontSize(12).text(`Bill #${bill.bill_id} - Patient ${bill.patient_id} - ₹${bill.total_amount} - ${bill.status}`);
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = { generateCSVReport, generatePDFReport };
