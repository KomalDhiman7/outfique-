from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.wardrobe import WardrobeItem
from utils.file_upload import save_upload

wardrobe_bp = Blueprint('wardrobe', __name__)

VALID_CATEGORIES = {'tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'dresses', 'bags'}

@wardrobe_bp.route('', methods=['GET'])
@jwt_required()
def get_wardrobe():
    user_id = int(get_jwt_identity())
    category = request.args.get('category')

    query = WardrobeItem.query.filter_by(user_id=user_id)
    if category:
        query = query.filter_by(category=category)

    items = query.order_by(WardrobeItem.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])


@wardrobe_bp.route('', methods=['POST'])
@jwt_required()
def add_item():
    user_id = int(get_jwt_identity())

    name = request.form.get('name', '').strip()
    category = request.form.get('category', '').strip().lower()
    item_type = request.form.get('item_type', '').strip().lower()
    color = request.form.get('color', '').strip().lower()
    file = request.files.get('image')

    if not name or not category or not item_type or not color:
        return jsonify({'error': 'Name, category, type, and color are required'}), 400

    if category not in VALID_CATEGORIES:
        return jsonify({'error': f'Category must be one of: {", ".join(VALID_CATEGORIES)}'}), 400

    image_url = ''
    if file:
        image_url = save_upload(file, subfolder='wardrobe') or ''

    item = WardrobeItem(
        user_id=user_id,
        name=name,
        category=category,
        item_type=item_type,
        color=color,
        image_url=image_url,
    )
    db.session.add(item)
    db.session.commit()

    return jsonify(item.to_dict()), 201


@wardrobe_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    user_id = int(get_jwt_identity())
    item = WardrobeItem.query.get_or_404(item_id)

    if item.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item removed'})


@wardrobe_bp.route('/stats', methods=['GET'])
@jwt_required()
def wardrobe_stats():
    user_id = int(get_jwt_identity())
    items = WardrobeItem.query.filter_by(user_id=user_id).all()

    by_category = {}
    colors = {}
    for item in items:
        by_category[item.category] = by_category.get(item.category, 0) + 1
        colors[item.color] = colors.get(item.color, 0) + 1

    return jsonify({
        'total': len(items),
        'by_category': by_category,
        'top_colors': dict(sorted(colors.items(), key=lambda x: x[1], reverse=True)[:5]),
    })