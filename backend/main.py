from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import os
import openai
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
import tempfile
import whisperx
from openai import OpenAI

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Nebius AI Studio client
nebius_client = OpenAI(
    base_url="https://api.studio.nebius.com/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY")
)

# Load WhisperX model at startup (CPU for Mac, use 'cuda' for GPU)
whisperx_model = whisperx.load_model("large-v2", device="cpu")

# Initialize ElevenLabs client
eleven_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

app = FastAPI()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

async def transcribe_audio(audio_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        result = whisperx_model.transcribe(tmp.name)
    return result["text"].strip()

async def chat_with_gpt(prompt: str) -> str:
    response = nebius_client.chat.completions.create(
        model="Qwen/Qwen3-30B-A3B-fast",
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    )
    llm_output = response.choices[0].message.content.strip()
    # Remove any <think>...</think> tags if present
    import re
    llm_output = re.sub(r'<think>.*?</think>', '', llm_output, flags=re.DOTALL).strip()
    return llm_output

async def synthesize_speech(text: str) -> bytes:
    audio = eleven_client.generate(
        text=text,
        voice="Rachel",  # or any available voice
        model="eleven_multilingual_v2"
    )
    return audio

@app.websocket("/ws/audio")
async def websocket_audio_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            audio_bytes = await websocket.receive_bytes()
            # 1. Transcribe
            user_text = await transcribe_audio(audio_bytes)
            # 2. Chat
            ai_text = await chat_with_gpt(user_text)
            # 3. Synthesize
            ai_audio = await synthesize_speech(ai_text)
            # 4. Send audio back
            await websocket.send_bytes(ai_audio)
    except Exception as e:
        await websocket.close()
        print(f"WebSocket closed: {e}")
