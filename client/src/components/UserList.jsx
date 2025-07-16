import React from 'react';

function UserList({ users, currentUser }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#fff', marginBottom: 16 }}>
      <h4>Online Users</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {users.map((user) => (
          <li key={user.id} style={{ fontWeight: user.username === currentUser ? 'bold' : 'normal', color: user.username === currentUser ? '#1976d2' : '#333' }}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList; 