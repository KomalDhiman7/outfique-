import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Grid3X3, Bookmark, Shirt, Edit2, Check, X } from 'lucide-react';
import { profileAPI, wardrobeAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/posts/PostCard';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'posts', label: 'Posts', icon: Grid3X3 },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'wardrobe', label: 'Wardrobe', icon: Shirt },
];

function AvatarDisplay({ user, size = 80 }) {
  const src = user?.profile_picture ? `http://localhost:5000${user.profile_picture}` : null;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {src ? <img src={src} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user?.username?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { user: me, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioEdit, setBioEdit] = useState('');

  const isMe = me?.username === username;

  useEffect(() => {
    setLoading(true);
    profileAPI.get(username, tab)
      .then(({ data }) => {
        setProfileData(data.user);
        setPosts(data.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username, tab]);

  useEffect(() => {
    if (tab === 'wardrobe' && isMe) {
      wardrobeAPI.getAll().then(({ data }) => setWardrobe(data)).catch(() => {});
    }
  }, [tab, isMe]);

  const handleSaveBio = async () => {
    try {
      const fd = new FormData();
      fd.append('bio', bioEdit);
      const { data } = await authAPI.updateProfile(fd);
      updateUser(data);
      setProfileData(prev => ({ ...prev, bio: data.bio }));
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Could not update profile'); }
  };

  if (!loading && !profileData) return <Navigate to="/" />;

  return (
    <div>
      {/* Profile Header */}
      <div className="profile-header">
        <AvatarDisplay user={profileData} size={90} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400 }}>
              {profileData?.username}
            </h1>
            {profileData?.is_premium && <span className="premium-badge">✦ PRO</span>}
          </div>

          {/* Bio */}
          {editing ? (
            <div className="flex gap-2 items-center">
              <input
                className="form-input"
                value={bioEdit}
                onChange={e => setBioEdit(e.target.value)}
                maxLength={300}
                style={{ flex: 1 }}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveBio}><Check size={14} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted" style={{ flex: 1 }}>
                {profileData?.bio || (isMe ? 'Add a bio…' : '')}
              </p>
              {isMe && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setBioEdit(profileData?.bio || ''); setEditing(true); }}>
                  <Edit2 size={13} /> Edit
                </button>
              )}
            </div>
          )}

          <div className="profile-stats">
            <div className="stat-item">
              <p className="stat-num">{profileData?.post_count || 0}</p>
              <p className="stat-label">Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TABS.map(({ id, label, icon: Icon }) => {
          if (id === 'wardrobe' && !isMe) return null;
          return (
            <button key={id} className={`profile-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              <Icon size={14} style={{ display: 'inline', marginRight: 6 }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        {loading ? (
          <div className="feed-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ borderRadius: 12, paddingTop: '120%' }} />
            ))}
          </div>
        ) : tab === 'wardrobe' ? (
          wardrobe.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👗</div>
              <h3>Wardrobe is empty</h3>
              <p>Add items in the Wardrobe tab</p>
            </div>
          ) : (
            <div className="wardrobe-grid">
              {wardrobe.map(item => (
                <div key={item.id} className="wardrobe-item">
                  <div className="wardrobe-image">
                    {item.image_url ? <img src={`http://localhost:5000${item.image_url}`} alt={item.name} /> : <span style={{ fontSize: '1.75rem' }}>👕</span>}
                  </div>
                  <div className="wardrobe-info">
                    <p className="wardrobe-name">{item.name}</p>
                    <p className="wardrobe-meta">{item.color} · {item.item_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📸</div>
            <h3>{tab === 'saved' ? 'No saved posts' : 'No posts yet'}</h3>
            <p>{isMe && tab === 'posts' ? 'Share your first outfit!' : ''}</p>
          </div>
        ) : (
          <div className="feed-grid">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}