document.addEventListener('DOMContentLoaded', function() {
    loadAboutContent();
});

async function loadAboutContent() {
    try {
        const response = await fetch('/README.md');
        const readmeText = await response.text();
        
        const aboutContent = document.getElementById('aboutContent');
        aboutContent.innerHTML = `
            <div class="about-container">
                <h2>📋 About MediTrack Hospital System</h2>
                <div class="readme-content">
                    <pre>${readmeText}</pre>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading README:', error);
        document.getElementById('aboutContent').innerHTML = `
            <div class="about-container">
                <h2>📋 About MediTrack Hospital System</h2>
                <p>Error loading project documentation.</p>
            </div>
        `;
    }
}