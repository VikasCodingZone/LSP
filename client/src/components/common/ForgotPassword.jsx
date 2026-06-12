import { useState } from "react";
import InputField from "../common/InputField";
import Button from "../common/Button";
import { forgotPassword } from "../../api/auth";

function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("कृपया email डालें");
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword({ email });
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          setPage("reset");
        }, 1500);
      } else {
        setError(response.message || "Something went wrong ");
      }
    } catch (err) {
      setError(err.message || "issue sending email");
    } finally {
      setLoading(false);
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

      <h1>Forgot Password?</h1>

      <p>
        Enter your email and we'll send you a code to reset your password
      </p>

      <InputField
        label="Email Address"
        name="email"
        type="email"
        placeholder="student@university.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required={true}
      />

      {error && <div style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: "10px", fontSize: "14px" }}>{success}</div>}

      <Button text={loading ? "Processing..." : "Send Reset Code"} disabled={loading} />
    </form>
  );
}

export default ForgotPassword;
