import React, { useEffect, useState } from "react";

const FileInput = ({
  src: initialSrc,
  title,
  alt,
  onChange,
  initialData = null,
  ...rest
}) => {
  const [src, setSrc] = useState(initialSrc);

  useEffect(() => {
    if (!initialData && !src) return setSrc("/assets/img/add-image.svg");
  }, [initialData]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSrc(e.target.result);
      };
      reader.readAsDataURL(file);
      onChange(event); // Notify the parent form about the file change
    }
    else{
        setSrc("/assets/img/add-image.svg");
        onChange(event);
    }
  };
  return (
    <>
      {title && <p>{title}</p>}
      <label htmlFor={rest.id ? rest.id : "fileInput"}>
        <img
          src={src || "/assets/img/add-image.svg"}
          alt={alt || "file input"}
          height={rest.height || "200"}
          className="w-100"
        />
        <input
          type="file"
          className="d-none"
          onChange={handleFileChange}
          {...rest}
        />
        {initialData && initialData[0] && initialData[0]["name"] ? (
          <p>{initialData[0]["name"]}</p>
        ) : null}
      </label>
    </>
  );
};

export default FileInput;
