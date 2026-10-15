import React from "react";

export const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

// Visual progress bar: PLACED → CONFIRMED → SHIPPED → DELIVERED
function StatusTracker({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="status-tracker">
      {STATUS_STEPS.map((step, index) => (
        <div key={step} className={index <= currentIndex ? "status-step done" : "status-step"}>
          <span className="status-dot" />
          <span className="status-label">{step}</span>
        </div>
      ))}
    </div>
  );
}

export default StatusTracker;
