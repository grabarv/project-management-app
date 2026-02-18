import Form from "../form/Form";
import Input from "../input/Input";
import { useState } from "react";
import { submitAuthRequest } from "../../services/authApi";
import Notification from "../notification/Notification";
/**
 * SignUp component that renders a sign-up form for new users.
 * This component uses the Form and Input components to create a structured form layout.
 */

function SignUp({ onAuthSuccess = () => {} }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitAuthRequest("signup", formData);

    if (result.ok) {
      onAuthSuccess(result.data);
      return;
    }
    setNotification({ type: "error", message: result.message || "Sign up failed" });
  };

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

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
    </>
  );
}

export default SignUp;
