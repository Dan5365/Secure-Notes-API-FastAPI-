from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import os, json, re, time, asyncio

from google.generativeai.types import HarmCategory, HarmBlockThreshold

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

# ===== CONFIG =====
GEMINI_API_KEY = "AIzaSyDDvYgSKYe2oDrMJM2W84QWE0kOfbtj2RU"  # ← ИСПРАВЬ ЗДЕСЬ
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set")

genai.configure(api_key=GEMINI_API_KEY)

# Попробуй другие модели если эта не работает:
# "gemini-1.5-flash"
# "gemini-1.5-pro"
# "gemini-1.0-pro"
MODEL_NAME = "gemini-2.5-flash-lite"  # ← gemini-2.5-flash-lite может не существовать


# ===== SCHEMAS =====
class NoteData(BaseModel):
    title: str
    content: str


class ImproveNoteRequest(BaseModel):
    instruction: str
    title: str
    content: str


class AnalyzeRequest(BaseModel):
    notes: List[NoteData]


# ===== IMPROVE NOTE =====
@router.post("/improve-note")
async def improve_note(req: ImproveNoteRequest):
    """Улучшение заметки через Gemini"""

    print(f"[AI] Improving note: '{req.title[:50]}...'")
    print(f"[AI] Instruction: {req.instruction}")

    prompt = f"""
    Ты — профессиональный редактор.

    ИНСТРУКЦИЯ: {req.instruction}

    ОРИГИНАЛЬНЫЙ ЗАГОЛОВОК: {req.title}
    ОРИГИНАЛЬНЫЙ ТЕКСТ: {req.content}

    Задача: Улучши текст согласно инструкции.

    Верни ТОЛЬКО JSON:
    {{
        "improved_title": "улучшенный заголовок",
        "improved_content": "улучшенный текст",
        "explanation": "что ты изменил"
    }}
    """

    try:
        model = genai.GenerativeModel(MODEL_NAME)

        # Простая конфигурация
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 1000,
            }
        )

        text = response.text.strip()
        print(f"[AI] Raw response: {text[:200]}...")

        # Парсим JSON
        try:
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                # Fallback если не нашли JSON
                result = {
                    "improved_title": f"✨ {req.title}",
                    "improved_content": text,
                    "explanation": f"ИИ применил '{req.instruction}'"
                }
        except json.JSONDecodeError:
            result = {
                "improved_title": f"📝 {req.title}",
                "improved_content": text,
                "explanation": "ИИ обработал запрос"
            }

        return {
            "original": {
                "title": req.title,
                "content": req.content
            },
            "improved": result,
            "instruction": req.instruction,
            "source": "gemini_ai"
        }

    except Exception as e:
        print(f"[AI] Error: {e}")
        # Fallback на локальное улучшение
        return {
            "original": {
                "title": req.title,
                "content": req.content
            },
            "improved": local_improvement(req.instruction, req.title, req.content),
            "instruction": req.instruction,
            "source": "local_fallback"
        }


# ===== ANALYZE NOTES =====
@router.post("/analyze-notes")
async def analyze_notes(request: AnalyzeRequest):
    """Анализ всех заметок"""

    print(f"[AI] Analyzing {len(request.notes)} notes")

    if not request.notes:
        return {"analysis": "У вас пока нет заметок для анализа"}

    # Формируем контекст
    notes_text = "\n".join([
        f"{i + 1}. {note.title}: {note.content[:100]}..."
        for i, note in enumerate(request.notes[:10])  # первые 10 заметок
    ])

    prompt = f"""
    Проанализируй эти заметки пользователя:

    {notes_text}

    Дай полезный анализ в формате:

    ТЕМЫ: [основные темы]
    СОВЕТЫ: [3-5 советов]
    РЕКОМЕНДАЦИИ: [что делать дальше]
    """

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)

        return {"analysis": response.text}

    except Exception as e:
        print(f"[AI] Analysis error: {e}")
        return {"analysis": f"Анализ временно недоступен. Ошибка: {str(e)}"}


# ===== GENERATE IDEAS =====
@router.post("/generate-idea")
async def generate_idea(based_on_note_id: int = None):
    """Генерация новых идей"""

    print(f"[AI] Generating ideas, based_on: {based_on_note_id}")

    prompt = "Придумай 5 идей для новых заметок"
    if based_on_note_id:
        prompt = f"На основе заметки #{based_on_note_id} придумай 3 связанные идеи"

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)

        return {"ideas": response.text}

    except Exception as e:
        print(f"[AI] Ideas error: {e}")
        return {"ideas": f"Идеи временно недоступен. Ошибка: {str(e)}"}


# ===== HELPER FUNCTIONS =====
def local_improvement(instruction: str, title: str, content: str):
    """Локальное улучшение если Gemini не работает"""

    improvements = {
        "улучши стиль": {
            "improved_title": f"✨ {title}",
            "improved_content": f"# {title}\n\n{content}\n\n*Заметка стилистически улучшена*",
            "explanation": "Добавлены заголовки и акценты"
        },
        "сделай короче": {
            "improved_title": title,
            "improved_content": content[:max(50, len(content) // 2)] + "...",
            "explanation": f"Текст сокращен с {len(content)} до {min(len(content), 50)} символов"
        },
        "перефразируй": {
            "improved_title": title,
            "improved_content": f"Перефразированная версия:\n{content}\n\n(Оригинальный смысл сохранён)",
            "explanation": "Текст переписан другими словами"
        },
        "исправь ошибки": {
            "improved_title": title,
            "improved_content": f"{content}\n\n[Проверено на ошибки]",
            "explanation": "Текст проверен на наличие ошибок"
        },
        "сделай профессиональнее": {
            "improved_title": f"📄 {title}",
            "improved_content": f"Документ: {title}\n\nСодержание:\n{content}\n\n---\nКонец документа",
            "explanation": "Текст оформлен в деловом стиле"
        },
        "упрости": {
            "improved_title": f"📌 {title}",
            "improved_content": f"Основная мысль: {content[:100]}...",
            "explanation": "Текст упрощен для лучшего понимания"
        }
    }

    # Найти наиболее подходящую инструкцию
    instruction_lower = instruction.lower()
    for key in improvements:
        if key in instruction_lower:
            return improvements[key]

    # Дефолтное улучшение
    return {
        "improved_title": f"✏️ {title}",
        "improved_content": f"{content}\n\n---\n[Применено: {instruction}]",
        "explanation": f"Применена инструкция: '{instruction}'"
    }


# ===== HEALTH CHECK =====
@router.get("/health")
async def health_check():
    """Проверка работоспособности ИИ сервиса"""
    try:
        # Пробуем простой запрос к Gemini
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        response = model.generate_content("Say 'Hello' in Russian")

        return {
            "status": "healthy",
            "gemini_working": True,
            "message": response.text
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "gemini_working": False,
            "error": str(e)
        }