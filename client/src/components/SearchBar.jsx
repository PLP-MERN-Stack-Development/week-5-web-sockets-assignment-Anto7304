import React from 'react';

function SearchBar({ value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <input
        type="text"
        placeholder="Search messages..."
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      />
    </div>
  );
}

export default SearchBar; 