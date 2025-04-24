import React from "react";
import Select from "react-select"; // Import the Select component from react-select

export default function Search({
  options,
  onChange,
  value,
  placeholder,
  className,
  id,
  isMulti = false,
}) {

  const handleChange = (selectedOptions) =>{
    if(isMulti && selectedOptions && Array.isArray(selectedOptions)){
        let selectedValue = selectedOptions.map((item) => item.value);
        return onChange(selectedValue,selectedOptions);
    }
    if(selectedOptions && (!Array.isArray(selectedOptions)) && selectedOptions.value){
      return onChange(selectedOptions.value,selectedOptions);
    }

    return onChange(null,selectedOptions);
  }

  return (
    <div className="holders">
      <Select
        isMulti={isMulti} // Enable multi-select
        className={className} // Custom class name for styling
        options={options} // Options to display in the select dropdown
        value={value} // The selected value(s) (array of objects)
        onChange={handleChange} // Event handler for selection change
        placeholder={placeholder} // Placeholder text when no option is selected
        id={id} // Pass the id prop to associate with the label
        getOptionLabel={(e) => e.label} // Define what label to show (client's full name)
        getOptionValue={(e) => e.value} // Define what value to pass when selected (client ID)
      />
    </div>
  );
}
