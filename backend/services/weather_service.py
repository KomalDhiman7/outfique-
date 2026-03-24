import os
import requests

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')

def get_weather(city: str) -> dict:
    """
    Fetch current weather for a city using OpenWeatherMap API.
    Returns a dict with temperature, description, and feel.
    Falls back to mock data if API key is not set.
    """
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == 'your-openweathermap-api-key':
        return _mock_weather(city)

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            'q': city,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()

        temp = data['main']['temp']
        desc = data['weather'][0]['description']
        feels = data['main']['feels_like']

        return {
            'city': city,
            'temperature': round(temp),
            'feels_like': round(feels),
            'description': desc,
            'feel_category': _categorize_temp(temp),
        }
    except Exception as e:
        print(f"Weather API error: {e}")
        return _mock_weather(city)


def _categorize_temp(temp: float) -> str:
    if temp < 5:
        return 'freezing'
    elif temp < 12:
        return 'cold'
    elif temp < 20:
        return 'cool'
    elif temp < 28:
        return 'warm'
    else:
        return 'hot'


def _mock_weather(city: str) -> dict:
    """Mock weather data for demo/dev mode."""
    return {
        'city': city or 'Your City',
        'temperature': 22,
        'feels_like': 21,
        'description': 'partly cloudy',
        'feel_category': 'warm',
    }