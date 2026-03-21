# Outfique 👗✨
### AI-Powered Personal Stylist & Fashion Sharing Platform

A full-stack SaaS web application built with React + Flask. Share outfits, manage your wardrobe, and get AI-powered styling suggestions based on your mood and weather.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Flask (Python 3.10+) |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT (flask-jwt-extended) |
| AI | OpenAI GPT-4o |
| Weather | OpenWeatherMap API |
| Styling | Custom CSS design system |

---

## Project Structure

```
outfique/
├── backend/
│   ├── app.py                  # Flask app factory + seeding
│   ├── requirements.txt
│   ├── .env                    # API keys (copy from .env.example)
│   ├── models/
│   │   ├── database.py         # SQLAlchemy db instance
│   │   ├── user.py             # User model
│   │   ├── post.py             # Post, Comment models
│   │   └── wardrobe.py         # WardrobeItem, Notification models
│   ├── routes/
│   │   ├── auth.py             # /api/auth/* - signup, login, profile
│   │   ├── posts.py            # /api/posts/* - feed, CRUD, like, save
│   │   ├── wardrobe.py         # /api/wardrobe/* - items CRUD
│   │   ├── ai_stylist.py       # /api/ai/* - outfit suggestions
│   │   ├── profile.py          # /api/profile/* - user profiles
│   │   ├── notifications.py    # /api/notifications/*
│   │   └── search.py           # /api/search
│   ├── services/
│   │   ├── ai_service.py       # OpenAI outfit generation + rating
│   │   └── weather_service.py  # OpenWeatherMap integration
│   ├── utils/
│   │   └── file_upload.py      # Image upload helper
│   └── static/uploads/         # Uploaded images (auto-created)
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.jsx             # Router + providers
        ├── index.css           # Full design system
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── services/
        │   └── api.js          # All API calls (axios)
        ├── components/
        │   ├── layout/
        │   │   └── Layout.jsx  # Sidebar + mobile nav
        │   └── posts/
        │       ├── PostCard.jsx        # Feed post card
        │       ├── CommentsPanel.jsx   # Comments modal
        │       └── CreatePostModal.jsx # New post modal
        └── pages/
            ├── Home.jsx        # Infinite scroll feed
            ├── AIStylist.jsx   # AI outfit suggestions
            ├── Wardrobe.jsx    # Wardrobe management
            ├── Profile.jsx     # User profile + tabs
            ├── Notifications.jsx
            ├── Search.jsx
            ├── Login.jsx
            └── Signup.jsx
```

---

## Quick Start

### 1. Clone & navigate

```bash
cd outfique
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# OR
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env .env.local
# Edit .env and fill in your API keys (see below)

# Run the server
python app.py
```

Backend runs on **http://localhost:5000**

The SQLite database (`outfique.db`) is auto-created on first run, along with 3 demo users and sample posts.

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend runs on **http://localhost:3000**

---

## Environment Variables

Edit `backend/.env`:

```env
# Required for core functionality
SECRET_KEY=your-super-secret-key-change-this
JWT_SECRET_KEY=your-jwt-secret-key-change-this

# AI features (get from https://platform.openai.com)
OPENAI_API_KEY=sk-your-openai-api-key

# Weather features (get from https://openweathermap.org/api - free tier works)
OPENWEATHER_API_KEY=your-openweathermap-api-key

FLASK_ENV=development
FLASK_DEBUG=1
```

**Note:** The app works without API keys in demo mode:
- Without `OPENAI_API_KEY`: Falls back to curated outfit suggestions
- Without `OPENWEATHER_API_KEY`: Uses mock weather data (22°C, warm)

---

## Demo Accounts

Three demo accounts are seeded automatically:

| Email | Password | Username |
|---|---|---|
| aurora@demo.com | demo123 | aurora_styles (Premium) |
| nova@demo.com | demo123 | nova_fits |
| zara@demo.com | demo123 | zara_chic |

Or click **"Try demo account"** on the login page.

---

## Features

### Authentication
- JWT-based signup/login
- Protected routes
- Profile editing (bio, avatar)

### Home Feed
- Paginated post feed (12 per page)
- Infinite scroll
- Like, comment, save posts
- Create posts with image upload

### AI Stylist
- Select mood (8 options: casual, formal, party, sporty, date, work, beach, travel)
- Optional city input for live weather
- Generates: top, bottom, shoes, outerwear, color palette + reasoning
- Premium: style tips, hex color swatches, occasion scoring

### Wardrobe
- Add clothing items (name, category, type, color, photo)
- Category filtering
- Stats by category
- AI uses wardrobe items for personalised suggestions

### Profile
- Posts tab, Saved tab, Wardrobe tab
- Edit bio inline
- Post count stats

### Notifications
- Like/comment notifications
- Unread count badge
- Mark all as read

### Search
- Search users by username
- Search posts by caption or tags
- Debounced live search

---

## API Endpoints

### Auth
```
POST /api/auth/signup       { username, email, password }
POST /api/auth/login        { email, password }
GET  /api/auth/me           (protected)
PUT  /api/auth/update-profile (multipart, protected)
```

### Posts
```
GET  /api/posts/feed?page=1
POST /api/posts             (multipart: caption, tags, image)
DELETE /api/posts/:id
POST /api/posts/:id/like
POST /api/posts/:id/save
GET  /api/posts/:id/comments
POST /api/posts/:id/comments  { content }
```

### Wardrobe
```
GET  /api/wardrobe?category=tops
POST /api/wardrobe          (multipart: name, category, item_type, color, image)
DELETE /api/wardrobe/:id
GET  /api/wardrobe/stats
```

### AI Stylist
```
GET  /api/ai/moods
POST /api/ai/suggest        { mood, city? }
POST /api/ai/rate-outfit    { description, mood, city? }  (Premium only)
```

### Other
```
GET  /api/profile/:username?tab=posts|saved
GET  /api/notifications
POST /api/notifications/read-all
GET  /api/search?q=query&type=all|users|posts
```

---

## Adding Premium Features

To mark a user as premium, update the DB directly:

```python
# In Flask shell
from app import create_app
from models.user import User
from models.database import db

app = create_app()
with app.app_context():
    user = User.query.filter_by(username='your_username').first()
    user.is_premium = True
    db.session.commit()
```

Premium unlocks:
- Enhanced AI suggestions (style tips, hex palettes, occasion scores)
- Outfit rating with AI feedback
- PRO badge on posts and profile

---

## Extending the App

### Add Stripe payments
1. Install `stripe` package
2. Create `/api/billing/checkout` route
3. Add webhook handler for subscription events
4. Toggle `user.is_premium` on successful payment

### Deploy
- **Backend**: Railway, Render, or Fly.io (add `gunicorn` to requirements)
- **Frontend**: Vercel or Netlify
- **Database**: Upgrade to PostgreSQL for production (change `DATABASE_URI` in config)
- **Images**: Move uploads to AWS S3 or Cloudflare R2

---

## License

MIT — build freely.
