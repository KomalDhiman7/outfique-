import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { postsAPI } from '../services/api';
import PostCard from '../components/posts/PostCard';

function SkeletonCard() {
  return (
    <div className="post-card" style={{ padding: 0 }}>
      <div style={{ padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 10, width: '25%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', paddingTop: '120%' }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 10, width: '50%' }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadPosts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      const { data } = await postsAPI.feed(pageNum);
      setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.has_next);
      setPage(pageNum);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(1, true); }, [loadPosts]);

  const loadMore = () => loadPosts(page + 1);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your Feed</h1>
        <p className="page-subtitle">Discover outfits from the community</p>
      </div>

      {initialLoading ? (
        <div className="feed-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👗</div>
          <h3>No posts yet</h3>
          <p>Be the first to share an outfit!</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="flex items-center justify-center" style={{ padding: 32 }}>
              <span className="text-muted text-sm">Loading more…</span>
            </div>
          }
          endMessage={
            <p className="text-muted text-sm" style={{ textAlign: 'center', padding: 24 }}>
              You've seen it all ✨
            </p>
          }
        >
          <div className="feed-grid">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}