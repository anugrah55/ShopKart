import React from "react";

const FIELDS = [
  { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma" },
  { name: "phone", label: "Phone", placeholder: "9876543210", inputMode: "numeric", maxLength: 10 },
  { name: "addressLine1", label: "Address", placeholder: "22 MG Road" },
  { name: "city", label: "City", placeholder: "Bengaluru" },
  { name: "state", label: "State", placeholder: "Karnataka" },
  { name: "pincode", label: "Pincode", placeholder: "560001", inputMode: "numeric", maxLength: 6 }
];

function CheckoutForm({ values, errors, onChange, disabled }) {
  return (
    <div className="checkout-form">
      <h3>Shipping Details</h3>
      {FIELDS.map((field) => (
        <div className="form-group" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type="text"
            value={values[field.name]}
            onChange={onChange}
            placeholder={field.placeholder}
            inputMode={field.inputMode}
            maxLength={field.maxLength}
            disabled={disabled}
            className={errors[field.name] ? "input-error" : ""}
          />
          {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
        </div>
      ))}
    </div>
  );
}

export default CheckoutForm;
