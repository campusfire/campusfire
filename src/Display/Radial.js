import React from 'react';
import '../App.css';

function Radial(props) {
  const {
    color, x, y, id,
  } = props;
  return (
    <div id={`radial_${id}`} className="pieWrap" style={{ left: `${x - 100}px`, top: `${y - 100}px` }}>
      <div className="innerCircle" style={{ backgroundColor: color }} />
      {<div className="pieSlice pieSliceUpLeft" />}
      {<div className="pieSlice pieSliceUpRight" />}
      {<div className="pieSlice pieSliceDownLeft" />}
      {<div className="pieSlice pieSliceDownRight" />}
    </div>
  );
}

export default Radial;
