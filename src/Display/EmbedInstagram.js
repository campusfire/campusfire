import React from 'react';

function EmbedInstagram(props) {
  const {
    key, id, postId, x, y, z,
  } = props;
  return (
    <div>
    <blockquote
      className="postit-embedInstagram"
      class="instagram-media"
      data-instgrm-captioned
      data-instgrm-permalink={`https://www.instagram.com/p/${postId}/?utm_source=ig_embed&amp;utm_campaign=loading`}
      data-instgrm-version="13"
      id={id}
      key={key}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: z,
      }}
    />
    <script async src="instagram.com.embed.js"></script>
    </div>
  );
}

export default Image;