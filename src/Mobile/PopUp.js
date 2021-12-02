import React from 'react';
import PropTypes from 'prop-types';
import './popupStyle.css';

const Popup = function ({ text, closePopup }) {
  return (
    <div className="popup">
      <div className="popup_inner">
        <button className="closeButton" type="button" onClick={closePopup}>X</button>
        <div className="popup_scrollable">
          <h1>{text}</h1>
          <p>Utilisez l'écran de votre smartphone pour déplacer le curseur sur le grand écran.</p>
          <p>Pour ajouter un élément, restez appuyé jusqu'à ce qu'un icône apparaisse sur le grand écran puis relachez.
            Vous pouvez alors choisir une image à poster depuis votre téléphone.
          </p>
          <p>Vous pouvez liker/disliker les images des autres utilisateurs afin de modifier leur durée de vie à l'écran.</p>
          <p>Vous pouvez déplacer un élement en le sélectionnant par un appui long, puis en vous déplaçant en restant appuyé</p>
          <p>Un tutoriel vidéo est également disponible <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">ici</a>.</p>
        </div>
      </div>
    </div>
  );
};

Popup.propTypes = {
  text: PropTypes.string.isRequired,
  closePopup: PropTypes.func.isRequired,
};

export default Popup;
