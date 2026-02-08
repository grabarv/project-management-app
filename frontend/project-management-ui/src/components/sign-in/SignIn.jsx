import Form from "../form/Form";

function SignIn() {
  return (
      <Form
        className="form-card"
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 className="form-title">Sign In Page</h2>

        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
      </Form>
  );
}

export default SignIn;
