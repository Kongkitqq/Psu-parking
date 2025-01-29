const facultyLinks = document.querySelectorAll('#faculty-nav a'); // เลือกลิงก์ใน navigation bar
const parkingSpotContainer = document.getElementById('parking-spots');
const searchBar = document.getElementById('search-bar'); // เลือกช่องค้นหา
let allParkingLots = [];

// เพิ่ม event listener สำหรับ navigation bar
facultyLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // ป้องกันการรีเฟรชหน้า
        const selectedFaculty = event.target.getAttribute('data-faculty');
        fetchParkingSpots(selectedFaculty); // เรียกฟังก์ชันดึงข้อมูล
    });
});

// เพิ่ม event listener สำหรับช่องค้นหา
searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const query = searchBar.value.trim(); // อ่านค่าจากช่องค้นหา
        fetchParkingSpotsBySearch(query); // เรียกฟังก์ชันค้นหาข้อมูล
    }
});

function fetchParkingSpots(faculty) {
    fetch('/api/parking-spots')
        .then(response => response.json())
        .then(data => {
            allParkingLots = data.parkingLots;
            displayParkingSpots(allParkingLots, faculty);
        })
        .catch(error => console.error('Error fetching parking spots:', error));
}

function fetchParkingSpotsBySearch(query) {
    fetch('/api/parking-spots')
        .then(response => response.json())
        .then(data => {
            // กรองข้อมูลที่มีชื่อสถานที่จอดรถตรงกับข้อความที่ค้นหา
            const filteredParkingLots = data.parkingLots.filter(lot =>
                lot.name.toLowerCase().includes(query.toLowerCase())
            );
            displayParkingSpots(filteredParkingLots, 'all');
        })
        .catch(error => console.error('Error fetching parking spots:', error));
}

function displayParkingSpots(parkingLots, faculty) {
    parkingSpotContainer.innerHTML = ''; // ล้างผลลัพธ์เก่า

    const filteredParkingLots = faculty === 'all'
        ? parkingLots
        : parkingLots.filter(lot => lot.faculty.toLowerCase() === faculty.toLowerCase());

    filteredParkingLots.forEach(lot => {
        const lotDiv = document.createElement('div');
        lotDiv.classList.add('parking-spot');
        lotDiv.innerHTML = `
            <h2>${lot.name}</h2>
            <p><strong>Faculty:</strong> ${lot.faculty}</p>
            <img src="${lot.image}" alt="${lot.name}" width="200">
            <button id="get-directions-${lot.name.replace(/\s+/g, '-').toLowerCase()}">Get Directions</button>
        `;
        parkingSpotContainer.appendChild(lotDiv);

        // เพิ่ม event listener ให้กับปุ่ม "Get Directions"
        const getDirectionsButton = document.getElementById(`get-directions-${lot.name.replace(/\s+/g, '-').toLowerCase()}`);
        getDirectionsButton.onclick = () => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}`, '_blank');
        };
    });
}

// เรียกฟังก์ชันดึงข้อมูลที่จอดรถเริ่มต้น
fetchParkingSpots('all');
