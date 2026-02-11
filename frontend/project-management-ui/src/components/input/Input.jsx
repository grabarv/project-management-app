export default function Input({children, type, id, name, required}) {
  return (
      <div className="form-group">
        <label htmlFor={id}>{children}</label>
        <input type={type} id={id} name={name} required={required} />
      </div>
  );
}