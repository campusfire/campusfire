import React from 'react';

function PostIt(props) {
  const { text } = props;
  return (
    <div className="postit">
      {text}
    </div>
  );
}

export default PostIt;
