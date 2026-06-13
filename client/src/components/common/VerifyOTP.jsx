import { useState, useRef } from "react";
import Button from "./Button";
import { verifyOtp } from "../../api/auth";

function VerifyOTP({ setPage, email }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    if (value.match(/^[0-9]?$/)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setStatus("Please enter all 6 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyOtp({ email, otp: otpString });
      setStatus("OTP verified successfully. Redirecting...");
      setTimeout(() => {
        setPage("reset");
      }, 1500);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendMessage("Sending new OTP...");
    
    try {
      const { forgotPassword } = await import("../../api/auth");
      await forgotPassword({ email });
      setOtp(["", "", "", "", "", ""]);
      setResendMessage("New OTP sent to your email!");
      inputRefs.current[0]?.focus();
      
      // Re-enable after 30 seconds
      setTimeout(() => {
        setResendDisabled(false);
        setResendMessage("");
      }, 30000);
    } catch (error) {
      setResendMessage("Failed to resend OTP");
      setResendDisabled(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <button
        className="back-button"
        type="button"
        onClick={() => setPage("login")}
      >
        <span aria-hidden="true">←</span>
        Back to Login
      </button>

      <h1>Verify Code</h1>

      <p>We sent a 6-digit code to {email}</p>

      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="otp-input"
            placeholder="0"
            autoComplete="off"
          />
        ))}
      </div>

      <Button text={isSubmitting ? "Verifying..." : "Verify Code"} disabled={isSubmitting} />

      {status && <p className="form-status">{status}</p>}

      <div className="resend-section">
        <p>Didn't receive the code?</p>
        <button
          type="button"
          className="link-button"
          onClick={handleResendOtp}
          disabled={resendDisabled}
        >
          Resend OTP
        </button>
        {resendMessage && (
          <p className={`resend-message ${resendDisabled ? "loading" : "success"}`}>
            {resendMessage}
          </p>
        )}
      </div>
    </form>
  );
}

export default VerifyOTP;
