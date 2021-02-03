import React from 'react';

function Embeded(props) {
  const {
    key, id, postId, x, y, z,
  } = props;
  return (
    <div 
      className="embeded" 
      id={id}
      key={key}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: z,
    }}>
      <iframe className="embededIframe" src={`https://www.instagram.com/p/${postId}/embed`} width="320" height="320" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
    </div>

  );
}

export default Embeded;