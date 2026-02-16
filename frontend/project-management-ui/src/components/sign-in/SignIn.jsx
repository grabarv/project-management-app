import Input from "../input/Input";
import Form from "../form/Form";
import { useState } from "react";
/**
 * SignIn component that renders a sign-in form for existing users.
 * This component uses the Form and Input components to create a structured form layout.
 */

function SignIn() {
  const [formData, setFormData] = useState({
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
      const response = await fetch("https://localhost:5001/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send sign in data");
      }

      const result = await response.json();
      console.log("Sign in response:", result);
    } catch (error) {
      console.error("Sign in request error:", error);
    }
  };

  return (
    <Form className="form-card" onSubmit={handleSubmit}>
      <h2 className="form-title">Sign In Page</h2>

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
        autoComplete="current-password"
        onChange={handleChange}
      >
        Password:
      </Input>
    </Form>
  );
}

export default SignIn;
