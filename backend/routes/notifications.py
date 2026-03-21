from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.wardrobe import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id)\
        .order_by(Notification.created_at.desc()).limit(50).all()
    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({'notifications': [n.to_dict() for n in notifs], 'unread_count': unread})


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All marked as read'})


@notifications_bp.route('/<int:notif_id>/read', methods=['POST'])
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'})