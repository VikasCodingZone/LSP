import { useState } from "react";
import "./App.css";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import ForgotPasswordPage from "./page/ForgotPasswordPage";
import VerifyOTPPage from "./page/VerifyOTPPage";
import ResetPasswordPage from "./page/ResetPasswordPage";

function App() {
  const [page, setPage] = useState("login");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  switch (page) {
    case "register":
      return <RegisterPage setPage={setPage} />;

    case "forgot":
      return <ForgotPasswordPage setPage={setPage} setForgotPasswordEmail={setForgotPasswordEmail} />;

    case "verify-otp":
      return <VerifyOTPPage setPage={setPage} forgotPasswordEmail={forgotPasswordEmail} />;

    case "reset":
      return <ResetPasswordPage setPage={setPage} forgotPasswordEmail={forgotPasswordEmail} />;

    default:
      return <LoginPage setPage={setPage} />;
  }
}

export default App;
