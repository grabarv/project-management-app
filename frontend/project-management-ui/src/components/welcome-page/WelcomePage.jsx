import './welcomePage.css'

/**
 * WelcomePage component that serves as the landing page for the application.
 * It provides options for users to either sign in or sign up.
 *
 * @param {function} setCurrentPage - A function to update the current page state in the parent component.
*/
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
