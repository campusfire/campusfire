import React from 'react';
import PropTypes from 'prop-types';
import './popupStyle.css';

const Popup = function ({ text, closePopup }) {
  return (
    <div className="popup">
      <div className="popup_inner">
        <button className="closeButton" type="button" onClick={closePopup}>X</button>
        <h1>{text}</h1>
        <p>Utilisez l'écran de votre smartphone pour déplacer le curseur sur le grand écran.</p>
        <p>Pour ajouter un élément, restez appuyé jusqu'à ce qu'une roue de sélection apparaisse sur le grand écran,
           et choisissez le type de contenu que vous souhaitez ajouter.</p>
        <p>Vous pouvez déplacer un élement en le sélectionnant par un appui long, puis en vous déplaçant en restant appuyé</p>
        <p>Un tutoriel vidéo est également disponible <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">ici</a>.</p>
      </div>
    </div>
  );
};

Popup.propTypes = {
  text: PropTypes.string.isRequired,
  closePopup: PropTypes.func.isRequired,
};

export default Popup;
