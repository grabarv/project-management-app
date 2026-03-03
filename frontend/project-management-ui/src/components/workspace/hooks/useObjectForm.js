import { useCallback, useState } from "react";

/**
 * Manages simple object-backed form state with a generic input change handler.
 */
export function useObjectForm(initialState) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
  };
}
