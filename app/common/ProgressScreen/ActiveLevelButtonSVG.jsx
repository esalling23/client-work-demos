import React from 'react';
import PropTypes from 'prop-types';

const ActiveLevelButtonSVG = ({ fillColor, shadowColor }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="Layer_1"
    data-name="Layer 1"
    width="140"
    height="126"
    viewBox="0 0 140 126"
  >
    <defs>
      <clipPath id="clippath">
        <rect width="140" height="126" fill={fillColor} />
      </clipPath>
      <filter id="drop-shadow-1" filterUnits="userSpaceOnUse">
        <feOffset dx="0" dy="6" />
        <feGaussianBlur result="blur" stdDeviation="0" />
        <feFlood floodColor={shadowColor} floodOpacity="1" />
        <feComposite in2="blur" operator="in" />
        <feComposite in="SourceGraphic" />
      </filter>
    </defs>
    <g clipPath="url(#clippath)">
      <g>
        <g filter="url(#drop-shadow-1)">
          <path
            d="m1.84,15C2.37,7.93,8.1,2.38,15.31,1.92c12.79-.82,33.74-1.92,54.69-1.92s41.9,1.1,54.69,1.92c7.21.46,12.94,6.01,13.47,13.08.82,10.99,1.84,27.99,1.84,45s-1.02,34.01-1.84,45c-.53,7.07-6.26,12.62-13.47,13.08-12.79.82-33.74,1.92-54.69,1.92s-41.9-1.1-54.69-1.92c-7.21-.46-12.94-6.01-13.47-13.08-.82-10.99-1.84-27.99-1.84-45S1.02,25.99,1.84,15Z"
            fill={fillColor}
            fillRule="evenodd"
          />
        </g>
      </g>
    </g>
  </svg>
);

ActiveLevelButtonSVG.propTypes = {
  fillColor: PropTypes.string,
  shadowColor: PropTypes.string,
};

ActiveLevelButtonSVG.defaultProps = {
  fillColor: '',
  shadowColor: '#000000',
};
export default ActiveLevelButtonSVG;
