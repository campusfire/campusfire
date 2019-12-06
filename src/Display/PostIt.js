import React from 'react';

function PostIt(props) {
  const {
    key, id, text, x, y,
  } = props;
  return (
    <div
      className="postit"
      id={id}
      key={key}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {text}
    </div>
  );
}

export default PostIt;
