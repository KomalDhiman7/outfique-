import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))

def generate_outfit_suggestion(mood: str, weather: dict, wardrobe_items: list, is_premium: bool = False) -> dict:
    """
    Generate an AI-powered outfit suggestion.

    Args:
        mood: 'casual', 'formal', 'party', 'sporty', 'date', 'work'
        weather: dict from weather_service with temperature, feel_category, description
        wardrobe_items: list of dicts with name, category, color, item_type
        is_premium: enables better/detailed suggestions

    Returns:
        dict with top, bottom, shoes, colors, reason, (optional) style_tips
    """
    wardrobe_text = _format_wardrobe(wardrobe_items)
    temp = weather.get('temperature', 22)
    feel = weather.get('feel_category', 'warm')
    weather_desc = weather.get('description', 'clear')
    city = weather.get('city', '')

    detail_level = "detailed and creative" if is_premium else "concise"
    premium_instruction = """
Also provide:
- "style_tips": 2-3 specific styling tips (e.g., "tuck in the shirt", "add a belt")
- "color_palette": hex codes for the suggested color palette (3 colors)
- "occasion_fit": rate how well this outfit fits the occasion (1-10)
""" if is_premium else ""

    prompt = f"""You are Outfique — a sophisticated AI fashion stylist with a keen eye for aesthetics.

USER CONTEXT:
- Mood / Occasion: {mood}
- Location: {city if city else 'unspecified'}
- Weather: {temp}°C, feels {feel}, {weather_desc}
- Their wardrobe: {wardrobe_text if wardrobe_text else 'No wardrobe uploaded yet — suggest general items'}

YOUR TASK:
Create a {detail_level} outfit recommendation tailored to the mood and weather. 
If the user has wardrobe items, prefer using those. Otherwise, suggest ideal items to buy/wear.

{premium_instruction}

RESPOND ONLY with valid JSON in this exact structure (no markdown, no explanation outside JSON):
{{
  "top": "specific item name and how to style it",
  "bottom": "specific item name and how to style it",
  "shoes": "specific shoe recommendation",
  "outerwear": "if weather requires it, else null",
  "colors": "color palette description (2-3 colors that work together)",
  "reason": "2-3 sentences explaining why this outfit works for the mood and weather",
  "style_tips": ["tip 1", "tip 2"] or [],
  "color_palette": ["#hex1", "#hex2", "#hex3"] or [],
  "occasion_fit": null
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are Outfique, a world-class AI fashion stylist. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.85,
            max_tokens=600 if is_premium else 400,
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)
        return {"success": True, "suggestion": result}

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}, raw: {raw}")
        return {"success": True, "suggestion": _fallback_suggestion(mood, feel)}
    except Exception as e:
        print(f"OpenAI error: {e}")
        return {"success": True, "suggestion": _fallback_suggestion(mood, feel)}


def rate_outfit(image_description: str, mood: str, weather: dict) -> dict:
    """
    Premium feature: AI scores and rates an outfit.
    """
    try:
        prompt = f"""You are a fashion expert. Rate this outfit for the occasion.

Outfit description: {image_description}
Occasion/Mood: {mood}
Weather: {weather.get('temperature', 22)}°C, {weather.get('feel_category', 'warm')}

Respond ONLY with JSON:
{{
  "score": <number 1-10>,
  "feedback": "<2-3 sentences of constructive fashion feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>"]
}}"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        return json.loads(raw.strip())

    except Exception as e:
        print(f"Rating error: {e}")
        return {"score": 7.5, "feedback": "Great outfit choice!", "strengths": [], "improvements": []}


def _format_wardrobe(items: list) -> str:
    if not items:
        return ''
    lines = []
    for item in items:
        lines.append(f"- {item.get('name', 'item')} ({item.get('category', '')}, {item.get('color', '')}, {item.get('item_type', '')})")
    return '\n'.join(lines)


def _fallback_suggestion(mood: str, feel: str) -> dict:
    """Fallback suggestion when AI is unavailable."""
    suggestions = {
        'casual': {
            'top': 'Clean white t-shirt or relaxed linen shirt',
            'bottom': 'Well-fitted jeans or chinos',
            'shoes': 'White sneakers or loafers',
            'outerwear': 'Denim jacket if cool' if feel in ['cold', 'cool', 'freezing'] else None,
            'colors': 'Neutrals — white, navy, beige',
            'reason': 'A classic casual outfit that works for most occasions. Clean, effortless, and timeless.',
            'style_tips': [],
            'color_palette': ['#FFFFFF', '#1B2A4A', '#D4B896'],
            'occasion_fit': None,
        },
        'formal': {
            'top': 'Crisp white or light blue dress shirt',
            'bottom': 'Tailored trousers in navy or charcoal',
            'shoes': 'Leather oxford or derby shoes',
            'outerwear': 'Structured blazer in navy or grey',
            'colors': 'Navy, white, charcoal — classic formal palette',
            'reason': 'A polished, professional look that commands respect. The classic formal palette never fails.',
            'style_tips': [],
            'color_palette': ['#1B2A4A', '#FFFFFF', '#4A4A4A'],
            'occasion_fit': None,
        },
        'party': {
            'top': 'Statement top — silk, sequin, or bold color',
            'bottom': 'Sleek trousers or a mini skirt',
            'shoes': 'Heeled boots or chunky sneakers',
            'outerwear': 'Leather jacket for edge' if feel in ['cold', 'cool'] else None,
            'colors': 'Rich jewel tones — emerald, burgundy, or cobalt',
            'reason': 'This outfit commands attention and keeps the energy high. You\'ll be remembered.',
            'style_tips': [],
            'color_palette': ['#1B5E20', '#7B1FA2', '#0D47A1'],
            'occasion_fit': None,
        },
    }
    return suggestions.get(mood, suggestions['casual'])