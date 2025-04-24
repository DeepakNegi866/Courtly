import React, { useState, useEffect } from "react";
import ManagementLayout from "@/layouts/management";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Axios from "@/config/axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Breadcrumb from "@/components/breadcrumb";
import formstyle from "@/styles/authForm.module.css";

const AddClient = ({ data }) => {
  const { docs: organizations } = data;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
  } = useForm(
    {
      mode: "all",
    },
    {
      defaultValues: {
        contacts: { fullName: "", email: "", phoneNumber: "", designation: "" },
        officeAddress: {
          address1: "",
          address2: "",
          city: "",
          postalCode: "",
          country: "",
          state: "",
        },
        homeAddress: {
          address1: "",
          address2: "",
          city: "",
          postalCode: "",
          country: "",
          state: "",
        },
      },
    }
  );

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sameAsOffice, setSameAsOffice] = useState(false);
  const session = useSession();
  const role = session?.data?.user?.role || null;

  const cleanObject = (obj) => {
    // Iterate over all keys of the object
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => {
          // Keep the key if the value is not an empty string, null, or undefined
          return value !== "" && value !== null && value !== undefined;
        })
        .map(([key, value]) => {
          // If value is an object, recursively clean it
          if (value && typeof value === "object" && !Array.isArray(value)) {
            value = cleanObject(value); // Recursively clean nested objects
          }
          return [key, value]; // Return the cleaned key-value pair
        })
    );
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const filteredPayload = cleanObject(data);

      await Axios.post("/client/add-client", filteredPayload, {
        authenticated: true,
      });
      reset();
      setLoading(false);
      toast.success("Client is created successfully");
      router.push("/management/clients");
    } catch (error) {
      setLoading(false);
      toast.error(error.response.data.message || "Failed to create client");
    }
  };

  useEffect(() => {
    if (sameAsOffice) {
      const officeAddress = getValues("officeAddress");
      setValue("homeAddress", { ...officeAddress });
    } else {
      // Clear home address fields when checkbox is unchecked
      setValue("homeAddress", {
        address1: "",
        address2: "",
        city: "",
        postalCode: "",
        country: "",
        state: "",
      });
    }
  }, [sameAsOffice]);

  const breadcrumbItems = [
    { label: "Clients", href: "/management/clients" }, // Last item (non-clickable)
    { label: "Add New", href: "/management/clients/add-new" }, // Last item (non-clickable)
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className={`mb-4 ${formstyle.commonFormHeading}`}>
              Add New Client
            </h2>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="fullname" className="form-label">
                Full Name*
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.fullName ? "is-invalid" : ""
                }`}
                id="fullname"
                {...register("fullName", {
                  required: "This field is required",
                  maxLength: {
                    value: 100,
                    message: "This field must not exceed 100 characters",
                  },
                })}
                placeholder="Enter Full Name"
              />
              {errors.fullName && (
                <div className="invalid-feedback">
                  {errors.fullName.message}
                </div>
              )}
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Nick Name*</label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.nickName ? "is-invalid" : ""
                }`}
                {...register("nickName", {
                  required: "This field is required",
                  maxLength: {
                    value: 50,
                    message: "This field must not exceed 50 characters",
                  },
                })}
                placeholder="Enter Nick Name"
              />
              {errors.nickName && (
                <div className="invalid-feedback">
                  {errors.nickName.message}
                </div>
              )}
            </div>

            <div className="col-md-3 mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.email ? "is-invalid" : ""
                }`}
                id="email"
                placeholder="Enter Email"
                {...register("email", {
                  pattern: {
                    value: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>
            {role && role == "super-admin" && (
              <div className="col-md-3 mb-3">
                <label className="form-label">Organizations*</label>
                <select
                  {...register("organizationId", {
                    required: "This field is required",
                  })}
                  className={`form-select form-control ${
                    errors.organizationId ? "is-invalid" : ""
                  }`}
                  aria-label="Default select example"
                >
                  <option value="" hidden>
                    Select Organization
                  </option>
                  {organizations &&
                    Array.isArray(organizations) &&
                    organizations.length > 0 &&
                    organizations.map((item, index) => (
                      <option key={index} value={item._id}>
                        {item.companyName}
                      </option>
                    ))}
                </select>
                {errors.organizationId && (
                  <div className="invalid-feedback">
                    {errors.organizationId.message}
                  </div>
                )}
              </div>
            )}

            <div className="col-md-3 mb-3">
              <label htmlFor="age" className="form-label">
                Age
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput}`}
                id="age"
                placeholder="Enter Your Age"
                {...register("age")}
                maxLength={3}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.phoneNumber ? "is-invalid" : ""
                }`}
                id="phone"
                {...register("phoneNumber", {
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Please enter 10 digit",
                  },
                })}
                maxLength={10} // Ensure the user can only type 10 digits
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                placeholder="Enter Phone Number"
              />
              {errors.phoneNumber && (
                <div className="invalid-feedback">
                  {errors.phoneNumber.message}
                </div>
              )}
            </div>

            <div className="col-md-3 mb-3">
              <label htmlFor="fathername" className="form-label">
                Father Name
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.fatherName ? "is-invalid" : ""
                }`}
                id="fathername"
                {...register("fatherName", {
                  maxLength: {
                    value: 100,
                    message: "This field must not exceed 100 characters",
                  },
                })}
                placeholder="Enter Father Name"
              />
              {errors.fatherName && (
                <div className="invalid-feedback">
                  {errors.fatherName.message}
                </div>
              )}
            </div>

            <div className="col-md-3 mb-3">
              <label htmlFor="companyName" className="form-label">
                Company Name
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput}`}
                id="companyName"
                {...register("companyName")}
                placeholder="Enter Company Name"
              />
            </div>

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
            <div className="col-md-3 mb-3">
              <label className="form-label">Company TIN</label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.TIN ? "is-invalid" : ""
                }`}
                placeholder="Enter TIN Number"
                {...register("TIN", {
                  pattern: {
                    value: /^[A-Z0-9]{11}$/, // Allow only uppercase letters and numbers
                    message: "Invalid TIN", // Error message
                  },
                })}
                maxLength={11}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                }}
              />
              {errors.TIN && (
                <div className="invalid-feedback">{errors.TIN.message}</div>
              )}
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Company GSTN</label>
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
            <div className="col-md-3 mb-3">
              <label className="form-label">Company PAN Number</label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.PAN ? "is-invalid" : ""
                }`}
                placeholder="Enter Company Pan Number"
                {...register("PAN", {
                  pattern: {
                    value: /^[A-Z0-9]{10}$/, // Allow only uppercase letters and numbers
                    message: "Invalid PAN card number",
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

            <div className="col-md-3 mb-3">
              <label htmlFor="hourlyRate" className="form-label">
                Hourly Rate
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${formstyle.commonFormInput}`}
                  id="hourlyRate"
                  {...register("hourlyRate")}
                  placeholder="Enter Hourly Rate"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                />
                <span
                  className={`input-group-text ${formstyle.hourlyRateInput}`}
                >
                  ₹
                </span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Office Address</label>
            <div className="border p-3 mb-2 rounded">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.officeAddress?.address1 ? "is-invalid" : ""
                    } `}
                    {...register("officeAddress.address1")}
                    placeholder="Enter Address Line 1"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}`}
                    {...register("officeAddress.address2")}
                    placeholder="Enter Address Line 2 "
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}  ${
                      errors.officeAddress?.country ? "is-invalid" : ""
                    }`}
                    {...register("officeAddress.country")}
                    placeholder="Enter Country"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.officeAddress?.state ? "is-invalid" : ""
                    }`}
                    {...register("officeAddress.state")}
                    placeholder="Enter State"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.officeAddress?.city ? "is-invalid" : ""
                    } `}
                    {...register("officeAddress.city")}
                    placeholder="Enter City"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.officeAddress?.postalCode ? "is-invalid" : ""
                    }`}
                    {...register("officeAddress.postalCode")}
                    placeholder="Enter Postal Code"
                    maxLength={6}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkbox for same as office address */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="sameAsOfficeCheckbox"
              checked={sameAsOffice}
              onChange={() => setSameAsOffice(!sameAsOffice)}
            />
            <label className="form-check-label" htmlFor="sameAsOfficeCheckbox">
              Same as Office Address
            </label>
          </div>

          {/* Home Address */}
          <div className="mb-3">
            <label className="form-label">Permanent Address</label>
            <div className="border p-3 mb-2 rounded">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}  ${
                      errors.homeAddress?.address1 ? "is-invalid" : ""
                    }`}
                    {...register("homeAddress.address1")}
                    placeholder="Enter Address Line 1 "
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}`}
                    {...register("homeAddress.address2")}
                    placeholder="Enter Address Line 2 "
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.homeAddress?.country ? "is-invalid" : ""
                    }`}
                    {...register("homeAddress.country")}
                    placeholder="Enter Country "
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.homeAddress?.state ? "is-invalid" : ""
                    }`}
                    {...register("homeAddress.state")}
                    placeholder="Enter State "
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.homeAddress?.city ? "is-invalid" : ""
                    }`}
                    {...register("homeAddress.city")}
                    placeholder="Enter City "
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.homeAddress?.postalCode ? "is-invalid" : ""
                    }`}
                    {...register("homeAddress.postalCode")}
                    placeholder="Enter Postal Code"
                    maxLength={6}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Person Details</label>
            <div className="border p-3 mb-2 rounded">
              <div className="row">
                {/* City */}
                <div className="col-md-3 mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}  ${
                      errors.contacts?.fullName ? "is-invalid" : ""
                    }`}
                    {...register(`contacts.fullName`, {
                      maxLength: {
                        value: 100,
                        message: "This field must not exceed 100 characters",
                      },
                    })}
                    placeholder="Enter Full Name "
                  />
                  {errors.contacts?.fullName && (
                    <div className="invalid-feedback">
                      {errors.contacts?.fullName.message}
                    </div>
                  )}
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput} ${
                      errors.contacts?.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter Email"
                    {...register("contacts.email", {
                      pattern: {
                        value:
                          /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.contacts?.email && (
                    <div className="invalid-feedback">
                      {errors.contacts?.email.message}
                    </div>
                  )}
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}  ${
                      errors.contacts?.phoneNumber ? "is-invalid" : ""
                    }`}
                    {...register(`contacts.phoneNumber`)}
                    maxLength={10} // Ensure the user can only type 10 digits
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                    placeholder="Enter Phone Number "
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className={`form-control ${formstyle.commonFormInput}`}
                    {...register(`contacts.designation`)}
                    placeholder="Enter Designation "
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="mb-5 mt-3 commonButton"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const res = await Axios.get(
      "/organization/get-all-organizations?limit=100",
      {
        authenticated: true,
        context,
      }
    );

    return { props: { data: res.data.data } }; // Pass data as props
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

AddClient.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;
export default AddClient;
