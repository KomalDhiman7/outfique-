import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, RefreshCw, Star, Thermometer } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OUTFIT_ICONS = { top: '👕', bottom: '👖', shoes: '👟', outerwear: '🧥', colors: '🎨', reason: '✨' };

export default function AIStylist() {
  const { user } = useAuth();
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [weather, setWeather] = useState(null);
  const [wardrobeCount, setWardrobeCount] = useState(0);

  useEffect(() => {
    aiAPI.getMoods().then(({ data }) => setMoods(data)).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedMood) { toast.error('Pick a mood first!'); return; }
    setLoading(true);
    setSuggestion(null);
    try {
      const { data } = await aiAPI.suggest({ mood: selectedMood, city });
      setSuggestion(data.suggestion);
      setWeather(data.weather);
      setWardrobeCount(data.wardrobe_count);
      toast.success('Outfit ready! ✨');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not generate suggestion');
    } finally {
      setLoading(false);
    }
  };

  const outfitRows = suggestion ? [
    { key: 'top', label: 'Top', value: suggestion.top },
    { key: 'bottom', label: 'Bottom', value: suggestion.bottom },
    { key: 'shoes', label: 'Shoes', value: suggestion.shoes },
    suggestion.outerwear && { key: 'outerwear', label: 'Outerwear', value: suggestion.outerwear },
    { key: 'colors', label: 'Color palette', value: suggestion.colors },
  ].filter(Boolean) : [];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={24} style={{ color: 'var(--gold)' }} />
            AI Stylist
          </h1>
          {user?.is_premium && <span className="premium-badge">✦ PRO</span>}
        </div>
        <p className="page-subtitle">Get a personalised outfit based on your mood &amp; weather</p>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>

        {/* Mood selector */}
        <section style={{ marginBottom: 28 }}>
          <label className="form-label" style={{ display: 'block', marginBottom: 12 }}>
            What's the vibe today?
          </label>
          <div className="mood-grid">
            {moods.map(m => (
              <button
                key={m.id}
                className={`mood-card ${selectedMood === m.id ? 'selected' : ''}`}
                onClick={() => setSelectedMood(m.id)}
              >
                <div className="mood-emoji">{m.emoji}</div>
                <div className="mood-label">{m.label}</div>
                <div className="mood-desc">{m.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Location */}
        <section style={{ marginBottom: 28 }}>
          <div className="form-group">
            <label className="form-label">Location (optional — for live weather)</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. London, Mumbai, New York…"
              />
            </div>
          </div>
        </section>

        {/* Wardrobe hint */}
        {wardrobeCount === 0 && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--muted)', borderLeft: '2px solid var(--gold)' }}>
            💡 Add items to your <strong>Wardrobe</strong> to get personalised suggestions from your own clothes.
          </div>
        )}

        {/* Generate button */}
        <button
          className="btn btn-gold btn-lg w-full"
          onClick={handleGenerate}
          disabled={loading || !selectedMood}
          style={{ justifyContent: 'center', marginBottom: 28 }}
        >
          {loading ? (
            <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Styling you up…</>
          ) : (
            <><Sparkles size={16} /> Generate Outfit</>
          )}
        </button>

        {/* Weather widget */}
        {weather && weather.city && (
          <div className="weather-widget" style={{ marginBottom: 20 }}>
            <Thermometer size={16} style={{ color: 'var(--gold)' }} />
            <span className="font-medium">{weather.city}</span>
            <span className="text-muted">·</span>
            <span>{weather.temperature}°C</span>
            <span className="text-muted">{weather.description}</span>
            <span style={{
              marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 500,
              color: 'var(--gold)', background: 'var(--gold-pale)',
              padding: '2px 8px', borderRadius: 99
            }}>{weather.feel_category}</span>
          </div>
        )}

        {/* Suggestion output */}
        {suggestion && (
          <div className="suggestion-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>
                Your Outfit
              </h2>
              {wardrobeCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  ({wardrobeCount} wardrobe item{wardrobeCount !== 1 ? 's' : ''} considered)
                </span>
              )}
            </div>

            {outfitRows.map(row => (
              <div key={row.key} className="outfit-item">
                <div className="outfit-icon">{OUTFIT_ICONS[row.key]}</div>
                <div>
                  <p className="outfit-label">{row.label}</p>
                  <p className="outfit-value">{row.value}</p>

                  {/* Inline color palette if this is the colors row */}
                  {row.key === 'colors' && suggestion.color_palette?.length > 0 && (
                    <div className="color-palette">
                      {suggestion.color_palette.map((hex, i) => (
                        <div key={i} className="palette-swatch" style={{ background: hex }} title={hex} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Why this outfit */}
            {suggestion.reason && (
              <div style={{ marginTop: 20, padding: '16px', background: 'var(--surface)', borderRadius: 10, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--ink-3)' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Why this works</p>
                {suggestion.reason}
              </div>
            )}

            {/* Premium style tips */}
            {user?.is_premium && suggestion.style_tips?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
                  <Star size={11} style={{ display: 'inline', marginRight: 4, color: 'var(--gold)' }} />
                  Pro Styling Tips
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {suggestion.style_tips.map((tip, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', paddingLeft: 16, position: 'relative', color: 'var(--ink-3)' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--gold)' }}>·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Occasion fit score (premium) */}
            {user?.is_premium && suggestion.occasion_fit && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={14} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Occasion fit:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gold)' }}>{suggestion.occasion_fit}/10</span>
              </div>
            )}

            {/* Upgrade prompt */}
            {!user?.is_premium && (
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--gold-pale)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>✦ Unlock Pro Styling</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>Style tips, hex palettes &amp; occasion scoring</p>
                </div>
                <button className="btn btn-gold btn-sm">Upgrade</button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
