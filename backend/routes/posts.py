from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models.database import db
from models.post import Post, Comment
from models.wardrobe import Notification
from models.user import User
from utils.file_upload import save_upload

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/feed', methods=['GET'])
def feed():
    # Try to get current user (optional auth)
    current_user_id = None
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        if uid:
            current_user_id = int(uid)
    except Exception:
        pass

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    posts = Post.query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'posts': [p.to_dict(current_user_id) for p in posts.items],
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page,
        'has_next': posts.has_next,
    })


@posts_bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())

    caption = request.form.get('caption', '')
    tags = request.form.get('tags', '')
    file = request.files.get('image')

    image_url = ''
    if file:
        image_url = save_upload(file, subfolder='posts') or ''

    post = Post(
        user_id=user_id,
        caption=caption,
        tags=tags,
        image_url=image_url,
    )
    db.session.add(post)
    db.session.commit()

    return jsonify(post.to_dict(user_id)), 201


@posts_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    current_user_id = None
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        if uid:
            current_user_id = int(uid)
    except Exception:
        pass

    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict(current_user_id))


@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get_or_404(post_id)

    if post.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'})


@posts_bp.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    post = Post.query.get_or_404(post_id)

    if post.liked_by.filter_by(id=user_id).first():
        post.liked_by.remove(user)
        liked = False
    else:
        post.liked_by.append(user)
        liked = True
        # Create notification (skip self-likes)
        if post.user_id != user_id:
            notif = Notification(
                user_id=post.user_id,
                actor_id=user_id,
                notif_type='like',
                post_id=post_id,
                message=f"{user.username} liked your outfit post",
            )
            db.session.add(notif)

    db.session.commit()
    return jsonify({'liked': liked, 'like_count': post.liked_by.count()})


@posts_bp.route('/<int:post_id>/save', methods=['POST'])
@jwt_required()
def toggle_save(post_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    post = Post.query.get_or_404(post_id)

    if post.saved_by.filter_by(id=user_id).first():
        post.saved_by.remove(user)
        saved = False
    else:
        post.saved_by.append(user)
        saved = True

    db.session.commit()
    return jsonify({'saved': saved, 'save_count': post.saved_by.count()})


@posts_bp.route('/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    Post.query.get_or_404(post_id)
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments])


@posts_bp.route('/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    post = Post.query.get_or_404(post_id)
    data = request.get_json()

    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Comment cannot be empty'}), 400

    comment = Comment(post_id=post_id, user_id=user_id, content=content)
    db.session.add(comment)

    # Notify post owner
    if post.user_id != user_id:
        notif = Notification(
            user_id=post.user_id,
            actor_id=user_id,
            notif_type='comment',
            post_id=post_id,
            message=f"{user.username} commented on your post",
        )
        db.session.add(notif)

    db.session.commit()
    return jsonify(comment.to_dict()), 201