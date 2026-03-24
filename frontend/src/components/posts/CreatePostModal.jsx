import React, { useState, useRef } from 'react';
import { X, Upload, ImagePlus } from 'lucide-react';
import { postsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CreatePostModal({ onClose, onCreated }) {
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!caption.trim() && !file) {
      toast.error('Add a caption or image');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('caption', caption);
      form.append('tags', tags);
      if (file) form.append('image', file);

      await postsAPI.create(form);
      toast.success('Post shared! ✨');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.5rem' }}>New Post</h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 6 }}><X size={18} /></button>
        </div>

        {/* Image upload */}
        <div
          className={`drop-zone ${preview ? '' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          style={{ padding: preview ? 0 : undefined, overflow: 'hidden' }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
          ) : (
            <>
              <ImagePlus size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
              <p className="font-medium text-sm">Drop image or click to browse</p>
              <p className="text-xs text-muted mt-2">JPG, PNG, WEBP up to 16MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

        {preview && (
          <button className="btn btn-ghost btn-sm mt-2" onClick={() => { setFile(null); setPreview(null); }}>
            Remove image
          </button>
        )}

        <div className="form-group mt-4">
          <label className="form-label">Caption</label>
          <textarea
            className="form-input"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Describe your outfit…"
            rows={3}
            maxLength={1000}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-group mt-3">
          <label className="form-label">Tags</label>
          <input
            className="form-input"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="minimalist, ootd, streetwear (comma separated)"
          />
        </div>

        <div className="flex gap-3 mt-6" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sharing…' : 'Share Post'}
          </button>
        </div>
      </div>
    </div>
  );
}