import React from 'react';

function Pointer(props) {
  const { color, x, y } = props;
  return (
    <div
      className="pointer"
      style={{
        backgroundColor: color,
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
      }}
    />
  );
}

export default Pointer;
