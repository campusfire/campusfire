import React from 'react';

function Pointer(props) {
  const {
    color, x, y, id, posting, pressing,
  } = props;
  return (
    <div>
      <div
        className={`pointer${pressing ? ' pressing' : ''}`}
        id={id}
        style={{
          backgroundColor: color,
          left: `${x - 8}px`,
          top: `${y - 8}px`,
        }}
      />
      <div
        className="pulse"
        style={{
          display: `${posting ? 'block' : 'none'}`,
          border: `10px solid ${color}`,
          left: `${x - 8}px`,
          top: `${y - 8}px`,
        }}
      />
    </div>
  );
}

export default Pointer;
