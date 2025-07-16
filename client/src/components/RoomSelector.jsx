import React, { useState } from 'react';

function RoomSelector({ rooms, currentRoom, onSelectRoom, onCreateRoom }) {
  const [newRoom, setNewRoom] = useState('');

  const handleCreate = () => {
    if (newRoom.trim() && !rooms.includes(newRoom.trim())) {
      onCreateRoom(newRoom.trim());
      setNewRoom('');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label>
        Room:
        <select value={currentRoom} onChange={e => onSelectRoom(e.target.value)} style={{ marginLeft: 8, padding: 4 }}>
          {rooms.map(room => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>
      </label>
      <input
        type="text"
        placeholder="New room name"
        value={newRoom}
        onChange={e => setNewRoom(e.target.value)}
        style={{ marginLeft: 8, padding: 4 }}
      />
      <button onClick={handleCreate} style={{ marginLeft: 4, padding: '4px 8px' }}>Create</button>
    </div>
  );
}

export default RoomSelector; 