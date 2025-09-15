
import React from 'react';

const ExpandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9.75 9.75M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L14.25 9.75M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9.75 14.25m10.5 6-6-6" />
  </svg>
);

export default ExpandIcon;
