let animals = [];
let currentAnimalIndex = 0;
let isOnline = navigator.onLine;
const apiBaseUrl = 'http://localhost:8000/api';

const animalCanvas = document.getElementById('animalCanvas');
const ctx = animalCanvas.getContext('2d');
const animalName = document.getElementById('animalName');
const animalDescription = document.getElementById('animalDescription');
const animalDetails = document.getElementById('animalDetails');
const prevButton = document.getElementById('prevAnimal');
const nextButton = document.getElementById('nextAnimal');
const playButton = document.getElementById('playSound');

prevButton.addEventListener('click', showPreviousAnimal);
nextButton.addEventListener('click', showNextAnimal);
playButton.addEventListener('click', playAnimalSound);

async function initApp() {
    animals = await loadAnimalData();
    if (animals.length > 0) {
        displayAnimal(currentAnimalIndex);
    }
}

async function loadAnimalData() {
    const storedData = localStorage.getItem('animalData');
    
    if (storedData) {
        return JSON.parse(storedData);
    }
    
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('animalData', JSON.stringify(data));
            return data;
        }
    } catch (e) {
        console.error('Error loading animal data:', e);
    }
    
    return [];
}

async function displayAnimal(index) {
    const animal = animals[index];
    
    animalName.textContent = `${animal.commonName} (${animal.title})`;
    animalDescription.textContent = animal.text;
    animalDetails.innerHTML = '';
    
    loadImageToCanvas(animal.image);
    
    if (isOnline) {
        try {
            const animalInfo = await fetchAnimalInfoFromBackend(animal.commonName);
            
            if (animalInfo && animalInfo.length > 0) {
                updateAnimalDetails(animalInfo[0]);
                cacheAnimalInfo(animal.title, animalInfo[0]);
            } else {
                loadCachedAnimalInfo(animal.title);
            }
        } catch (e) {
            loadCachedAnimalInfo(animal.title);
        }
    } else {
        loadCachedAnimalInfo(animal.title);
    }
}

