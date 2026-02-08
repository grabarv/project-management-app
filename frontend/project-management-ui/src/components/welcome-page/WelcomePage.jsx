import './welcomePage.css'

export default function WelcomePage({ setCurrentPage }) {
  return (
    <div className="welcome-card">
      <h1>Welcome to Projects Manager App</h1>
      <div className="button-group">
        <button className="sign-in" onClick={() => setCurrentPage('login')}>Sign in</button>
        <button className="sign-up" onClick={() => setCurrentPage('register')}>Sign up</button>
      </div>
    </div>
  );
}
