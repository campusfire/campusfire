import React from 'react';

function Video(props) {
  const {
    key, id, src, x, y, z,
  } = props;
  return (
    <video
      autoPlay
      loop
      className="postit-img"
      id={id}
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

export default Video;
