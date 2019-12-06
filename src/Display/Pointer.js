import React from 'react';

function Pointer(props) {
  const {
    color, x, y, id,
  } = props;
  return (
    <div
      className="pointer"
      id={id}
      style={{
        backgroundColor: color,
        left: `${x}px`,
        top: `${y}px`,
      }}
    />
  );
}

export default Pointer;
