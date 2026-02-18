import Input from "../input/Input";
import Form from "../form/Form";
import { useState } from "react";
import { submitAuthRequest } from "../../services/authApi";
import Notification from "../notification/Notification";
/**
 * SignIn component that renders a sign-in form for existing users.
 * This component uses the Form and Input components to create a structured form layout.
 */

function SignIn({ onAuthSuccess = () => {} }) {
  const [formData, setFormData] = useState({
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
    const result = await submitAuthRequest("signin", formData);

    if (result.ok) {
      onAuthSuccess(result.data);
      return;
    }

    setNotification({ type: "error", message: result.message || "Sign in failed" });
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
    </>
  );
}

export default SignIn;
