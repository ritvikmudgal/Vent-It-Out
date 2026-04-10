import React from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';

const BounceCards = ({ posts = [] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
      {posts.map((post, i) => {
        const rotate = (i % 2 === 0 ? 1 : -1) * (i * 1.5);
        const yOffset = i * -15;

        return (
          <motion.div
            key={post._id || i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: yOffset, rotate }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
            style={{ position: 'relative', zIndex: posts.length - i }}
          >
            {/* Profile/PublicProfile: envelope mode, opens on click */}
            <PostCard post={post} envelopeMode={true} autoOpenOnHover={false} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default BounceCards;
