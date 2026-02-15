import Form from "../form/Form";
import Input from "../input/Input";
import { useState } from "react";
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

    try {
      const response = await fetch("https://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send sign up data");
      }

      const result = await response.json();
      console.log("Sign up response:", result);
    } catch (error) {
      console.error("Sign up request error:", error);
    }
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
