import { useState } from "react";
import "./App.css";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import ForgotPasswordPage from "./page/ForgotPasswordPage";
import VerifyOTPPage from "./page/VerifyOTPPage";
import ResetPasswordPage from "./page/ResetPasswordPage";
import StudentDashboardPage from "./page/StudentDashboardPage";
import VendorDashboardPage from "./page/VendorDashboardPage";

function App() {
  const [page, setPage] = useState(() => {
    const token = localStorage.getItem("cpacToken");
    const accountType = localStorage.getItem("cpacUserType");

    if (!token) {
      return "login";
    }

    return accountType === "vendor" ? "vendor-dashboard" : "dashboard";
  });
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

    case "dashboard":
      return <StudentDashboardPage setPage={setPage} />;

    case "vendor-dashboard":
      return <VendorDashboardPage setPage={setPage} />;

    default:
      return <LoginPage setPage={setPage} />;
  }
}

export default App;
