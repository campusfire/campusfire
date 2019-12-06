import React, { Component } from 'react';
import '../App.css';
import PostIt from './PostIt';

class Container extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contentType: props.contentType,
      content: props.content, // pas de props.item (à changer plus tard)
      x: props.x,
      y: props.y,
    };
  }

  render() {
    const {
      x, y, content, contentType,
    } = this.state;
    const { id } = this.props;
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
}

export default Container;
