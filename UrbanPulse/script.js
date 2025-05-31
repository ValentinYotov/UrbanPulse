// Инициализация на картата
var map = L.map('map').setView([42.6977, 23.3219], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Зареждане на всички инциденти при зареждане на картата
async function loadIncidents() {
    try {
        const response = await fetch('http://localhost:3000/incidents');
        const incidents = await response.json();
        incidents.forEach(incident => {
            addMarker(incident.latitude, incident.longitude, incident.type, incident.description);
        });
    } catch (error) {
        console.error('Грешка при зареждане на инцидентите:', error);
    }
}

if (typeof map !== 'undefined') {
    loadIncidents();
}

// Функция за добавяне на маркер
function addMarker(lat, lng, type, description) {
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>Тип:</b> " + type + "<br><b>Описание:</b> " + description).openPopup();
}

// Функция за подаване на нов инцидент
document.getElementById('incidentForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const incidentType = document.getElementById('incidentType').value;
    const incidentDescription = document.getElementById('incidentDescription').value;
    const incidentLocation = document.getElementById('incidentLocation').value.split(',');

    const data = {
        type: incidentType,
        description: incidentDescription,
        latitude: parseFloat(incidentLocation[0]),
        longitude: parseFloat(incidentLocation[1]),
    };

    try {
        const response = await fetch('http://localhost:3000/incidents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        console.log('Инцидентът е докладван:', result);
        addMarker(result.latitude, result.longitude, result.type, result.description);
    } catch (error) {
        console.error('Грешка при докладване:', error);
    }
});
