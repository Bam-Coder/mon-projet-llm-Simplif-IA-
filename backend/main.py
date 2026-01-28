import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from google import genai
import requests

# Charger les clés API depuis le .env
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")

# Initialisation FastAPI
app = FastAPI(title="Simplif-IA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schéma de requête
class SimplifyRequest(BaseModel):
    text: str
    level: str
    provider: str  # openai | gemini | deepseek

# Prompts par niveau
PROMPTS = {
    "👶 Enfant (5 ans)": "Tu es un instituteur de maternelle. Explique très simplement avec des jouets ou des bonbons, en 1 ou 7 phrases seulement.", 
    "😎 Adolescent": "Tu es un grand frère cool. Explique le texte de façon simple et courte, maximum 7 phrases, avec un exemple du quotidien.", 
    "🎓 Étudiant": "Tu es un professeur pédagogue. Résume le texte clairement et brièvement, 7 phrases max, sans jargon inutile.", 
    "🚀 Expert (Métaphore)": "Explique le texte uniquement via une métaphore filée, concise, maximum 7 phrases."
}
@app.post("/api/simplify")
async def simplify(req: SimplifyRequest):
    system_prompt = PROMPTS.get(req.level, "Simplifie ce texte.")

    try:
        # ------------------ OPENAI ------------------
        if req.provider.lower() == "openai":
            if not OPENAI_KEY:
                return {"output": "⚠️ Crédit insuffisant pour OpenAI ou clé manquante."}

            try:
                client = OpenAI(api_key=OPENAI_KEY)
                response = client.responses.create(
                    model="gpt-4o-mini",
                    input=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": req.text}
                    ]
                )
                return {"output": response.output_text}
            except Exception as e:
                msg = str(e)
                if "quota" in msg or "balance" in msg:
                    return {"output": "⚠️ Crédit insuffisant pour OpenAI."}
                return {"output": f"❌ Erreur OpenAI : {msg}"}

        # ------------------ GEMINI ------------------
        elif req.provider.lower() == "gemini":
            if not GEMINI_KEY:
                return {"output": "⚠️ Crédit insuffisant pour Gemini ou clé manquante."}

            try:
                client = genai.Client(api_key=GEMINI_KEY)
                available_models = client.models.list()
                model_names = [m.name for m in available_models]

                # Choix automatique du meilleur modèle
                preferred_models = ["models/gemini-2.5-flash", "models/gemini-2.5-pro", "models/gemini-flash-latest"]
                chosen_model = next((m for m in preferred_models if m in model_names), None)
                if not chosen_model:
                    chosen_model = model_names[0]

                full_prompt = f"{system_prompt}\n\nTexte : {req.text}"
                response = client.models.generate_content(model=chosen_model, contents=full_prompt)
                return {"output": response.text}

            except Exception as e:
                msg = str(e)
                if "Insufficient" in msg or "balance" in msg or "quota" in msg:
                    return {"output": "⚠️ Crédit insuffisant pour Gemini."}
                return {"output": f"❌ Erreur Gemini : {msg}"}

        # ------------------ DEEPSEEK ------------------
        elif req.provider.lower() == "deepseek":
            if not DEEPSEEK_KEY:
                return {"output": "⚠️ Crédit insuffisant pour DeepSeek ou clé manquante."}

            try:
                url = "https://api.deepseek.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
                payload = {
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": req.text}
                    ]
                }
                r = requests.post(url, json=payload, headers=headers, timeout=15)
                r.raise_for_status()
                data = r.json()
                simplified_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                if not simplified_text:
                    simplified_text = "⚠️ Impossible de simplifier ce texte pour le moment."
                return {"output": simplified_text}

            except requests.exceptions.HTTPError as e:
                err_msg = r.json().get("error", {}).get("message", "")
                if "Insufficient" in err_msg or "balance" in err_msg:
                    return {"output": "⚠️ Crédit insuffisant pour DeepSeek."}
                return {"output": f"❌ Erreur DeepSeek : {err_msg}"}
            except Exception as e:
                return {"output": f"❌ Erreur DeepSeek : {str(e)}"}

        # ------------------ Provider inconnu ------------------
        else:
            raise HTTPException(400, "Provider inconnu")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Erreur serveur : {str(e)}")
if __name__ == "__main__":
    import uvicorn
    # Render définit automatiquement la variable PORT
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)