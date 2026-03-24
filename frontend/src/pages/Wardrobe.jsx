import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, ImagePlus, Shirt } from 'lucide-react';
import { wardrobeAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'dresses', 'bags'];

const COLOR_MAP = {
  white: '#f8f8f8', black: '#1a1a1a', navy: '#1B2A4A', blue: '#3B8BD4',
  red: '#E24B4A', green: '#3B6D11', yellow: '#EF9F27', orange: '#E8593C',
  pink: '#D4537E', purple: '#7F77DD', beige: '#D4B896', grey: '#888780',
  gray: '#888780', brown: '#7d5a3c', cream: '#f5f0e8', camel: '#c5924e',
};

function getColorDot(color) {
  const key = color?.toLowerCase();
  return COLOR_MAP[key] || '#ccc';
}

function AddItemModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', category: 'tops', item_type: '', color: '' });
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

  const handleSubmit = async () => {
    if (!form.name || !form.item_type || !form.color) {
      toast.error('Fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      const { data } = await wardrobeAPI.add(fd);
      onAdded(data);
      toast.success('Item added to wardrobe!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.5rem' }}>Add to Wardrobe</h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 6 }}><X size={18} /></button>
        </div>

        <div className="drop-zone" onClick={() => fileRef.current?.click()} style={{ padding: preview ? 0 : undefined, overflow: 'hidden', marginBottom: 16 }}>
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
          ) : (
            <>
              <ImagePlus size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
              <p className="text-sm font-medium">Add photo (optional)</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Item name</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. White linen shirt" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <input className="form-input" value={form.item_type} onChange={e => setForm(p => ({ ...p, item_type: e.target.value }))} placeholder="e.g. shirt, jeans, sneakers" />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <input className="form-input" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="e.g. white, navy, olive green" />
          </div>
        </div>

        <div className="flex gap-3 mt-6" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding…' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [stats, setStats] = useState(null);

  const loadItems = async (cat) => {
    setLoading(true);
    try {
      const { data } = await wardrobeAPI.getAll(cat === 'all' ? '' : cat);
      setItems(data);
    } catch { toast.error('Could not load wardrobe'); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const { data } = await wardrobeAPI.stats();
      setStats(data);
    } catch {}
  };

  useEffect(() => { loadItems(activeCategory); }, [activeCategory]);
  useEffect(() => { loadStats(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    try {
      await wardrobeAPI.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setStats(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
      toast.success('Item removed');
    } catch { toast.error('Could not remove'); }
  };

  const handleAdded = (item) => {
    setItems(prev => [item, ...prev]);
    setStats(prev => prev ? { ...prev, total: (prev.total || 0) + 1 } : prev);
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">My Wardrobe</h1>
            <p className="page-subtitle">{stats?.total || 0} items · Used by AI for personalised suggestions</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && Object.keys(stats.by_category).length > 0 && (
        <div style={{ padding: '12px 24px', display: 'flex', gap: 16, overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
          {Object.entries(stats.by_category).map(([cat, count]) => (
            <div key={cat} style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400 }}>{count}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="btn btn-sm"
            style={{
              borderRadius: 99, whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--ink)' : 'var(--surface-2)',
              color: activeCategory === cat ? 'var(--surface)' : 'var(--muted)',
              border: 'none',
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: 24 }}>
        {loading ? (
          <div className="wardrobe-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="wardrobe-item">
                <div className="skeleton" style={{ width: '100%', paddingTop: '100%' }} />
                <div style={{ padding: 10 }}>
                  <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: '45%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Shirt size={40} style={{ opacity: 0.3, margin: '0 auto' }} /></div>
            <h3>Your wardrobe is empty</h3>
            <p>Add your clothing items to get AI suggestions from your own closet</p>
            <button className="btn btn-primary mt-4" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add First Item
            </button>
          </div>
        ) : (
          <div className="wardrobe-grid">
            {items.map(item => (
              <div key={item.id} className="wardrobe-item">
                <div className="wardrobe-image">
                  {item.image_url ? (
                    <img src={`http://localhost:5000${item.image_url}`} alt={item.name} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>
                      {item.category === 'tops' ? '👕' : item.category === 'bottoms' ? '👖' : item.category === 'shoes' ? '👟' : item.category === 'outerwear' ? '🧥' : item.category === 'accessories' ? '💍' : '👗'}
                    </span>
                  )}
                </div>
                <div className="wardrobe-info">
                  <p className="wardrobe-name">{item.name}</p>
                  <p className="wardrobe-meta">
                    <span className="color-dot" style={{ background: getColorDot(item.color) }} />
                    {item.color} · {item.item_type}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 6,
                    padding: '4px 5px', cursor: 'pointer', opacity: 0, transition: '0.2s',
                    color: 'var(--muted)',
                  }}
                  className="delete-btn"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}

      <style>{`
        .wardrobe-item:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}