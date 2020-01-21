import React from 'react';
import '../App.css';
import PostIt from './PostIt';

function Container(props) {
  const {
    id, x, y, z, content, contentType,
  } = props;
  switch (contentType) {
    case 'text':
      return (
        <PostIt id={id} text={content} x={x} y={y} z={z} />
      );
    case 'image':
      return (
        <PostIt text={content} x={x} y={y} z={z} />
      );

    case 'video':
      return (
        <PostIt text={content} x={x} y={y} z={z} />
      );
    default:
      return null;
  }
}

export default Container;
