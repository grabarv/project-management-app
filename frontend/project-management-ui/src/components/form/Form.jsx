import "./form.css";

export default function Form({children, onSubmit, ...props}) {
  return (
      <form onSubmit={onSubmit} {...props}>
        {children}
        <button type="reset">Reset</button>
        <button type="submit">Submit</button>
      </form>
  );
}