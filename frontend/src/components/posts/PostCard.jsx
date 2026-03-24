import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Trash2, Star } from 'lucide-react';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import CommentsPanel from './CommentsPanel';

function Avatar({ user }) {
  const src = user?.profile_picture ? `http://localhost:5000${user.profile_picture}` : null;
  return (
    <div className="avatar">
      {src ? <img src={src} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user?.username?.[0]?.toUpperCase()}
    </div>
  );
}

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [saved, setSaved] = useState(post.is_saved);
  const [saveCount, setSaveCount] = useState(post.save_count);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count);

  const handleLike = async () => {
    try {
      const { data } = await postsAPI.like(post.id);
      setLiked(data.liked);
      setLikeCount(data.like_count);
    } catch { toast.error('Could not like post'); }
  };

  const handleSave = async () => {
    try {
      const { data } = await postsAPI.save(post.id);
      setSaved(data.saved);
      setSaveCount(data.save_count);
      toast.success(data.saved ? 'Saved to collection' : 'Removed from saved');
    } catch { toast.error('Could not save post'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsAPI.delete(post.id);
      toast.success('Post deleted');
      onDelete?.(post.id);
    } catch { toast.error('Could not delete post'); }
  };

  const isOwner = user?.id === post.user_id;

  return (
    <>
      <article className="post-card">
        {/* Header */}
        <div className="post-header">
          <Avatar user={{ username: post.username, profile_picture: post.profile_picture }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link to={`/profile/${post.username}`} className="font-medium text-sm truncate" style={{ display: 'block' }}>
              {post.username}
            </Link>
            <span className="text-xs text-muted">
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          {post.is_premium && <span className="premium-badge">✦ PRO</span>}
          {post.ai_score && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'var(--gold)' }}>
              <Star size={11} fill="currentColor" /> {post.ai_score.toFixed(1)}
            </span>
          )}
          {isOwner && (
            <button className="btn-ghost" onClick={handleDelete} style={{ padding: 6, color: 'var(--muted)' }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Image */}
        <div className="post-image-wrap">
          {post.image_url ? (
            <img src={`http://localhost:5000${post.image_url}`} alt={post.caption} loading="lazy" />
          ) : (
            <div className="post-image-placeholder">
              <span style={{ fontSize: '2rem' }}>👗</span>
              <span>Outfit post</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="post-actions">
          <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
            {likeCount > 0 && likeCount}
          </button>
          <button className="action-btn" onClick={() => setShowComments(true)}>
            <MessageCircle size={17} />
            {commentCount > 0 && commentCount}
          </button>
          <button className={`action-btn ${saved ? 'saved' : ''}`} onClick={handleSave} style={{ marginLeft: 'auto' }}>
            <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
            {saveCount > 0 && saveCount}
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="post-caption">
            <strong>{post.username}</strong>{' '}
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.filter(Boolean).map((t) => (
              <span key={t} className="tag">#{t.trim()}</span>
            ))}
          </div>
        )}

        {/* AI Feedback (premium) */}
        {post.ai_feedback && (
          <div style={{ margin: '0 16px 14px', padding: '10px 12px', background: 'var(--gold-pale)', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--muted)', borderLeft: '2px solid var(--gold)' }}>
            ✦ {post.ai_feedback}
          </div>
        )}
      </article>

      {showComments && (
        <CommentsPanel
          postId={post.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentCount(c => c + 1)}
        />
      )}
    </>
  );
}