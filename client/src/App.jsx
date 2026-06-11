import { useState } from "react";
import "./App.css";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import ForgotPasswordPage from "./page/ForgotPasswordPage";
import ResetPasswordPage from "./page/ResetPasswordPage";

function App() {
  const [page, setPage] = useState("login");

  switch (page) {
    case "register":
      return <RegisterPage setPage={setPage} />;

    case "forgot":
      return <ForgotPasswordPage setPage={setPage} />;

    case "reset":
      return <ResetPasswordPage setPage={setPage} />;

    default:
      return <LoginPage setPage={setPage} />;
  }
}

export default App;
