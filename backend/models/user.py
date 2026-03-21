from models.database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.String(300), default='')
    profile_picture = db.Column(db.String(500), default='')
    is_premium = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    wardrobe_items = db.relationship('WardrobeItem', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='recipient', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'username': self.username,
            'bio': self.bio,
            'profile_picture': self.profile_picture,
            'is_premium': self.is_premium,
            'post_count': self.posts.count(),
            'created_at': self.created_at.isoformat(),
        }
        if include_private:
            data['email'] = self.email
        return data