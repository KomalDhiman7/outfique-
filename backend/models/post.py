from models.database import db
from datetime import datetime

# Association tables
post_likes = db.Table('post_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True)
)

post_saves = db.Table('post_saves',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True)
)

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_url = db.Column(db.String(500), default='')
    caption = db.Column(db.String(1000), default='')
    tags = db.Column(db.String(500), default='')  # comma-separated
    ai_score = db.Column(db.Float, nullable=True)  # premium feature
    ai_feedback = db.Column(db.String(1000), nullable=True)  # premium AI rating
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    liked_by = db.relationship('User', secondary=post_likes, lazy='dynamic',
                               backref=db.backref('liked_posts', lazy='dynamic'))
    saved_by = db.relationship('User', secondary=post_saves, lazy='dynamic',
                               backref=db.backref('saved_posts', lazy='dynamic'))

    def to_dict(self, current_user_id=None):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.author.username,
            'profile_picture': self.author.profile_picture,
            'is_premium': self.author.is_premium,
            'image_url': self.image_url,
            'caption': self.caption,
            'tags': self.tags.split(',') if self.tags else [],
            'like_count': self.liked_by.count(),
            'comment_count': self.comments.count(),
            'save_count': self.saved_by.count(),
            'is_liked': self.liked_by.filter_by(id=current_user_id).first() is not None if current_user_id else False,
            'is_saved': self.saved_by.filter_by(id=current_user_id).first() is not None if current_user_id else False,
            'ai_score': self.ai_score,
            'ai_feedback': self.ai_feedback,
            'created_at': self.created_at.isoformat(),
        }

class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='comments')

    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'username': self.user.username,
            'profile_picture': self.user.profile_picture,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
        }