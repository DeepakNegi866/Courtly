import React, { useState } from "react";
import ManagementLayout from "@/layouts/management";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import Axios from "@/config/axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";
import formstyle from "@/styles/authForm.module.css";
import { AddIcon, RightArrow, TrashIcon } from "@/utils/icons";

const AddOrganization = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: [{ city: "", state: "", postalCode: "", officeNumber: "" }], // Default one address field
    },
    mode: "all",
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "address",
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        const value = data[key];

        // Check for undefined, null, or empty values
        if (value !== undefined && value !== null && value !== "") {
          if (key === "logo" || key === "image") {
            if (value && value.length > 0) {
              formData.append(key, value[0]); // Append only the first file
            }
          }
          // Handle address array input
          else if (key === "address" && Array.isArray(value)) {
            value.forEach((addressItem, index) => {
              Object.keys(addressItem).forEach((field) => {
                if (
                  addressItem[field] !== undefined &&
                  addressItem[field] !== null &&
                  addressItem[field] !== ""
                ) {
                  formData.append(
                    `address[${index}][${field}]`,
                    addressItem[field]
                  );
                }
              });
            });
          }
          // Handle other fields
          else {
            formData.append(key, value);
          }
        }
      });

      await Axios.post("/organization/add-organization", formData, {
        authenticated: true,
      });
      reset();
      setLoading(false);
      toast.success("Organization is created successfully");
      router.push("/management/organizations");
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response.data.message || "Failed to create organization"
      );
    }
  };
  const breadcrumbItems = [
    { label: "Organizations", href: "/management/organizations" }, // Last item (non-clickable)
    { label: "Add New" }, // Last item (non-clickable)
  ];
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className={`mb-4 ${formstyle.commonFormHeading}`}>
              Add an organization{" "}
            </h2>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={formstyle.addOrganizationform}
        >
          <div className="row">
            {/* Company Name */}
            <div className="col-md-3 mb-3">
              <label htmlFor="companyName" className="form-label">
                Company Name*
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput}  ${
                  errors.companyName ? "is-invalid" : ""
                }`}
                placeholder=" Enter Company Name "
                id="companyName"
                {...register("companyName", {
                  maxLength: {
                    value: 100,
                    message: "This field must not exceed 100 characters",
                  },
                  required: "This field is required",
                })}
              />
              {errors.companyName && (
                <div className="invalid-feedback">
                  {errors.companyName.message}
                </div>
              )}
            </div>

            {/* Company Email */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Company Email*</label>
              <input
                type="email"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.companyEmail ? "is-invalid" : ""
                }`}
                placeholder=" Enter Company Email"
                {...register("companyEmail", {
                  pattern: {
                    value: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                  required: "This field is required",
                })}
              />
              {errors.companyEmail && (
                <div className="invalid-feedback">
                  {errors.companyEmail.message}
                </div>
              )}
            </div>

            {/* Website */}
            <div className="col-md-3 mb-3">
              <label htmlFor="website" className="form-label">
                Company Website
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput}`}
                id="website"
                {...register("website")}
                placeholder="Enter Company Website"
              />
            </div>

            {/* GSTN */}
            <div className="col-md-3 mb-3">
              <label className="form-label">GSTN</label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.GSTN ? "is-invalid" : ""
                }`}
                placeholder="Enter GSTN Number"
                {...register("GSTN", {
                  pattern: {
                    value: /^[A-Z0-9]{15}$/, // Allow only uppercase letters and numbers
                    message: "Invalid GSTN", // Error message
                  },
                })}
                maxLength={15}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                }}
              />
              {errors.GSTN && (
                <div className="invalid-feedback">{errors.GSTN.message}</div>
              )}
            </div>
          </div>

          <div className="row">
            {/* PAN */}
            <div className="col-md-3 mb-3">
              <label htmlFor="PAN" className="form-label">
                PAN
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.PAN ? "is-invalid" : ""
                }`}
                placeholder="Enter Pan Number"
                {...register("PAN", {
                  pattern: {
                    value: /^[A-Z0-9]{10}$/, // Allow only uppercase letters and numbers
                    message: "Invalid PAN Number",
                  },
                })}
                maxLength={10}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                }}
              />
              {errors.PAN && (
                <div className="invalid-feedback">{errors.PAN.message}</div>
              )}
            </div>

            {/* Company logo */}
            <div className="col-md-3 mb-3">
              <label htmlFor="logo" className="form-label">
                Company Logo
              </label>
              <input
                type="file"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.logo ? "is-invalid" : ""
                }`}
                {...register("logo", {
                  validate: {
                    format: (files) => {
                      if (!files || files.length === 0) return;

                      const validFormats = [
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                      ];
                      return (
                        validFormats.includes(files[0]?.type) ||
                        "Unsupported file format"
                      );
                    },
                  },
                })}
              />
              {errors.logo && (
                <div className="invalid-feedback">{errors?.logo.message}</div>
              )}
            </div>

            {/* Description */}
            <div className="col-md-6 mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className={`form-control ${formstyle.commonFormInput}`}
                id="description"
                rows="3"
                placeholder="Enter Description"
                {...register("description",{
                  maxLength: {
                    value: 500,
                    message:
                      "This field must not exceed 500 characters",
                  },
                })}
              />
              {errors.description && <div className="text-danger">{errors.description.message}</div>}
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-3">
            <label className="form-label">Address</label>
            {fields.map((item, index) => (
              <div key={item.id} className="border p-3 mb-2 rounded">
                <div className="row">
                  {/* State */}
                  <div className="col-md-3 mb-3">
                    <label className="form-label">State*</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.state ? "is-invalid" : ""
                      }`}
                      placeholder="Enter State"
                      {...register(`address.${index}.state`, {
                        required: "This field is required",
                      })}
                    />
                    {errors.address?.[index]?.state && (
                      <div className="invalid-feedback">
                        {errors.address?.[index]?.state.message}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="col-md-3 mb-3">
                    <label className="form-label">City*</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.city ? "is-invalid" : ""
                      }`}
                      placeholder="Enter City"
                      {...register(`address.${index}.city`, {
                        required: "This field is required",
                      })}
                    />
                    {errors.address?.[index]?.city && (
                      <div className="invalid-feedback">
                        {errors.address?.[index]?.city.message}
                      </div>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Postal Code*</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.postalCode ? "is-invalid" : ""
                      }`}
                      placeholder="Enter Postal Code"
                      {...register(`address.${index}.postalCode`, {
                        pattern: {
                          value: /^\d{6}$/,
                          message: "Please enter 6 digit",
                        },
                        required: "This field is required",
                      })}
                      maxLength={6}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                    />
                    {errors.address?.[index]?.postalCode && (
                      <div className="invalid-feedback">
                        {errors.address?.[index]?.postalCode.message}
                      </div>
                    )}
                  </div>

                  {/* Office Number */}
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Office Number*</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.officeNumber
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter Office Number"
                      {...register(`address.${index}.officeNumber`, {
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Please enter 10 digit ",
                        },
                        required: "This field is required",
                      })}
                      maxLength={10} // Ensure the user can only type 10 digits
                      minLength={10}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                      }}
                    />
                    {errors.address?.[index]?.officeNumber && (
                      <div className="invalid-feedback">
                        {errors.address?.[index]?.officeNumber.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove Address Button */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger mt-2"
                    onClick={() => remove(index)}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}

            {/* Add Address Button */}
            <button
              type="button"
              className={`btn mt-3 ${formstyle.addressButton} `}
              onClick={() =>
                append({
                  city: "",
                  state: "",
                  postalCode: "",
                  officeNumber: "",
                })
              }
            >
              Add Address
              <AddIcon />
            </button>
          </div>

          {/* /Admin Section */}
          <div className="mb-3">
            <label className="form-label">Admin</label>
            <div className="border p-3 mb-2 rounded">
              <div className="row">
                {/* City */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">First Name*</label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.firstName ? "is-invalid" : ""
                    }`}
                    {...register("firstName", {
                      required: "This field is required",
                      maxLength: {
                        value: 100,
                        message: "This field must not exceed 100 characters",
                      },
                     
                    })}
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">
                      {errors.firstName.message}
                    </div>
                  )}
                </div>

                {/* State */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.lastName ? "is-invalid" : ""
                    }`}
                    {...register("lastName", {
                      maxLength: {
                        value: 100,
                        message: "This field must not exceed 100 characters",
                      },
                      validate: (value) => {
                        if (
                          watch("firstName") &&
                          value == watch("firstName")
                        ) {
                          return "last name should not be match to first name";
                        }
                        return true; 
                      },
                    })}
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">
                      {errors.lastName.message}
                    </div>
                  )}
                </div>

                {/* Postal Code */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">Email*</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter Email"
                    {...register("email", {
                      pattern: {
                        value:
                          /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                      required: "This field is required ",
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                {/* Office Number */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">Phone Number*</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.phoneNumber ? "is-invalid" : ""
                    }`}
                    placeholder="Enter Phone Number"
                    {...register("phoneNumber", {
                      pattern: {
                        value: /^\d{10}$/,
                        message: "Please enter 10 digit",
                      },
                      required: "This is field required",
                    })}
                    maxLength={10} // Ensure the user can only type 6 digits
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                    }}
                  />
                  {errors.phoneNumber && (
                    <div className="invalid-feedback">
                      {errors.phoneNumber.message}
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Role*</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}`}
                    defaultValue="admin"
                    {...register("role")}
                    readOnly
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="image" className="form-label">
                    Admin Profile
                  </label>
                  <input
                    type="file"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.image ? "is-invalid" : ""
                    }`}
                    id="image"
                    {...register("image", {
                      validate: {
                        format: (files) => {
                          if (!files || files.length === 0) return;

                          const validFormats = [
                            "image/jpeg",
                            "image/jpg",
                            "image/png",
                          ];
                          return (
                            validFormats.includes(files[0]?.type) ||
                            "Unsupported file format"
                          );
                        },
                      },
                    })}
                  />
                  {errors.image && (
                    <div className="invalid-feedback">
                      {errors?.image?.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`commonButton mb-2 ${formstyle.addressButton}`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
            <RightArrow />
          </button>
        </form>
      </div>
    </>
  );
};

AddOrganization.getLayout = (page) => (
  <ManagementLayout>{page}</ManagementLayout>
);

export default AddOrganization;
