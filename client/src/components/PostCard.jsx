import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { apiFetch } from '../api';

const PostCard = ({ post: initialPost, onDelete, envelopeMode = false }) => {
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(initialPost);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const hasLiked = user && post.likes?.some(id => id === user._id || id?.toString() === user._id);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user || likeLoading) return;
    setLikeLoading(true);

    const wasLiked = hasLiked;
    const newLikes = wasLiked
      ? post.likes.filter(id => id !== user._id && id?.toString() !== user._id)
      : [...(post.likes || []), user._id];
    setPost(p => ({ ...p, likes: newLikes }));

    try {
      const res = await apiFetch(`/posts/like/${post._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setPost(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this letter?')) return;
    try {
      const res = await apiFetch(`/posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok && onDelete) onDelete(post._id);
    } catch (err) { console.error(err); }
  };

  const isAuthor = user && (post.userId?._id === user._id || post.userId === user._id || post.userId?.username === user.username);
  const likeCount = post.likes?.length || 0;
  const dateStr = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const LikeBtn = () => (
    <button onClick={handleLike} style={{
      background: hasLiked ? 'rgba(232,115,154,0.12)' : 'transparent',
      border: `1.5px solid ${hasLiked ? '#E8739A' : 'rgba(232,115,154,0.3)'}`,
      borderRadius: 20, padding: '0.2rem 0.65rem', cursor: user ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', gap: '0.3rem',
      fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700,
      color: hasLiked ? '#E8739A' : 'var(--text-muted)',
      transition: 'all 0.2s ease',
    }}>
      <span style={{ fontSize: '0.85rem', transition: 'transform 0.15s', transform: hasLiked ? 'scale(1.2)' : 'scale(1)' }}>
        {hasLiked ? '💗' : '🤍'}
      </span>
      {likeCount}
    </button>
  );

  // ── Envelope mode (profile) ──
  if (envelopeMode) {
    return (
      <div style={{ position: 'relative', cursor: 'pointer', marginBottom: '1rem' }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onClick={() => setEnvelopeOpen(!envelopeOpen)}
      >
        <div style={{
          background: 'linear-gradient(135deg, #FFF0F5, #FFE4EE)',
          border: `2px solid ${hovered ? '#E8739A' : 'rgba(255,181,211,0.4)'}`,
          borderRadius: 16, overflow: 'hidden', minHeight: 140,
          boxShadow: hovered ? '0 10px 32px rgba(232,115,154,0.2)' : '0 4px 16px rgba(232,115,154,0.1)',
          transition: 'all 0.3s ease', position: 'relative',
        }}>
          <div style={{ height: 5, background: 'linear-gradient(90deg, #FFB5D3, #E8739A, #FF6B9D, #FFB5D3)', backgroundSize: '200%', animation: 'stripeShimmer 4s ease infinite' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(232,115,154,0.04), transparent)', clipPath: 'polygon(0% 100%, 50% 28%, 100% 100%)' }} />
          <div style={{ position: 'absolute', bottom: 16, right: 20, width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B9D, #E8739A)', boxShadow: '0 4px 12px rgba(232,115,154,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>💌</span>
          </div>
          <div style={{ padding: '1.2rem 1.5rem 2.5rem' }}>
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.4rem', color: '#3D2B35', fontWeight: 600 }}>To: {post.toName}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateStr} · {envelopeOpen ? 'Tap to close' : 'Tap to read'}</p>
          </div>
        </div>

        {envelopeOpen && (
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFBFD', border: '2px solid rgba(255,181,211,0.3)',
            borderRadius: '0 0 16px 16px', padding: '1.5rem',
            boxShadow: '0 12px 36px rgba(232,115,154,0.15)',
            borderTop: '3px solid #E8739A', animation: 'slideDown 0.3s ease',
          }}>
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.6rem', color: '#3D2B35', marginBottom: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{post.message}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(232,115,154,0.2)', paddingTop: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                — {post.isAnonymous ? 'Anonymous' : (
                  <Link to={`/user/${post.userId?.username}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none' }}>
                    {post.userId?.username || 'Unknown'}
                  </Link>
                )}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {isAuthor && <button onClick={handleDelete} className="delete-btn">Delete</button>}
                <LikeBtn />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Plain letter card (home) ──
  return (
    <div className="letter-card"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ '--hover-lift': hovered ? '-5px' : '0px' }}
    >
      <div className="letter-stripe" />
      <div className="letter-card-inner">
        <div className="letter-header">
          <span className="letter-to">💌 <strong>{post.toName}</strong></span>
          <span className="letter-date">{dateStr}</span>
        </div>
        <p className="letter-body">{post.message}</p>
        <div className="letter-footer">
          <span className="letter-author">
            {post.isAnonymous ? '— Anonymous' : (
              <>— <Link to={`/user/${post.userId?.username}`} className="letter-author-link">{post.userId?.username || 'Unknown'}</Link></>
            )}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isAuthor && <button onClick={handleDelete} className="delete-btn">Delete</button>}
            <LikeBtn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
