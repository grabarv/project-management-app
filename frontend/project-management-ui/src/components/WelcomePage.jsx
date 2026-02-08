import React from "react";

export default function WelcomePage() {
  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <h1>Welcome to Projects Manager App</h1>

        <div className="button-group">
          <button className="sign-in">Sign in</button>
          <button className="sign-up">Sign up</button>
        </div>
      </div>
    </div>
  );
}
