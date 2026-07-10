import React from 'react';

const WeaknessBadge = ({ type, multiplier }) => {
  return (
    <div className="weakness-badge" style={{ '--type-color': `var(--type-${type})` }}>
      <div className="type-dot"></div>
      <span style={{ textTransform: 'capitalize' }}>{type}</span>
      <span className="multiplier">{multiplier}x</span>
    </div>
  );
};

export default WeaknessBadge;
