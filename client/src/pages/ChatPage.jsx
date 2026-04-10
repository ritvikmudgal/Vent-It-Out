import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';
import { AuthContext } from '../AuthContext';
import { apiFetch, getSocketUrl } from '../api';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Check if we navigated here via "Send a Private Chat" from profile
  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get('user');

  useEffect(() => {
    if (!user) return;
    const newSocket = io(getSocketUrl());
    setSocket(newSocket);
    
    newSocket.emit("register", user._id);

    newSocket.on("receive_message", (msg) => {
      // If the incoming message belongs to our currently active chat, add it
      setMessages(prev => {
        // Simple check to avoid appending if it's from a different user window
        // But for simplicity, we rely on activeUser state in the render cycle
        return [...prev, msg];
      });
    });

    return () => newSocket.close();
  }, [user]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await apiFetch(`/chat/conversations`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if(res.ok) {
          setConversations(data);
          // If we came from a profile, prioritize that user
          if (targetUserId) {
            const existing = data.find(c => c._id === targetUserId);
            if(existing) {
               setActiveUser(existing);
            } else {
               const profileRes = await apiFetch(`/auth/profileById/${targetUserId}`);
               setActiveUser({ _id: targetUserId, username: "New Chat..." });
            }
          } else if(data.length > 0) {
            setActiveUser(data[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchConversations();
  }, [user, targetUserId]);

  useEffect(() => {
    if (activeUser && user) {
      const fetchHistory = async () => {
        try {
          const res = await apiFetch(`/chat/${activeUser._id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          const data = await res.json();
          if(res.ok) setMessages(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchHistory();
    }
  }, [activeUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || !socket) return;
    
    // Optimistic append happens via socket 'receive_message' callback which returns it immediately
    socket.emit("send_message", {
      senderId: user._id,
      receiverId: activeUser._id,
      text: newMessage
    });
    setNewMessage('');
  };

  return (
    <div className="desk-background">
      <div className="container">
        <Navbar />
        
        <div style={{ display: 'flex', gap: '2rem', height: '70vh', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          
          {/* Sidebar */}
          <div style={{ width: '300px', borderRight: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.5)', overflowY: 'auto' }}>
            <h3 style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', fontFamily: 'var(--font-ui)', margin: 0 }}>Conversations</h3>
            {conversations.map(c => (
              <div 
                key={c._id} 
                onClick={() => setActiveUser(c)}
                style={{ 
                  padding: '1rem', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  backgroundColor: activeUser?._id === c._id ? 'rgba(0,0,0,0.05)' : 'transparent',
                  fontWeight: activeUser?._id === c._id ? 'bold' : 'normal'
                }}
              >
                {c.username}
              </div>
            ))}
            {conversations.length === 0 && !targetUserId && (
              <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No recent interactions.</p>
            )}
          </div>

          {/* Chat Window */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            {activeUser ? (
              <>
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>
                  Chatting with {activeUser.username}
                </div>
                
                <div style={{ flex: '1', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map(m => {
                    const isMine = m.sender === user._id;
                    return (
                      <div key={m._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                        <div style={{ 
                          padding: '0.8rem 1.2rem', 
                          borderRadius: '1rem', 
                          backgroundColor: isMine ? '#5227FF' : '#EAEAEA',
                          color: isMine ? '#FFF' : '#333',
                          fontFamily: 'var(--font-ui)',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                          {m.text}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: isMine ? 'right' : 'left' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)', display: 'flex', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="form-input"
                    style={{ flex: '1', margin: 0 }}
                  />
                  <button type="submit" className="btn btn-primary">Send</button>
                </form>
              </>
            ) : (
              <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Select a conversation to start chatting.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
