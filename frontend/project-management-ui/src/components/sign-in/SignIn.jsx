import Input from "../input/Input";
import Form from "../form/Form";

function SignIn() {
  return (
      <Form
        className="form-card"
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="form-title">Sign In Page</h2>

        <Input type="text" id="username" name="username" required>
          Username:
        </Input>

        <Input type="password" id="password" name="password" required>
          Password:
        </Input>
      </Form>
  );
}

export default SignIn;
