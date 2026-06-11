import InputField from "../common/InputField";
import Button from "../common/Button";

function ForgotPassword({ setPage }) {
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

      <h1>Forgot Password?</h1>

      <p>
        Enter your email and we'll send you a code to reset your password
      </p>

      <InputField
        label="Email Address"
        name="email"
        type="email"
        placeholder="student@university.edu"
      />

      <Button text="Send Reset Code" />
    </form>
  );
}

export default ForgotPassword;
