// ── Notifications Page ────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, CheckCheck } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await notificationsAPI.getAll();
      setNotifications(data.notifications);
      setUnread(data.unread_count);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
      toast.success('All marked as read');
    } catch { toast.error('Could not update'); }
  };

  const notifIcon = (type) => {
    if (type === 'like') return <Heart size={14} fill="currentColor" style={{ color: '#e05c5c' }} />;
    if (type === 'comment') return <MessageCircle size={14} style={{ color: 'var(--gold)' }} />;
    return <Bell size={14} />;
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAll}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 24 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="notif-item">
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 10, width: '35%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell size={36} style={{ opacity: 0.3, margin: '0 auto' }} /></div>
          <h3>No notifications yet</h3>
          <p>When people like or comment on your posts, you'll see it here</p>
        </div>
      ) : (
        notifications.map(n => (
          <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
            {!n.is_read && <div className="notif-dot" />}
            <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
              {n.actor_username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted mt-2">
                {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>{notifIcon(n.notif_type)}</div>
          </div>
        ))
      )}
    </div>
  );
}