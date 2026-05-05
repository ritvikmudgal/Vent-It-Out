import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';
import { AuthContext } from '../AuthContext';
import { apiFetch, getSocketUrl } from '../api';
import { getAvatar } from '../avatarPack';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [tab, setTab] = useState('dms'); // 'dms' | 'groups'

  // DM state
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [typing, setTyping] = useState(false);

  // Group state
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSearchQ, setGroupSearchQ] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupTyping, setGroupTyping] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get('user');

  // Socket setup
  useEffect(() => {
    if (!user) return;
    const s = io(getSocketUrl());
    setSocket(s);
    s.emit('register', user._id);

    s.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    s.on('user_typing', () => setTyping(true));
    s.on('user_stop_typing', () => setTyping(false));

    s.on('receive_group_message', (msg) => {
      setGroupMessages(prev => [...prev, msg]);
    });
    s.on('group_user_typing', ({ username }) => setGroupTyping(username));
    s.on('group_user_stop_typing', () => setGroupTyping(null));

    return () => s.close();
  }, [user]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await apiFetch('/chat/conversations', { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        if (res.ok) {
          setConversations(data);
          if (targetUserId) {
            const existing = data.find(c => c._id === targetUserId);
            if (existing) setActiveUser(existing);
            else setActiveUser({ _id: targetUserId, username: 'New Chat' });
          } else if (data.length > 0) setActiveUser(data[0]);
        }
      } catch (err) { console.error(err); }
    };
    fetch();
  }, [user, targetUserId]);

  // Fetch groups
  useEffect(() => {
    if (!user) return;
    apiFetch('/chat/groups', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setGroups(d); });
  }, [user]);

  // Fetch DM history
  useEffect(() => {
    if (!activeUser || !user) return;
    apiFetch(`/chat/dm/${activeUser._id}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setMessages(d); });
  }, [activeUser, user]);

  // Fetch group messages
  useEffect(() => {
    if (!activeGroup || !user) return;
    socket?.emit('join_group', activeGroup._id);
    apiFetch(`/chat/groups/${activeGroup._id}/messages`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setGroupMessages(d); });
  }, [activeGroup, user]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, groupMessages]);

  // User search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await apiFetch(`/chat/search-users?q=${searchQuery}`, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        if (Array.isArray(data)) setSearchResults(data);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Group member search
  useEffect(() => {
    if (!groupSearchQ.trim()) { setGroupSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await apiFetch(`/chat/search-users?q=${groupSearchQ}`, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        if (Array.isArray(data)) setGroupSearchResults(data.filter(u => !selectedMembers.some(m => m._id === u._id)));
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(t);
  }, [groupSearchQ, selectedMembers]);

  const sendDM = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || !socket) return;
    socket.emit('send_message', { senderId: user._id, receiverId: activeUser._id, text: newMessage });
    socket.emit('stop_typing', { senderId: user._id, receiverId: activeUser._id });
    setNewMessage('');
  };

  const sendGroupMsg = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup || !socket) return;
    socket.emit('send_group_message', { groupId: activeGroup._id, senderId: user._id, text: newMessage });
    socket.emit('group_stop_typing', { groupId: activeGroup._id, senderId: user._id });
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    if (tab === 'dms' && activeUser) {
      socket.emit('typing', { senderId: user._id, receiverId: activeUser._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { senderId: user._id, receiverId: activeUser._id });
      }, 1500);
    } else if (tab === 'groups' && activeGroup) {
      socket.emit('group_typing', { groupId: activeGroup._id, senderId: user._id, username: user.username });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('group_stop_typing', { groupId: activeGroup._id, senderId: user._id });
      }, 1500);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    try {
      const res = await apiFetch('/chat/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ name: groupName, memberIds: selectedMembers.map(m => m._id) }),
      });
      if (res.ok) {
        const g = await res.json();
        setGroups(prev => [g, ...prev]);
        setActiveGroup(g);
        setTab('groups');
        setShowCreateGroup(false);
        setGroupName('');
        setSelectedMembers([]);
      }
    } catch (err) { console.error(err); }
  };

  const currentMessages = tab === 'dms' ? messages : groupMessages;
  const activeName = tab === 'dms' ? activeUser?.username : activeGroup?.name;

  return (
    <div className="desk-background">
      <div className="container">
        <Navbar />

        <div className="chat-container">
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <button className={`auth-tab ${tab === 'dms' ? 'active' : ''}`} onClick={() => setTab('dms')} style={{ flex: 1, padding: '0.4rem' }}>💬 DMs</button>
              <button className={`auth-tab ${tab === 'groups' ? 'active' : ''}`} onClick={() => setTab('groups')} style={{ flex: 1, padding: '0.4rem' }}>👥 Groups</button>
            </div>

            {/* Search bar */}
            <div style={{ padding: '0.6rem 0.8rem' }}>
              <input className="form-input" placeholder={tab === 'dms' ? 'Search users...' : 'Search groups...'} value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ marginBottom: 0, padding: '0.5rem 0.8rem', fontSize: '0.85rem', borderRadius: 20 }}
              />
            </div>

            {/* Search results */}
            {searchQuery && tab === 'dms' && searchResults.length > 0 && (
              <div style={{ borderBottom: '2px solid var(--pink-light)', maxHeight: 150, overflowY: 'auto' }}>
                {searchResults.map(u => (
                  <div key={u._id} className="chat-user-item" onClick={() => { setActiveUser(u); setSearchQuery(''); setSearchResults([]); }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                      {getAvatar(u.avatarId).emoji}
                    </div>
                    {u.username}
                  </div>
                ))}
              </div>
            )}

            {/* Conversations / Groups list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {tab === 'dms' ? (
                conversations.length === 0 && !targetUserId ? (
                  <p style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No chats yet. Search a user above!</p>
                ) : conversations.map(c => (
                  <div key={c._id} className={`chat-user-item ${activeUser?._id === c._id ? 'active' : ''}`} onClick={() => setActiveUser(c)}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${getAvatar(c.avatarId).color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', border: `2px solid ${getAvatar(c.avatarId).color}40` }}>
                      {c.profilePicture ? <img src={c.profilePicture} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getAvatar(c.avatarId).emoji}
                    </div>
                    {c.username}
                  </div>
                ))
              ) : (
                <>
                  <div style={{ padding: '0.6rem 0.8rem' }}>
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }} onClick={() => setShowCreateGroup(true)}>
                      + New Group
                    </button>
                  </div>
                  {groups.map(g => (
                    <div key={g._id} className={`chat-user-item ${activeGroup?._id === g._id ? 'active' : ''}`} onClick={() => setActiveGroup(g)}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>👥</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{g.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.members?.length || 0} members</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Chat main */}
          <div className="chat-main">
            {(tab === 'dms' ? activeUser : activeGroup) ? (
              <>
                <div className="chat-header">
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    {tab === 'dms' ? getAvatar(activeUser?.avatarId).emoji : '👥'}
                  </div>
                  <span>{activeName}</span>
                </div>

                <div className="chat-messages">
                  {currentMessages.map((m, i) => {
                    const mine = (m.sender === user._id || m.sender?._id === user._id);
                    return (
                      <div key={m._id || i} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                        {tab === 'groups' && !mine && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 700, marginBottom: 2 }}>
                            {m.sender?.username || ''}
                          </div>
                        )}
                        <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>{m.text}</div>
                        <div className="chat-time" style={{ textAlign: mine ? 'right' : 'left' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="typing-indicator">
                  {tab === 'dms' && typing && `${activeUser?.username} is typing...`}
                  {tab === 'groups' && groupTyping && `${groupTyping} is typing...`}
                </div>

                <form onSubmit={tab === 'dms' ? sendDM : sendGroupMsg} className="chat-input-bar">
                  <input type="text" value={newMessage} onChange={handleTyping} placeholder="Type a message..."
                    className="form-input" style={{ flex: 1, margin: 0, borderRadius: 50, padding: '0.6rem 1rem' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: 50, padding: '0.5rem 1.2rem' }}>Send</button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '3rem' }}>💌</span>
                <span>Select a chat or search for someone!</span>
              </div>
            )}
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '1rem' }}>Create Group 👥</h3>
              <input className="form-input" placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} />

              {/* Search members */}
              <input className="form-input" placeholder="Search users to add..." value={groupSearchQ} onChange={e => setGroupSearchQ(e.target.value)} />

              {groupSearchResults.map(u => (
                <div key={u._id} className="chat-user-item" onClick={() => { setSelectedMembers(prev => [...prev, u]); setGroupSearchQ(''); }}>
                  <span>{getAvatar(u.avatarId).emoji}</span> {u.username}
                  <span style={{ marginLeft: 'auto', color: 'var(--primary-color)', fontWeight: 700 }}>+ Add</span>
                </div>
              ))}

              {selectedMembers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.8rem 0' }}>
                  {selectedMembers.map(m => (
                    <span key={m._id} style={{ background: 'var(--pink-light)', borderRadius: 20, padding: '0.2rem 0.7rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {m.username}
                      <span style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent-color)' }} onClick={() => setSelectedMembers(prev => prev.filter(x => x._id !== m._id))}>×</span>
                    </span>
                  ))}
                </div>
              )}

              <button className="btn btn-primary" onClick={createGroup} style={{ width: '100%', marginTop: '0.5rem' }}>
                Create Group ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
