import React, { useState, useEffect } from 'react';
import { useSocket } from './socket/socket';
import ChatRoom from './components/ChatRoom';
import UserList from './components/UserList';
import RoomSelector from './components/RoomSelector';
import SearchBar from './components/SearchBar';

const DEFAULT_ROOMS = ['General', 'Random'];

function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState(DEFAULT_ROOMS[0]);
  const [rooms, setRooms] = useState([...DEFAULT_ROOMS]);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    connect,
    disconnect,
    isConnected,
    messages,
    users,
    typingUsers,
    sendMessage,
    setTyping,
    joinRoom,
  } = useSocket();

  // Filter messages by room
  const roomMessages = messages.filter(m => (m.room || DEFAULT_ROOMS[0]) === room);

  // Join logic
  const handleJoin = () => {
    if (username.trim()) {
      connect(username);
      setJoined(true);
      // Request notification permission
      if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  };

  // Room selection
  const handleSelectRoom = (selectedRoom) => {
    setRoom(selectedRoom);
    setSearchTerm('');
    joinRoom(selectedRoom);
  };

  // Room creation
  const handleCreateRoom = (newRoom) => {
    if (!rooms.includes(newRoom)) {
      setRooms([...rooms, newRoom]);
      setRoom(newRoom);
    }
  };

  // Send message with room info
  const handleSend = (msg) => {
    sendMessage({ message: msg, room });
  };

  // Typing handler
  const handleTyping = (isTyping) => {
    setTyping(isTyping);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Socket.io Chat</h1>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ padding: 8, width: '70%' }}
          />
          <button onClick={handleJoin} style={{ padding: 8, marginLeft: 8 }}>Join</button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16 }}>
            <span>Welcome, <b>{username}</b>!</span>
            <button onClick={disconnect} style={{ float: 'right' }}>Disconnect</button>
          </div>
          <RoomSelector
            rooms={rooms}
            currentRoom={room}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={handleCreateRoom}
          />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
              <ChatRoom
                messages={roomMessages}
                onSend={handleSend}
                username={username}
                typingUsers={typingUsers}
                onTyping={handleTyping}
                room={room}
                searchTerm={searchTerm}
              />
            </div>
            <div style={{ width: 180 }}>
              <UserList users={users} currentUser={username} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
