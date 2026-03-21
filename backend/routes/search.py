from flask import Blueprint, request, jsonify
from models.user import User
from models.post import Post

search_bp = Blueprint('search', __name__)

@search_bp.route('', methods=['GET'])
def search():
    query = request.args.get('q', '').strip()
    search_type = request.args.get('type', 'all')  # all | users | posts

    if not query or len(query) < 2:
        return jsonify({'users': [], 'posts': []})

    results = {'users': [], 'posts': []}

    if search_type in ('all', 'users'):
        users = User.query.filter(
            User.username.ilike(f'%{query}%')
        ).limit(10).all()
        results['users'] = [u.to_dict() for u in users]

    if search_type in ('all', 'posts'):
        posts = Post.query.filter(
            Post.caption.ilike(f'%{query}%') | Post.tags.ilike(f'%{query}%')
        ).order_by(Post.created_at.desc()).limit(20).all()
        results['posts'] = [p.to_dict() for p in posts]

    return jsonify(results)