import InputField from "../common/InputField";
import PasswordInput from "../common/PasswordInput";
import Button from "../common/Button";

function ResetPassword({ setPage }) {
  return (
    <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
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
        placeholder="Enter reset code"
      />

      <PasswordInput
        label="New Password"
        name="newPassword"
        placeholder="Create a new password"
      />

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Confirm new password"
      />

      <Button text="Change Password" />
    </form>
  );
}

export default ResetPassword;
