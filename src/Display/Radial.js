import React from 'react';
import '../App.css';

function Radial(props) {
  const {
    color, x, y, id,
  } = props;
  return (
    <div id={`radial_${id}`} className="pieWrap" style={{ left: `${x - 100}px`, top: `${y - 100}px` }}>
      <div className="innerCircle" style={{ backgroundColor: color }} />
      <div className="pieSlice pieSliceText" />
      <div className="pieSlice pieSliceImage" />
      <div className="pieSlice pieSliceVideo" />
      <div className="pieSlice pieSliceOther" />
    </div>
  );
}

export default Radial;
