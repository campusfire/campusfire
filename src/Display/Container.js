import React from 'react';
import '../App.css';
import PostIt from './PostIt';

function Container(props) {
  const {
    id, x, y, content, contentType,
  } = props;
  switch (contentType) {
    case 'text':
      return (
        <PostIt id={id} text={content} x={x} y={y} />
      );
    case 'image':
      return (
        <PostIt text={content} x={x} y={y} />
      );

    case 'video':
      return (
        <PostIt text={content} x={x} y={y} />
      );
    default:
      return null;
  }
}

export default Container;
