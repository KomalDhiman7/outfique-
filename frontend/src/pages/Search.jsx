import React, { useState, useCallback } from 'react';
import { SearchIcon, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import PostCard from '../components/posts/PostCard';

function useDebounce(fn, delay) {
  const timer = React.useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) { setResults({ users: [], posts: [] }); setSearched(false); return; }
    setLoading(true);
    try {
      const { data } = await searchAPI.search(q);
      setResults(data);
      setSearched(true);
    } catch {}
    finally { setLoading(false); }
  }, []);

  const debouncedSearch = useDebounce(doSearch, 400);

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const total = results.users.length + results.posts.length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">Find users and outfits</p>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div className="search-bar">
          <SearchIcon size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={handleChange}
            placeholder="Search users, outfits, tags…"
            autoFocus
          />
          {loading && <span className="text-xs text-muted">Searching…</span>}
        </div>
      </div>

      {searched && (
        <div style={{ padding: '0 24px 8px' }}>
          <p className="text-sm text-muted">{total} result{total !== 1 ? 's' : ''} for "{query}"</p>
        </div>
      )}

      {/* Users */}
      {results.users.length > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <p className="form-label" style={{ marginBottom: 12 }}>People</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.users.map(u => (
              <Link key={u.id} to={`/profile/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--white)', borderRadius: 10, border: '1px solid var(--border)', transition: 'box-shadow 0.2s' }}>
                <div className="avatar" style={{ width: 40, height: 40 }}>{u.username?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="font-medium text-sm">{u.username}</p>
                  {u.bio && <p className="text-xs text-muted">{u.bio}</p>}
                </div>
                {u.is_premium && <span className="premium-badge" style={{ marginLeft: 'auto' }}>✦ PRO</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {results.posts.length > 0 && (
        <div>
          <p className="form-label" style={{ padding: '0 24px', marginBottom: 12 }}>Outfits</p>
          <div className="feed-grid">
            {results.posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {searched && total === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No results</h3>
          <p>Try a different search — usernames, captions, or tags</p>
        </div>
      )}

      {!searched && (
        <div className="empty-state" style={{ paddingTop: 40 }}>
          <div className="empty-state-icon" style={{ fontSize: '2rem' }}>✨</div>
          <p>Search for people or outfit styles</p>
        </div>
      )}
    </div>
  );
}