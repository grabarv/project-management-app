import Form from "../form/Form";
import Input from "../input/Input";

function SignUp() {
  return (

      <Form
        className="form-card"
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="form-title">Sign Up</h2>

        <Input type="text" id="username" name="username" required>
          Username:
        </Input>

        <Input type="email" id="email" name="email" required>
          Email:
        </Input>

        <Input type="password" id="password" name="password" required>
          Password:
        </Input>
      </Form>
  );
}

export default SignUp;
