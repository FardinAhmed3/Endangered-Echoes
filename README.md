# Endangered Echoes

A Progressive Web App (PWA) that educates users about endangered and vulnerable animal species around the world.

## Features

- Interactive canvas display of endangered animal images
- Educational information about 15 critically endangered species
- Sound effects for most animals
- Works offline with cached data
- Installable as a PWA on any device
- Responsive design using Bootstrap
- Online mode fetches fresh images from Pixabay API and data from 3rd party APIs

## Technical Implementation

### Frontend
- HTML5, CSS3, and vanilla JavaScript
- Canvas API for image display
- Bootstrap for responsive design
- Service Worker for offline functionality
- Web App Manifest for PWA installation

### Backend
- FastAPI for API endpoints
- Integration with external APIs (API Ninjas, Pixabay)
- JSON data storage for offline functionality

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Start the backend server:

```bash
cd backend
uvicorn main:app --reload
```

4. Open your browser and navigate to http://localhost:8000

## PWA Installation

To install the app on your device:
1. Open the app in a compatible browser (Chrome, Edge, Safari, etc.)
2. Click the "Install App" button or use the browser's installation prompt
3. The app will be installed on your device and can be accessed from your home screen

## Offline Usage

The app caches essential assets and data for offline use. When offline:
- The app will use locally stored animal data
- Previously viewed images will be available from cache
- All core functionality remains available

## Modifying the Data

To add or modify animal data:

1. Edit the `data.json` file in the root directory
2. Follow the existing format:

```json
{
  "title": "Scientific Name",
  "commonName": "Common Name",
  "text": "Description and conservation status",
  "image": "path/to/image.jpg",
  "audio": "path/to/audio.mp3"
}
```

3. Add image files to the `assets/images/` directory
4. Add audio files to the `assets/sounds/` directory

