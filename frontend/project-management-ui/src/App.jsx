import WelcomePage from "./components/welcome-page/WelcomePage";
import { useState } from "react";
import SignIn from "./components/sign-in/SignIn";
import SignUp from "./components/sign-up/SignUp";
function App() {
  const [currentPage, setCurrentPage] = useState("welcome");

  return (
    <>
      {currentPage === "welcome" && (
        <WelcomePage setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "login" && <SignIn />}
      {currentPage === "register" && <SignUp />}
    </>
  );
}

export default App;
