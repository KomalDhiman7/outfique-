import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models.database import db
from routes.auth import auth_bp
from routes.posts import posts_bp
from routes.wardrobe import wardrobe_bp
from routes.ai_stylist import ai_bp
from routes.profile import profile_bp
from routes.notifications import notifications_bp
from routes.search import search_bp

load_dotenv()



def create_app():
    app = Flask(__name__, static_folder='static')

    # Config
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///outfique.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'uploads')

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Extensions
    

    CORS(app, supports_credentials=True)
    app.config['CORS_HEADERS'] = 'Content-Type'
    @app.after_request
    def apply_cors(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        return response
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(wardrobe_bp, url_prefix='/api/wardrobe')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(search_bp, url_prefix='/api/search')

    @app.route('/')
    def home():
        return {"message": "Outfique backend running 🚀"}
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Create all tables
    with app.app_context():
        db.create_all()
        seed_demo_data(app)

    return app

def seed_demo_data(app):
    """Seed demo users and posts if DB is empty."""
    from models.user import User
    from models.post import Post
    from models.wardrobe import WardrobeItem
    from werkzeug.security import generate_password_hash

    if User.query.count() > 0:
        return

    # Demo users
    users = [
        User(username='aurora_styles', email='aurora@demo.com',
             password_hash=generate_password_hash('demo123'),
             bio='Minimalist fashion lover ✨', is_premium=True),
        User(username='nova_fits', email='nova@demo.com',
             password_hash=generate_password_hash('demo123'),
             bio='Street style | NYC 🗽'),
        User(username='zara_chic', email='zara@demo.com',
             password_hash=generate_password_hash('demo123'),
             bio='Boho vibes & vintage finds 🌸'),
    ]
    for u in users:
        db.session.add(u)
    db.session.commit()

    # Demo posts
    posts = [
        Post(user_id=1, caption='Monday minimalism 🤍 clean lines, neutral tones',
             tags='minimalist,monochrome,ootd', image_url=''),
        Post(user_id=2, caption='NYC energy hits different in this fit 🗽🔥',
             tags='streetwear,nyc,urban', image_url=''),
        Post(user_id=1, caption='Soft autumn palette — the season deserves this',
             tags='autumn,boho,earth tones', image_url=''),
        Post(user_id=3, caption='Vintage thrift score of the year 🪴',
             tags='vintage,thrift,sustainable', image_url=''),
        Post(user_id=2, caption='The blazer will never go out of style',
             tags='formal,blazer,classic', image_url=''),
    ]
    for p in posts:
        db.session.add(p)
    db.session.commit()

    # Demo wardrobe items for user 1
    items = [
        WardrobeItem(user_id=1, name='White linen shirt', category='tops',
                     color='white', item_type='shirt', image_url=''),
        WardrobeItem(user_id=1, name='Black slim trousers', category='bottoms',
                     color='black', item_type='trousers', image_url=''),
        WardrobeItem(user_id=1, name='White sneakers', category='shoes',
                     color='white', item_type='sneakers', image_url=''),
        WardrobeItem(user_id=1, name='Beige trench coat', category='outerwear',
                     color='beige', item_type='coat', image_url=''),
    ]
    for item in items:
        db.session.add(item)
    db.session.commit()

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)