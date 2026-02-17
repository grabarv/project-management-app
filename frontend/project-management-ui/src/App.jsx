import WelcomePage from "./components/welcome-page/WelcomePage";
import { useState } from "react";
import SignIn from "./components/sign-in/SignIn";
import SignUp from "./components/sign-up/SignUp";
import Workspace from "./components/workspace/Workspace";

function App() {
  const [currentPage, setCurrentPage] = useState("welcome");

  return (
    <>
      {currentPage === "welcome" && (
        <WelcomePage setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "login" && (
        <SignIn onAuthSuccess={() => setCurrentPage("workspace")} />
      )}
      {currentPage === "register" && (
        <SignUp onAuthSuccess={() => setCurrentPage("workspace")} />
      )}
      {currentPage === "workspace" && <Workspace />}
    </>
  );
}

export default App;
