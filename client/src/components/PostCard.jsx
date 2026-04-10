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
    if (!user) return;
    if (likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    const alreadyLiked = post.likes?.some(id => id === user._id || id?.toString() === user._id);
    const newLikes = alreadyLiked
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
      } else {
        // Revert on failure
        setPost(p => ({ ...p, likes: post.likes }));
      }
    } catch (err) {
      setPost(p => ({ ...p, likes: post.likes }));
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this letter?')) return;
    try {
      const res = await apiFetch(`/posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok && onDelete) onDelete(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  const isAuthor =
    user &&
    (post.userId?._id === user._id ||
      post.userId === user._id ||
      (post.userId && post.userId.username === user.username));

  const likeCount = post.likes?.length || 0;

  const dateStr = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  // ── Shared footer actions used in both modes ──
  const FooterActions = ({ stopProp = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Like button */}
      <button
        onClick={handleLike}
        style={{
          background: hasLiked ? 'rgba(214,69,80,0.12)' : 'transparent',
          border: `1px solid ${hasLiked ? '#d64550' : 'rgba(120,90,60,0.25)'}`,
          borderRadius: '20px',
          padding: '0.25rem 0.75rem',
          cursor: user ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: hasLiked ? '#d64550' : '#7a6650',
          transition: 'all 0.2s ease',
          transform: likeLoading ? 'scale(0.93)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '0.9rem', transition: 'transform 0.15s', transform: hasLiked ? 'scale(1.2)' : 'scale(1)' }}>
          {hasLiked ? '❤️' : '🤍'}
        </span>
        {likeCount}
      </button>

      {isAuthor && (
        <button
          onClick={handleDelete}
          style={{
            background: 'transparent',
            border: '1px solid rgba(214,69,80,0.3)',
            borderRadius: '20px',
            padding: '0.25rem 0.75rem',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#d64550',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#d64550'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d64550'; }}
        >
          Delete
        </button>
      )}
    </div>
  );

  // ───────── ENVELOPE MODE (Profile page — click to open) ─────────
  if (envelopeMode) {
    return (
      <div
        style={{ position: 'relative', cursor: 'pointer', marginBottom: '1rem' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setEnvelopeOpen(!envelopeOpen)}
      >
        {/* Envelope shell */}
        <div style={{
          background: 'linear-gradient(135deg, #f5ead8, #e8d5b7)',
          border: `1px solid ${hovered ? '#b8956a' : '#c9b08a'}`,
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: hovered ? '0 10px 32px rgba(0,0,0,0.2)' : '0 6px 20px rgba(0,0,0,0.12)',
          minHeight: '160px',
          position: 'relative',
          transition: 'all 0.25s ease',
        }}>
          {/* Airmail stripe */}
          <div style={{
            height: '7px',
            background: 'repeating-linear-gradient(90deg,#d64550 0,#d64550 14px,transparent 14px,transparent 22px,#3a6d8c 22px,#3a6d8c 36px,transparent 36px,transparent 44px)',
            backgroundColor: '#f5ead8',
          }} />

          {/* V-fold crease */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.035) 0%, transparent 100%)',
            clipPath: 'polygon(0% 100%, 50% 28%, 100% 100%)',
          }} />

          {/* Wax seal */}
          <div style={{
            position: 'absolute', bottom: '18px', right: '22px',
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #ef5350, #7b0000)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 5,
          }}>
            <span style={{ fontFamily: 'Georgia, serif', color: '#ffcdd2', fontSize: '1rem', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>V</span>
          </div>

          {/* Address area */}
          <div style={{ padding: '1.4rem 2rem 3rem' }}>
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: '1.5rem', color: '#4a3728', marginBottom: '0.3rem', fontWeight: 600 }}>
              ✉️ To: {post.toName}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#9a8670', letterSpacing: '0.03em' }}>
              {dateStr}  ·  {envelopeOpen ? 'Click to close' : 'Click to open'}
            </p>
          </div>
        </div>

        {/* Letter content (slides in below when open) */}
        {envelopeOpen && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fffbf2',
              border: '1px solid #ddd3bb',
              borderRadius: '0 0 10px 10px',
              padding: '2rem 2rem 1.5rem',
              boxShadow: '0 14px 40px rgba(0,0,0,0.18)',
              borderTop: '3px solid #d4a96a',
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(180,140,80,0.15) 28px)',
              lineHeight: '28px',
              animation: 'slideDown 0.3s ease',
            }}
          >
            <p style={{
              fontFamily: 'Caveat, cursive',
              fontSize: '1.7rem',
              color: '#2a1f14',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.55',
            }}>
              {post.message}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px dashed #ddd3bb',
              paddingTop: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#7a6650', fontStyle: 'italic' }}>
                — {post.isAnonymous ? 'Anonymous' : (
                  <Link
                    to={`/user/${post.userId?.username}`}
                    onClick={e => e.stopPropagation()}
                    style={{ color: '#8b4513', textDecoration: 'underline', fontStyle: 'normal', fontWeight: 600 }}
                  >
                    {post.userId?.username || 'Unknown'}
                  </Link>
                )}
              </span>
              <FooterActions />
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ───────── PLAIN LETTER CARD (HomePage) ─────────
  return (
    <div
      className="letter-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ '--hover-lift': hovered ? '-5px' : '0px' }}
    >
      <div className="letter-stripe" />

      <div className="letter-card-inner">
        {/* Header */}
        <div className="letter-header">
          <span className="letter-to">✉️ <strong>{post.toName}</strong></span>
          <span className="letter-date">{dateStr}</span>
        </div>

        {/* Body */}
        <p className="letter-body">{post.message}</p>

        {/* Footer */}
        <div className="letter-footer">
          <span className="letter-author">
            {post.isAnonymous ? '— Anonymous' : (
              <>— <Link to={`/user/${post.userId?.username}`} className="letter-author-link">
                {post.userId?.username || 'Unknown'}
              </Link></>
            )}
          </span>
          <FooterActions />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
