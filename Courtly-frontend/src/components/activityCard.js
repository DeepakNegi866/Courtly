// ActivityCard.js
import React from "react";

const ActivityCard = ({ number, icon, title, color }) => {
  return (
    <div className="activityCard" style={{ backgroundColor: color }}>
      <div className="cardContent">
        <div className="cardContentLeft">
          <div className="cardNumber">{number}</div>
          <h3 className="cardTitle">{title}</h3>
        </div>
        <div className="cardContentRight">
          <div className="cardIcon">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
