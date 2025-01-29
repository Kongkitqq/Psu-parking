// ฟังก์ชันสำหรับดึงข้อมูล JSON จาก API
async function fetchParkingData() {
    try {
        const response = await fetch('/api/parking-spots'); // โหลดข้อมูลจาก API
        const data = await response.json(); // แปลงข้อมูล JSON
        return data.parkingLots; // คืนค่าข้อมูลจุดจอดรถ
    } catch (error) {
        console.error('Error fetching parking data:', error);
        return [];
    }
}

function navigateTo(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank'); // เปิดในแท็บใหม่
}

function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: 7.006760, lng: 100.498141 }
    });

    fetchParkingData().then(parkingLots => {
        parkingLots.forEach(lot => {
            const marker = new google.maps.Marker({
                position: { lat: lot.latitude, lng: lot.longitude },
                map: map,
                title: lot.name
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <h3>${lot.name}</h3>
                    <p>Faculty: ${lot.faculty}</p>
                    <img src="${lot.image}" alt="${lot.name}" width="200">
                    <p>รีวิว: ${lot.reviews.length > 0 ? lot.reviews.join('<br>') : 'ยังไม่มีรีวิว'}</p>
                    <button onclick="navigateTo(${lot.latitude}, ${lot.longitude})">นำทางไปที่นี้</button>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        });
    });
}

// เรียกใช้แผนที่เมื่อโหลดหน้า
window.onload = initMap;
