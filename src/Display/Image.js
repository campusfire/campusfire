import React from 'react';

function Image(props) {
  const {
    key, id, src, x, y, z,
  } = props;
  return (
    <img
      className="postit-img"
      id={id}
      alt={src}
      key={key}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: z,
      }}
      src={`/uploads/${src}`}
    />
  );
}

export default Image;
