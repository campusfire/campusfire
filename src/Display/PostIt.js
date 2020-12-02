import React from 'react';

function PostIt(props) {
  const {
    key, id, text, x, y, z, lifetime
  } = props;
  const textLength = text.length;
  let fontSize = '25pt';
  if (textLength > 16 && textLength <= 20) {
    fontSize = '20pt';
  } else if (textLength > 20 && textLength <= 58) {
    fontSize = '15pt';
  } else if (textLength > 58 && textLength <= 78) {
    fontSize = '10pt';
  } else if (textLength > 78) {
    fontSize = '6pt';
  }
  return (
    <div
      className="postit"
      id={id}
      key={key}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: z,
        fontSize,
      }}
    >
      {text}
    </div>
  );
}

export default PostIt;
