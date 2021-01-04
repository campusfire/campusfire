import React from 'react';
import PropTypes from 'prop-types';
import './popupStyle.css';

const Popup = function ({ text, closePopup }) {
  return (
    <div className="popup">
      <div className="popup_inner">
        <h1>{text}</h1>
        <button type="button" onClick={closePopup}>close me</button>
      </div>
    </div>
  );
};

Popup.propTypes = {
  text: PropTypes.string.isRequired,
  closePopup: PropTypes.func.isRequired,
};

export default Popup;
