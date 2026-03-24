import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CommentsPanel({ postId, onClose, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    postsAPI.getComments(postId)
      .then(({ data }) => setComments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await postsAPI.addComment(postId, text.trim());
      setComments(prev => [...prev, data]);
      setText('');
      onCommentAdded?.();
    } catch { toast.error('Could not post comment'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '70vh', padding: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.25rem' }}>Comments</h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 6 }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading && <p className="text-muted text-sm">Loading…</p>}
          {!loading && comments.length === 0 && (
            <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '24px 0' }}>No comments yet. Be first! 💬</p>
          )}
          {comments.map(c => (
            <div key={c.id} style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{c.username?.[0]?.toUpperCase()}</div>
                <span className="font-medium text-sm">{c.username}</span>
                <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm" style={{ paddingLeft: 36 }}>{c.content}</p>
            </div>
          ))}
        </div>

        {user && (
          <form onSubmit={handleSubmit} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input
              ref={inputRef}
              className="form-input"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment…"
              maxLength={500}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!text.trim() || submitting}>
              <Send size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}