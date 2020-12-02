import React, { Component } from 'react';
import '../App.css';
import PostIt from './PostIt';
import Image from './Image';
import Video from './Video';

function Container(props) {
  const {
    id, x, y, z, content, contentType, lifetime
  } = props;
  switch (contentType) {
    case 'TEXT':
      return (
        <PostIt id={id} text={content} x={x} y={y} z={z} lifetime={lifetime} />
      );
    case 'IMAGE':
      return (
        <Image id={id} src={content} x={x} y={y} z={z} />
      );

    case 'VIDEO':
      return (
        <Video id={id} src={content} x={x} y={y} z={z} />
      );
    default:
      return null;
  }
}

export default Container;
