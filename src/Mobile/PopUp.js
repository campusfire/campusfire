import React from 'react';
import PropTypes from 'prop-types';
import './popupStyle.css';

const Popup = function ({ text, closePopup }) {
  return (
    <div>
      <h1>{text}</h1>
      <button type="button" onClick={closePopup}>close me</button>
    </div>
  );
};

Popup.propTypes = {
  text: PropTypes.string.isRequired,
  closePopup: PropTypes.func.isRequired,
};

export default Popup;
