import Form from "../form/Form";
import Input from "../input/Input";
import { useState } from "react";
import { submitAuthRequest } from "../../services/authApi";
/**
 * SignUp component that renders a sign-up form for new users.
 * This component uses the Form and Input components to create a structured form layout.
 */

function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitAuthRequest("signup", formData, "Sign up");
  };

  return (
    <Form className="form-card" onSubmit={handleSubmit}>
      <h2 className="form-title">Sign Up</h2>

      <Input
        type="text"
        id="username"
        name="username"
        required
        autoComplete="username"
        onChange={handleChange}
      >
        Username:
      </Input>

      <Input
        type="email"
        id="email"
        name="email"
        required
        autoComplete="email"
        onChange={handleChange}
      >
        Email:
      </Input>

      <Input
        type="password"
        id="password"
        name="password"
        required
        autoComplete="new-password"
        onChange={handleChange}
      >
        Password:
      </Input>
    </Form>
  );
}

export default SignUp;
