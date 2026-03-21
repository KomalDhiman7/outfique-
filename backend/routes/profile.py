from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.user import User
from models.post import Post
from models.wardrobe import Notification

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/<username>', methods=['GET'])
def get_profile(username):
    user = User.query.filter_by(username=username).first_or_404()

    page = request.args.get('page', 1, type=int)
    tab = request.args.get('tab', 'posts')  # posts | saved | wardrobe

    if tab == 'saved':
        posts = user.saved_posts.order_by(Post.created_at.desc()).paginate(page=page, per_page=12, error_out=False)
    else:
        posts = user.posts.order_by(Post.created_at.desc()).paginate(page=page, per_page=12, error_out=False)

    return jsonify({
        'user': user.to_dict(),
        'posts': [p.to_dict() for p in posts.items],
        'total': posts.total,
        'pages': posts.pages,
    })