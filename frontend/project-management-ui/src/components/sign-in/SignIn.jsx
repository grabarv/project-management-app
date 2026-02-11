import Input from "../input/Input";
import Form from "../form/Form";

/**
 * SignIn component that renders a sign-in form for existing users.
 * This component uses the Form and Input components to create a structured form layout.
 */

function SignIn() {
  return (
    <Form className="form-card" onSubmit={(e) => e.preventDefault()}>
      <h2 className="form-title">Sign In Page</h2>

      <Input
        type="text"
        id="username"
        name="username"
        required
        autoComplete="username"
      >
        Username:
      </Input>

      <Input
        type="password"
        id="password"
        name="password"
        required
        autoComplete="current-password"
      >
        Password:
      </Input>
    </Form>
  );
}

export default SignIn;
