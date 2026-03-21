from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.wardrobe import WardrobeItem
from services.weather_service import get_weather
from services.ai_service import generate_outfit_suggestion, rate_outfit

ai_bp = Blueprint('ai', __name__)

VALID_MOODS = {'casual', 'formal', 'party', 'sporty', 'date', 'work', 'beach', 'travel'}

@ai_bp.route('/suggest', methods=['POST'])
@jwt_required()
def suggest_outfit():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    mood = data.get('mood', 'casual').lower()
    city = data.get('city', '').strip()

    if mood not in VALID_MOODS:
        mood = 'casual'

    # Fetch weather
    weather = get_weather(city) if city else {
        'city': '',
        'temperature': 22,
        'feels_like': 21,
        'description': 'clear',
        'feel_category': 'warm',
    }

    # Get user's wardrobe
    wardrobe = WardrobeItem.query.filter_by(user_id=user_id).all()
    wardrobe_data = [item.to_dict() for item in wardrobe]

    # Generate AI suggestion
    result = generate_outfit_suggestion(
        mood=mood,
        weather=weather,
        wardrobe_items=wardrobe_data,
        is_premium=user.is_premium,
    )

    return jsonify({
        'suggestion': result.get('suggestion', {}),
        'weather': weather,
        'mood': mood,
        'wardrobe_count': len(wardrobe_data),
        'is_premium': user.is_premium,
    })


@ai_bp.route('/rate-outfit', methods=['POST'])
@jwt_required()
def rate_user_outfit():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if not user.is_premium:
        return jsonify({'error': 'Premium feature. Upgrade to access outfit rating.'}), 403

    data = request.get_json()
    description = data.get('description', '')
    mood = data.get('mood', 'casual')
    city = data.get('city', '')

    weather = get_weather(city) if city else {'temperature': 22, 'feel_category': 'warm'}
    rating = rate_outfit(description, mood, weather)

    return jsonify({'rating': rating, 'weather': weather})


@ai_bp.route('/moods', methods=['GET'])
def get_moods():
    moods = [
        {'id': 'casual', 'label': 'Casual', 'emoji': '👟', 'desc': 'Relaxed everyday look'},
        {'id': 'formal', 'label': 'Formal', 'emoji': '👔', 'desc': 'Professional & polished'},
        {'id': 'party', 'label': 'Party', 'emoji': '🎉', 'desc': 'Bold & statement-making'},
        {'id': 'sporty', 'label': 'Sporty', 'emoji': '⚡', 'desc': 'Active & athletic'},
        {'id': 'date', 'label': 'Date Night', 'emoji': '🌹', 'desc': 'Romantic & charming'},
        {'id': 'work', 'label': 'Work', 'emoji': '💼', 'desc': 'Smart business casual'},
        {'id': 'beach', 'label': 'Beach', 'emoji': '🏖️', 'desc': 'Breezy coastal vibes'},
        {'id': 'travel', 'label': 'Travel', 'emoji': '✈️', 'desc': 'Comfortable & stylish'},
    ]
    return jsonify(moods)