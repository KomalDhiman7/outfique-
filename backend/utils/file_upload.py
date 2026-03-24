import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_upload(file, subfolder=''):
    """Save an uploaded file and return its URL path."""
    if not file or not allowed_file(file.filename):
        return None

    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    upload_dir = current_app.config['UPLOAD_FOLDER']
    if subfolder:
        upload_dir = os.path.join(upload_dir, subfolder)
        os.makedirs(upload_dir, exist_ok=True)

    save_path = os.path.join(upload_dir, unique_name)
    file.save(save_path)

    # Return relative URL
    rel = f"/uploads/{subfolder + '/' if subfolder else ''}{unique_name}"
    return rel