async function fetchAnimalInfoFromBackend(animalName) {
    try {
        const response = await fetch(`${apiBaseUrl}/animals/${encodeURIComponent(animalName)}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (e) {
        return null;
    }
}

function updateAnimalDetails(animalInfo) {
    if (!animalInfo) return;
    
    const detailsHTML = `
        <div class="animal-details-card">
            <h4>Scientific Details</h4>
            <ul class="list-group">
                <li class="list-group-item"><strong>Scientific Name:</strong> ${animalInfo.scientific_name || 'Unknown'}</li>
                <li class="list-group-item"><strong>Habitat:</strong> ${animalInfo.characteristics.habitat || 'Unknown'}</li>
                <li class="list-group-item"><strong>Diet:</strong> ${animalInfo.characteristics.diet || 'Unknown'}</li>
                <li class="list-group-item"><strong>Prey:</strong> ${animalInfo.characteristics.prey || 'Unknown'}</li>
                <li class="list-group-item"><strong>Lifespan:</strong> ${animalInfo.characteristics.lifespan || 'Unknown'}</li>
                <li class="list-group-item"><strong>Biggest Threat:</strong> ${animalInfo.characteristics.biggest_threat || 'Unknown'}</li>
                <li class="list-group-item"><strong>Locations:</strong> ${animalInfo.locations ? animalInfo.locations.join(', ') : 'Unknown'}</li>
            </ul>
        </div>
    `;
    
    animalDetails.innerHTML = detailsHTML;
}

function loadCachedAnimalInfo(animalTitle) {
    const animalInfoCache = JSON.parse(localStorage.getItem('animalInfoCache') || '{}');
    if (animalInfoCache[animalTitle]) {
        const cachedInfo = animalInfoCache[animalTitle];
        updateAnimalDetailsFromCache(cachedInfo);
    }
}

function cacheAnimalInfo(animalTitle, animalInfo) {
    const animalInfoCache = JSON.parse(localStorage.getItem('animalInfoCache') || '{}');
    animalInfoCache[animalTitle] = animalInfo;
    localStorage.setItem('animalInfoCache', JSON.stringify(animalInfoCache));
}

function updateAnimalDetailsFromCache(cachedInfo) {
    if (!cachedInfo) return;
    
    const detailsHTML = `
        <div class="animal-details-card">
            <h4>Scientific Details</h4>
            <ul class="list-group">
                <li class="list-group-item"><strong>Scientific Name:</strong> ${cachedInfo.scientific_name || 'Unknown'}</li>
                <li class="list-group-item"><strong>Habitat:</strong> ${cachedInfo.characteristics.habitat || 'Unknown'}</li>
                <li class="list-group-item"><strong>Diet:</strong> ${cachedInfo.characteristics.diet || 'Unknown'}</li>
                <li class="list-group-item"><strong>Prey:</strong> ${cachedInfo.characteristics.prey || 'Unknown'}</li>
                <li class="list-group-item"><strong>Lifespan:</strong> ${cachedInfo.characteristics.lifespan || 'Unknown'}</li>
                <li class="list-group-item"><strong>Biggest Threat:</strong> ${cachedInfo.characteristics.biggest_threat || 'Unknown'}</li>
                <li class="list-group-item"><strong>Locations:</strong> ${cachedInfo.locations ? cachedInfo.locations.join(', ') : 'Unknown'}</li>
            </ul>
        </div>
    `;
    
    animalDetails.innerHTML = detailsHTML;
}

function loadImageToCanvas(imageSrc) {
    ctx.clearRect(0, 0, animalCanvas.width, animalCanvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, animalCanvas.width, animalCanvas.height);
    ctx.fillStyle = '#007bff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loading image...', animalCanvas.width / 2, animalCanvas.height / 2);
    
    const img = new Image();
    
    img.onload = function() {
        ctx.clearRect(0, 0, animalCanvas.width, animalCanvas.height);
        
        const aspectRatio = img.width / img.height;
        let drawWidth = animalCanvas.width;
        let drawHeight = animalCanvas.width / aspectRatio;
        
        if (drawHeight > animalCanvas.height) {
            drawHeight = animalCanvas.height;
            drawWidth = animalCanvas.height * aspectRatio;
        }
        
        const x = (animalCanvas.width - drawWidth) / 2;
        const y = (animalCanvas.height - drawHeight) / 2;
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };
    
    img.onerror = function() {
        ctx.clearRect(0, 0, animalCanvas.width, animalCanvas.height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, animalCanvas.width, animalCanvas.height);
        ctx.fillStyle = '#dc3545';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Image not available', animalCanvas.width / 2, animalCanvas.height / 2);
    };
    
    const imageCache = JSON.parse(localStorage.getItem('animalImageCache') || '{}');
    const animalName = animals[currentAnimalIndex].commonName;
    
    if (isOnline) {
        fetch(`${apiBaseUrl}/animal-image?name=${encodeURIComponent(animalName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.imageUrl) {
                    img.src = data.imageUrl;
                    imageCache[animalName] = data.imageUrl;
                    localStorage.setItem('animalImageCache', JSON.stringify(imageCache));
                } else {
                    img.src = imageSrc;
                }
            })
            .catch(error => {
                console.error("Error fetching image:", error);
                if (imageCache[animalName]) {
                    img.src = imageCache[animalName];
                } else {
                    img.src = imageSrc;
                }
            });
    } else {
        if (imageCache[animalName]) {
            img.src = imageCache[animalName];
        } else {
            img.src = imageSrc;
        }
    }
}

function playAnimalSound() {
    const animal = animals[currentAnimalIndex];
    
    if (animal.audio) {
        const audio = new Audio(animal.audio);
        audio.play();
    } else {
        alert("No sound available for this animal.");
    }
}

function showPreviousAnimal() {
    currentAnimalIndex = (currentAnimalIndex - 1 + animals.length) % animals.length;
    displayAnimal(currentAnimalIndex);
}

function showNextAnimal() {
    currentAnimalIndex = (currentAnimalIndex + 1) % animals.length;
    displayAnimal(currentAnimalIndex);
}

window.addEventListener('online', () => {
    isOnline = true;
    updateOnlineStatus();
    initApp();
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateOnlineStatus();
});

function updateOnlineStatus() {
    const offlineAlert = document.getElementById('offline-alert');
    if (offlineAlert) {
        if (navigator.onLine) {
            offlineAlert.classList.add('d-none');
        } else {
            offlineAlert.classList.remove('d-none');
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp);