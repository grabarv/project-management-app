/**
 * Input component that represents a labeled input field.
 * It accepts various props to customize the input type, id, name, and whether it's required.
 * @param {object} props - The properties passed to the Input component.
 * @param {React.ReactNode} props.children - The label text for the input field.
 * @param {string} props.type - The type of the input (e.g., "text", "password", "email").
 * @param {string} props.id - The unique identifier for the input field.
 * @param {string} props.name - The name attribute for the input field.
 * @param {boolean} props.required - Whether the input field is required or not.
 * @param {string} [props.autoComplete] - The autocomplete attribute for the input field (optional).
 */

export default function Input({
  children,
  type,
  id,
  name,
  required,
  autoComplete,
  onChange,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{children}</label>
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        autoComplete={autoComplete}
        onChange={onChange}
      />
    </div>
  );
}
