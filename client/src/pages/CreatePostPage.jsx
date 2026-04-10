import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../AuthContext';
import { apiFetch } from '../api';
import ClickSpark from '../components/ClickSpark';
import { useNavigate } from 'react-router-dom';

const CreatePostPage = () => {
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [shareLink, setShareLink] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a post.");
      return;
    }

    try {
      const res = await apiFetch(`/posts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ toName, message, isAnonymous, isPublic })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (!isPublic && data.shareId) {
          setShareLink(`http://${window.location.hostname}:5173/share/${data.shareId}`);
        } else {
          navigate('/home');
        }
      } else {
        alert(data.message || "Failed to create post");
      }
    } catch (err) {
      console.log(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="container">
      <Navbar />

      <div style={{ maxWidth: '600px', margin: '2rem auto' }} className="postcard">
        <h2 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Write a Letter</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">To (Name or Description)</label>
            <input 
              className="form-input" 
              placeholder="e.g. My first love, The guy on the train..." 
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea 
              className="form-input" 
              placeholder="What do you want to say?" 
              style={{ minHeight: '150px', resize: 'vertical' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2rem 0', fontFamily: 'var(--font-ui)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)} 
              />
              Send Anonymously
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={!isPublic} 
                onChange={(e) => setIsPublic(!e.target.checked)} 
              />
              Make Private (Link Only)
            </label>
          </div>

          {shareLink && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.05)', marginBottom: '1rem', wordBreak: 'break-all' }}>
              <strong>Private Link:</strong> <br/>
              <a href={shareLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>{shareLink}</a>
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <ClickSpark>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                Seal & Send
              </button>
            </ClickSpark>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
