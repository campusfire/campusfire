import React from 'react';
import '../App.css';

function Radial(props) {
  const {
    color, x, y, id, pieType
  } = props;

  switch (pieType){
    case "postPie":
      var UpLeft = "pieSliceMedia";
      var UpRight = "pieSliceText";
      var DownLeft = "pieSliceEmbeded";
      var DownRight = "pieSliceCredits";
      break;
    case "mainPie":
      UpLeft = "pieSlicePost";
      UpRight = "pieSliceLikeDislike";
      DownLeft = "pieSliceEdit";
      DownRight = "pieSliceMove";
      break;
    case "likePie":
      UpLeft = "pieSliceLike";
      UpRight = "pieSliceDislike";
      DownLeft = "none";
      DownRight = "none";
      break;
  }; 
  

  return (
    <div id={`radial_${id}`} className="pieWrap" style={{ left: `${x - 100}px`, top: `${y - 100}px` }}>
      <div className="innerCircle" style={{ backgroundColor: color }} />
      {<div className= {"pieSlice pieSliceUpLeft " + UpLeft }/>}
      {<div className= {"pieSlice pieSliceUpRight " + UpRight} />}
      {<div className= {"pieSlice pieSliceDownLeft " + DownLeft} />}
      {<div className= {"pieSlice pieSliceDownRight " + DownRight} />}
    </div>
  );
}

export default Radial;
