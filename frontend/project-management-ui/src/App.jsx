import WelcomePage from "./components/welcome-page/WelcomePage";
import { useState } from "react";
import SignIn from "./components/sign-in/SignIn";
import SignUp from "./components/sign-up/SignUp";
import Workspace from "./components/workspace/Workspace";
import NotificationProvider from "./components/notification/NotificationProvider";

function App() {
  const [currentPage, setCurrentPage] = useState("welcome");
  const [authUser, setAuthUser] = useState(null);

  const handleAuthSuccess = (authPayload) => {
    setAuthUser(authPayload ?? null);
    setCurrentPage("workspace");
  };

  return (
    <NotificationProvider>
      {currentPage === "welcome" && (
        <WelcomePage setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "login" && (
        <SignIn onAuthSuccess={handleAuthSuccess} />
      )}
      {currentPage === "register" && (
        <SignUp onAuthSuccess={handleAuthSuccess} />
      )}
      {currentPage === "workspace" && <Workspace currentUser={authUser} />}
    </NotificationProvider>
  );
}

export default App;
