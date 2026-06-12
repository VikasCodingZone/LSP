import { useState } from "react";
import InputField from "../common/InputField";
import PasswordInput from "../common/PasswordInput";
import Button from "../common/Button";
import { resetPassword } from "../../api/auth";

function ResetPassword({ setPage }) {
  const [formData, setFormData] = useState({
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.resetCode || !formData.newPassword || !formData.confirmPassword) {
      setError("कृपया सभी fields भरें");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords match नहीं कर रहे हैं");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password कम से कम 6 characters होना चाहिए");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        { password: formData.newPassword },
        formData.resetCode
      );

      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          setPage("login");
        }, 1500);
      } else {
        setError(response.message || "कुछ गलत हुआ");
      }
    } catch (err) {
      setError(err.message || "Password reset में समस्या");
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

      <h1>Change Password</h1>

      <InputField
        label="Reset Code"
        name="resetCode"
        icon="mail"
        placeholder="Enter reset code from email"
        value={formData.resetCode}
        onChange={handleChange}
        required={true}
      />

      <PasswordInput
        label="New Password"
        name="newPassword"
        placeholder="Create a new password"
        value={formData.newPassword}
        onChange={handleChange}
      />

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Confirm new password"
        value={formData.confirmPassword}
        onChange={handleChange}
      />

      {error && <div style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: "10px", fontSize: "14px" }}>{success}</div>}

      <Button text={loading ? "Processing..." : "Change Password"} disabled={loading} />
    </form>
  );
}

export default ResetPassword;
