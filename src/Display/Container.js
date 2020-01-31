import React, { Component } from 'react';
import '../App.css';
import PostIt from './PostIt';

function Container(props) {
  const {
    id, x, y, z, content, contentType,
  } = props;
  switch (contentType) {
    case 'TEXT':
      return (
        <PostIt id={id} text={content} x={x} y={y} z={z} />
      );
    case 'IMAGE':
      return (
        <PostIt text={content} x={x} y={y} z={z} />
      );

    case 'VIDEO':
      return (
        <PostIt text={content} x={x} y={y} z={z} />
      );
    default:
      return null;
  }
}

export default Container;
