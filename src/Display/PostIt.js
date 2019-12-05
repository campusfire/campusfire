import React from 'react';

function PostIt(props) {
  const { key, id, text, x, y } = props;
  return (
    <div className="postit" id={id} key={key}
         style={{
        position: 'absolute',
        left: `${x}`,
        top: `${y}`,
    }}>
      {text}
    </div>
  );
}

export default PostIt;
