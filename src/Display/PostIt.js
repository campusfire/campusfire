import React from 'react';

function PostIt(props) {
  const { key, id, text } = props;
  return (
    <div className="postit" id={id} key={key}>
      {text}
    </div>
  );
}

export default PostIt;
