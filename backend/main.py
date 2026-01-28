from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import uvicorn

app = FastAPI(title="Simplif-IA API")

# Indispensable pour que React puisse communiquer avec FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En prod, remplace par l'URL de ton site React
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimplifyRequest(BaseModel):
    text: str
    level: str
    api_key: str

@app.post("/api/simplify")
async def simplify(request: SimplifyRequest):
    # Dictionnaire exact de tes prompts
    prompts = {
        "👶 Enfant (5 ans)": "Tu es un instituteur de maternelle. Explique le concept de manière très simple. Utilise des analogies avec des jouets, des animaux ou des bonbons. Fais des phrases très courtes.",
        "Adolescent": "Tu es un grand frère/grande sœur cool. Explique ça simplement mais sans être bébé, utilise des exemples de la vie courante.",
        "🎓 Étudiant": "Tu es un professeur d'université pédagogue. Explique le concept de manière académique mais vulgarisée. Utilise un ton sérieux, structure tes idées avec des points clés, mais évite le jargon inutile.",
        "🚀 Expert (Métaphore)": "Tu t'adresses à un expert qui veut une nouvelle perspective. N'utilise aucun terme technique du domaine. Explique tout le concept uniquement à travers une métaphore complexe et filée."
    }

    try:
        client = OpenAI(api_key=request.api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Ou llama3-8b-8192 sur Groq
            messages=[
                {"role": "system", "content": prompts.get(request.level, "Simplifie ce texte.")},
                {"role": "user", "content": request.text}
            ],
            temperature=0.7
        )
        return {"output": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)