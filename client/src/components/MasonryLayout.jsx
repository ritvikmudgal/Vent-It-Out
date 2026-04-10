import React from 'react';
import Masonry from 'react-masonry-css';
import PostCard from './PostCard';

const breakpointColumnsObj = {
  default: 3,
  1100: 2,
  700: 1
};

const MasonryLayout = ({ posts, onDelete }) => {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {posts.map((post) => (
        <div key={post._id} style={{ marginBottom: '1.5rem' }}>
          {/* envelopeMode=false → plain aged-paper letter card */}
          <PostCard post={post} onDelete={onDelete} envelopeMode={false} />
        </div>
      ))}
    </Masonry>
  );
};

export default MasonryLayout;
