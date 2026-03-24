from models.database import db
from datetime import datetime

class WardrobeItem(db.Model):
    __tablename__ = 'wardrobe_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)   # tops, bottoms, shoes, outerwear, accessories
    item_type = db.Column(db.String(100), nullable=False)  # shirt, jeans, sneakers, etc.
    color = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(500), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'category': self.category,
            'item_type': self.item_type,
            'color': self.color,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat(),
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    notif_type = db.Column(db.String(50), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=True)
    message = db.Column(db.String(300), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # receiver
    user = db.relationship(
        'User',
        foreign_keys=[user_id],
        backref='received_notifications'
    )

    #  sender
    actor = db.relationship(
        'User',
        foreign_keys=[actor_id],
        backref='sent_notifications'
    )

    post = db.relationship('Post', backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'notif_type': self.notif_type,
            'post_id': self.post_id,
            'message': self.message,
            'actor_username': self.actor.username,
            'actor_picture': self.actor.profile_picture,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
        }