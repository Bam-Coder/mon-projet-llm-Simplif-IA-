import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from google import genai

# ================== CONFIG ==================
load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")

# ================== APP ==================
app = FastAPI(title="Simplif-IA API — Clarté Absolue")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== SCHEMA ==================
class SimplifyRequest(BaseModel):
    text: str
    level: str        # enfant | ado | etudiant | genie | bonus
    provider: str     # openai | gemini | deepseek

# ================== PROMPTS ==================
PROMPTS = {
    "enfant": """
Explique ce contenu comme si tu parlais à un enfant de 5 ans.
Utilise uniquement des mots très simples.
Explique avec des objets du quotidien (jouets, bonbons, ballon).
Aucune abstraction. Aucune complexité.
Fais des phrases très courtes.

Objectif : compréhension immédiate sans questions.
""",

    "ado": """
Explique ce contenu comme un grand frère intelligent et cool.
Utilise un langage simple et naturel.
Donne un seul exemple concret de la vie quotidienne.
Va droit au but.

Objectif : compréhension rapide et intuitive.
""",

    "etudiant": """
Explique ce contenu comme un professeur très pédagogue.
Structure l’explication clairement.
Explique le quoi, le pourquoi et le comment.
Supprime tout jargon inutile.

Objectif : compréhension claire et mémorisation facile.
""",

    "genie": """
Explique ce contenu de manière extrêmement simple et claire,
comme si tu parlais à quelqu’un de très intelligent mais sans formation technique.

Utilise uniquement des mots simples.
Privilégie les images mentales et les exemples concrets.
Si un mot peut être remplacé par un mot plus simple, fais-le.
Élimine toute complexité inutile.

Objectif : compréhension totale dès la première lecture.
""",

    "bonus": """
Explique ce contenu en t’adaptant automatiquement au niveau du lecteur.

Commence très simple, puis ajoute progressivement de la clarté,
sans jamais compliquer.
Chaque phrase doit pouvoir être comprise seule.
Si une phrase peut créer de la confusion, simplifie-la encore.

Objectif : zéro ambiguïté, compréhension parfaite pour tout public.
"""
}

DEFAULT_PROMPT = PROMPTS["genie"]

# ================== ROUTE ==================
@app.post("/api/simplify")
async def simplify(req: SimplifyRequest):
    system_prompt = PROMPTS.get(req.level.lower(), DEFAULT_PROMPT)

    # -------- OPENAI --------
    if req.provider.lower() == "openai":
        if not OPENAI_KEY:
            return {"output": "⚠️ Clé OpenAI manquante ou crédit insuffisant."}

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
            return {"output": f"❌ Erreur OpenAI : {str(e)}"}

    # -------- GEMINI --------
    elif req.provider.lower() == "gemini":
        if not GEMINI_KEY:
            return {"output": "⚠️ Clé Gemini manquante ou crédit insuffisant."}

        try:
            client = genai.Client(api_key=GEMINI_KEY)
            models = client.models.list()
            model_names = [m.name for m in models]

            preferred = [
                "models/gemini-2.5-flash",
                "models/gemini-2.5-pro",
                "models/gemini-flash-latest"
            ]
            chosen_model = next((m for m in preferred if m in model_names), model_names[0])

            prompt = f"{system_prompt}\n\nTexte : {req.text}"
            response = client.models.generate_content(
                model=chosen_model,
                contents=prompt
            )
            return {"output": response.text}

        except Exception as e:
            return {"output": f"❌ Erreur Gemini : {str(e)}"}

    # -------- DEEPSEEK --------
    elif req.provider.lower() == "deepseek":
        if not DEEPSEEK_KEY:
            return {"output": "⚠️ Clé DeepSeek manquante ou crédit insuffisant."}

        try:
            url = "https://api.deepseek.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {DEEPSEEK_KEY}",
                "Content-Type": "application/json"
            }
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

            output = data.get("choices", [{}])[0].get("message", {}).get("content")
            return {"output": output or "⚠️ Réponse vide."}

        except Exception as e:
            return {"output": f"❌ Erreur DeepSeek : {str(e)}"}

    else:
        raise HTTPException(status_code=400, detail="Provider inconnu")

# ================== RUN ==================
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
