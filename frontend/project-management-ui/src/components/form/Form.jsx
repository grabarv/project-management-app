import "./form.css";

/**
 * Form component that serves as a reusable form wrapper for both sign-in and sign-up pages.
 * It accepts children components (like Input) and handles form submission.
 *
 * @param {object} props - The properties passed to the Form component.
 * @param {function} props.onSubmit - The function to handle form submission.
 * @param {React.ReactNode} props.children - The child components to be rendered inside the form.
 */

export default function Form({ children, onSubmit, ...props }) {
  return (
    <form onSubmit={onSubmit} {...props}>
      {children}
      <button type="reset">Reset</button>
      <button type="submit">Submit</button>
    </form>
  );
}
