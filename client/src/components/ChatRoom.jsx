import React, { useState, useRef, useEffect } from 'react';

function ChatRoom({ messages, onSend, username, typingUsers, onTyping, room, searchTerm }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // Filter messages by search term
  const filteredMessages = searchTerm
    ? messages.filter(m => m.message && m.message.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleInput = (e) => {
    setInput(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input, room);
      setInput('');
      onTyping(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, background: '#fafafa', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
        {filteredMessages.map((msg) => (
          <div key={msg.id} style={{ margin: '8px 0', color: msg.system ? '#888' : msg.sender === username ? '#1976d2' : '#333' }}>
            {msg.system ? (
              <em>{msg.message}</em>
            ) : (
              <>
                <b>{msg.sender}</b> <span style={{ fontSize: 12, color: '#aaa' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <div>{msg.message}</div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ minHeight: 24, color: '#888', fontSize: 14 }}>
        {typingUsers.length > 0 && (
          <span>{typingUsers.filter(u => u !== username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
        )}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', marginTop: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInput}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: '8px 16px' }}>Send</button>
      </form>
    </div>
  );
}

export default ChatRoom; 