import React, { useState } from "react";
import ManagementLayout from "@/layouts/management";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import Axios from "@/config/axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";
import Organizations from "..";
import formstyle from "@/styles/authForm.module.css";
import { AddIcon, RightArrow, TrashIcon } from "@/utils/icons";

const UpdateOrganization = ({ data }) => {
  const { data: organizationData } = data;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: organizationData?.address || [
        { city: "", state: "", postalCode: "", officeNumber: "" },
      ], // Use existing address or default
      ...organizationData,
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

      // Remove unwanted fields
      const fieldsToRemove = [
        "_id",
        "isDeleted",
        "createdAt",
        "updatedAt",
        "__v",
        "logo",
      ];
      fieldsToRemove.forEach((field) => delete data[field]);

      // Conditionally remove `updateLogo` if empty
      if (data.updateLogo?.length === 0) {
        delete data.updateLogo;
      }

      // Remove `status` if it's "publish"
      if (data.status === "publish") {
        delete data.status;
      }

      if (data?.addedBy) {
        delete data.addedBy;
      }

      // Append organization ID if available
      if (organizationData && organizationData._id) {
        data["organizationId"] = organizationData._id;
      }

      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        const value = data[key];

        if (value === undefined || value === null || value === "") return;

        if (
          key === "updateLogo" &&
          value instanceof FileList &&
          value.length > 0
        ) {
          formData.append("logo", value[0]);
        } else if (key === "address" && Array.isArray(value)) {
          value.forEach((addressItem, index) => {
            Object.keys(addressItem).forEach((field) => {
              if (
                field !== "_id" &&
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
        } else {
          // For other fields, append them directly to formData
          formData.append(key, value);
        }
      });

      // Send the form data to the server
      await Axios.post("/organization/update-organization", formData, {
        authenticated: true,
      });

      reset(); // Reset the form after successful submission
      setLoading(false); // Stop loading spinner
      toast.success("Organization is updated successfully");
      router.push("/management/organizations");
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to update organization"
      );
    }
  };

  const breadcrumbItems = [
    { label: "Organizations", href: "/management/organizations" }, // Last item (non-clickable)
    { label: "Edit" }, // Last item (non-clickable)
    { label: organizationData && organizationData.companyName }, // Last item (non-clickable)
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className={`mb-4 ${formstyle.commonFormHeading}`}>
            Update Organization
          </h2>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={formstyle.addOrganizationform}
        >
          <div className="row">
            {/* Company Name */}
            <div className="col-md-4 mb-3">
              <label htmlFor="companyName" className="form-label">
                Company Name
              </label>
              <input
                type="text"
                className={`form-control  ${formstyle.commonFormInput} ${
                  errors.companyName ? "is-invalid" : ""
                }`}
                placeholder="Enter Company Name"
                id="companyName"
                {...register("companyName", {
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
            <div className="col-md-4 mb-3">
              <label htmlFor="companyEmail" className="form-label">
                Company Email
              </label>
              <input
                type="email"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.companyEmail ? "is-invalid" : ""
                }`}
                placeholder="Enter Company Email"
                id="companyEmail"
                {...register("companyEmail", {
                  required: "This field is required",
                  pattern: {
                    value: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.companyEmail && (
                <div className="invalid-feedback">
                  {errors.companyEmail.message}
                </div>
              )}
            </div>

            {/* Website */}
            <div className="col-md-4 mb-3">
              <label htmlFor="website" className="form-label">
                Company Website
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} `}
                id="website"
                {...register("website")}
                placeholder="Enter Company Website"
              />
            </div>
          </div>

          <div className="row">
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
                placeholder="Enter PAN Number"
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
              <label htmlFor="updateLogo" className="form-label">
                Company Logo
              </label>
              <input
                type="file"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.updateLogo ? "is-invalid" : ""
                }`}
                {...register("updateLogo", {
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
              {errors.updateLogo && (
                <div className="invalid-feedback">
                  {errors?.updateLogo.message}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="col-md-12 mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className={`form-control ${formstyle.commonFormInput}`}
                id="description"
                rows="3"
                placeholder="Enter Desciption"
                {...register("description")}
              />
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
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.state ? "is-invalid" : ""
                      }`}
                      placeholder="Enter State"
                      {...register(`address.${index}.state`, {
                        required: "State is required",
                      })}
                    />
                    {errors.address?.[index]?.state && (
                      <div className="invalid-feedback">
                        {errors.address[index].state.message}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="col-md-3 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.city ? "is-invalid" : ""
                      }`}
                      placeholder="Enter City"
                      {...register(`address.${index}.city`, {
                        required: "City is required",
                      })}
                    />
                    {errors.address?.[index]?.city && (
                      <div className="invalid-feedback">
                        {errors.address[index].city.message}
                      </div>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.postalCode ? "is-invalid" : ""
                      }`}
                      placeholder="Enter Postal Code"
                      {...register(`address.${index}.postalCode`, {
                        required: "Postal Code is required",
                        maxLength: { value: 6, message: "Max length is 6" },
                      })}
                      maxLength={6}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                      }}
                    />
                    {errors.address?.[index]?.postalCode && (
                      <div className="invalid-feedback">
                        {errors.address[index].postalCode.message}
                      </div>
                    )}
                  </div>

                  {/* Office Number */}
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput} ${
                        errors.address?.[index]?.officeNumber
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter Phone Number"
                      {...register(`address.${index}.officeNumber`, {
                        required: "This field is required",
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Please enter 10 digit",
                        },
                      })}
                      maxLength={10}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
                      }}
                    />
                    {errors.address?.[index]?.officeNumber && (
                      <div className="invalid-feedback">
                        {errors.address[index].officeNumber.message}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-danger mt-2"
                  onClick={() => remove(index)}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`btn  ${formstyle.addressButton}`}
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

          <button
            type="submit"
            className={`btn  ${formstyle.addressButton}`}
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

export async function getServerSideProps(context) {
  const { query } = context;
  const { page = 1 } = query;

  try {
    const res = await Axios.get(
      `/organization/get-organization?organizationId=${query.id}`,
      { authenticated: true, context }
    );

    return { props: { data: res.data } }; // Pass data as props
  } catch (error) {
    toast.error(error.response?.data?.message || "Check the error");

    return {
      props: {
        error: error.message || "Failed to fetch data",
        data: [],
      },
    };
  }
}

UpdateOrganization.getLayout = function getLayout(page) {
  return <ManagementLayout>{page}</ManagementLayout>;
};

export default UpdateOrganization;
