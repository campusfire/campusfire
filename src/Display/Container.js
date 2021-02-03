import React, { Component } from 'react';
import '../App.css';
import PostIt from './PostIt';
import Image from './Image';
import Video from './Video';
import Embeded from './Embeded';

function Container(props) {
  const {
    id, x, y, z, content, contentType, lifetime
  } = props;
  var regExp = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
  switch (contentType) {
    case 'TEXT':
      return (
        <PostIt id={id} text={content} x={x} y={y} z={z} lifetime={lifetime} />
      );
    case 'MEDIA':
      if (regExp.test(content)) {
        return (
          <Image id={id} src={content} x={x} y={y} z={z} />
        );
      } else {
        return (
          <Video id={id} src={content} x={x} y={y} z={z} />
        );
      }
    case 'EMBEDED':
      return (
        <Embeded id={id} postId={content} x={x} y={y} z={z} />
      );
      
    default:
      return null;
  }
}

export default Container;
