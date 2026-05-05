import React, { useState, useRef } from 'react';
import AVATAR_PACK, { getAvatar } from '../avatarPack';

const AvatarPicker = ({ currentAvatarId, currentPfp, onSelect, onClose }) => {
  const [selected, setSelected] = useState(currentAvatarId || 'classic');
  const [previewId, setPreviewId] = useState(null);
  const fileInputRef = useRef(null);

  const handleSelect = (id) => {
    setSelected(id);
    onSelect({ avatarId: id, profilePicture: null });
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSelect({ avatarId: 'custom', profilePicture: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const previewAvatar = previewId ? getAvatar(previewId) : null;

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
          Choose Your Avatar 💌
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Pick a unique postman character or upload your own!
        </p>

        {/* Full-body preview on hover */}
        {previewAvatar && (
          <div style={{
            textAlign: 'center', padding: '1rem', marginBottom: '0.5rem',
            background: `linear-gradient(135deg, ${previewAvatar.color}15, ${previewAvatar.color}25)`,
            borderRadius: '16px', animation: 'scaleIn 0.2s ease',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{previewAvatar.emoji}</div>
            <p style={{ fontWeight: 700, color: previewAvatar.color, fontSize: '1rem' }}>{previewAvatar.label}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>VentItOut Postman Edition</p>
          </div>
        )}

        {/* Avatar Grid */}
        <div className="avatar-grid">
          {AVATAR_PACK.map(av => (
            <div
              key={av.id}
              className={`avatar-option ${selected === av.id ? 'selected' : ''}`}
              onClick={() => handleSelect(av.id)}
              onMouseEnter={() => setPreviewId(av.id)}
              onMouseLeave={() => setPreviewId(null)}
              style={{
                background: `linear-gradient(135deg, ${av.color}20, ${av.color}35)`,
                border: selected === av.id ? `3px solid ${av.color}` : '3px solid transparent',
              }}
              title={av.label}
            >
              {av.emoji}
            </div>
          ))}
        </div>

        {/* Upload custom */}
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <button
            className="btn"
            onClick={() => fileInputRef.current.click()}
            style={{ fontSize: '0.85rem', borderColor: 'var(--secondary-color)', color: 'var(--primary-color)' }}
          >
            📷 Upload from Gallery
          </button>
        </div>

        {/* Close */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '0.5rem 2rem' }}>
            Done ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;
