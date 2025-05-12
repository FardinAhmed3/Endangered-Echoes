from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


load_dotenv()

app = FastAPI(title="Endangered Animals API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_NINJA_KEY = os.getenv("API_NINJA_KEY", "")
PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY", "")


@app.get("/")
async def read_root():
    return {"message": "Endangered Animals API is running"}

@app.get("/api/animals/{name}")
async def get_animal(name: str):
    if not API_NINJA_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    async with httpx.AsyncClient() as client:
        headers = {"X-Api-Key": API_NINJA_KEY}
        response = await client.get(
            f"https://api.api-ninjas.com/v1/animals?name={name}",
            headers=headers
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error from external API: {response.text}"
            )
        
        data = response.json()
        
        formatted_data = []
        for animal in data:
            formatted_animal = {
                "name": animal.get("name", ""),
                "scientific_name": animal.get("taxonomy", {}).get("scientific_name", ""),
                "locations": animal.get("locations", []),
                "characteristics": {
                    "prey": animal.get("characteristics", {}).get("prey", "Unknown"),
                    "biggest_threat": animal.get("characteristics", {}).get("biggest_threat", "Unknown"),
                    "diet": animal.get("characteristics", {}).get("diet", "Unknown"),
                    "lifespan": animal.get("characteristics", {}).get("lifespan", "Unknown"),
                    "habitat": animal.get("characteristics", {}).get("habitat", "Unknown")
                }
            }
            formatted_data.append(formatted_animal)
        
        return formatted_data

@app.get("/api/animal-image")
async def get_animal_image(name: str):
    if not PIXABAY_API_KEY:
        raise HTTPException(status_code=500, detail="Pixabay API key not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={name}+animal&image_type=photo&safesearch=true"
            
            response = await client.get(url)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error from Pixabay API: {response.text}"
                )
            
            data = response.json()
            
            if data.get("hits") and len(data["hits"]) > 0:
                image_url = data["hits"][0]["largeImageURL"]
                return {"imageUrl": image_url}
            else:
                return {"imageUrl": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching image: {str(e)}")

try:
    app.mount("/", StaticFiles(directory="../", html=True), name="static")
except Exception:
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
