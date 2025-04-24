import React, { useState,useEffect } from "react";
import ManagementLayout from "@/layouts/management";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Axios from "@/config/axios";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Breadcrumb from "@/components/breadcrumb";
import formstyle from "@/styles/authForm.module.css";

const Usersa = ({ data}) => {
  const { docs: organizations } = data;
  const session = useSession();
  const role = session?.data?.user?.role || null;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    mode: "all",
  });

  const password = watch("password");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teamMembers,setTeamMembers] = useState();
  const organizationId = watch("organizationId");

  useEffect(() => {
    getAllTeamMembers();
  }, [organizationId]);
  
  const getAllTeamMembers = async () => {
    try {
      const query = organizationId ? `&organization=${organizationId}` : "";
      const res = await Axios.get(`/user/get-all-team-members?limit=100${query}`, {
        authenticated: true,
      });
  
      setTeamMembers(res.data.data || []);
    } catch (error) {
      toast.error("An error occurred while getting all organization members");
    }
  };
  

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (data && data.confirmPassword) delete data.confirmPassword;
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );
      const formData = new FormData();

      Object.keys(filteredData).forEach((key) => {
        const value = filteredData[key];

        if (value !== undefined && value !== null) {
          if (key === "image" || key === "signature") {
            if (filteredData[key] && filteredData[key].length > 0) {
              formData.append(key, filteredData[key][0]); // Append only the first file
            }
          } else {
            formData.append(key, value);
          }
        }
      });
      await Axios.post("/user/add-user", formData, { authenticated: true });
      reset();
      setLoading(false);
      toast.success("User is created successfully");
      router.push("/management/team_members");
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const breadcrumbItems = [
    { label: "Team_members", href: "/management/team_members" }, // Last item (non-clickable)
    { label: "add-new" }, // Last item (non-clickable)
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className={`mb-4 ${formstyle.commonFormHeading}`}>
              Add New Team_Member
            </h2>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.firstName ? "is-invalid" : ""
                }`}
                id="firstName"
                {...register("firstName", {
                  required: "This field is required",
                  maxLength: {
                    value: 100,
                    message: "This field must not exceed 100 characters",
                  },
                })}
                placeholder="Enter First Name"
              />
              {errors.firstName && (
                <div className="invalid-feedback">
                  {errors.firstName.message}
                </div>
              )}
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.lastName ? "is-invalid" : ""
                }`}
                id="lastName"
                {...register("lastName", {
                  maxLength: {
                    value: 100,
                    message: "This field must not exceed 100 characters",
                  },
                  validate: (value) => {
                    if (watch("firstName") && value == watch("firstName")) {
                      return "last name should not be match to first name";
                    }
                    return true;
                  },
                })}
                placeholder="Enter Last Name"
              />
              {errors.lastName && (
                <div className="invalid-feedback">
                  {errors.lastName.message}
                </div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.email ? "is-invalid" : ""
                }`}
                autoComplete="off"
                id="email"
                {...register("email", {
                  required: "This field is required",
                  pattern: {
                    value: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter Email"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            {role && role == "super-admin" && (
              <div className="col-md-4 mb-3">
                <label htmlFor="age" className="form-label">
                  Organizations
                </label>
                <select
                  className={`form-select ${
                    errors.organizationId ? "is-invalid" : ""
                  }`}
                  aria-label="Default select example"
                  {...register("organizationId", {
                    required: "This field is required",
                  })}
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

            <div className="col-md-4 mb-3">
              <label htmlFor="manager" className="form-label">
                Manager *
              </label>
              <select
                className={`form-select`}
                aria-label="Default select example"
                {...register("manager")}
              >
                <option value="" hidden>
                  Please select
                </option>
                {teamMembers?.docs &&
                  Array.isArray(teamMembers?.docs) &&
                  teamMembers?.docs.length > 0 &&
                  teamMembers?.docs.map((item, index) => {
                    return (
                      <option key={index} value={item._id}>
                        {item.firstName} {item.lastName}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                type="text"
                className={`form-control ${formstyle.commonFormInput}`}
                id="department"
                {...register("department", {
                  maxLength: {
                    value: 100,
                    message: "This field must not exceed 100 characters",
                  },
                })}
                placeholder="Enter Department Name"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="signature" className="form-label">
                User Signature
              </label>
              <input
                type="file"
                className={`form-control ${formstyle.commonFormInput}`}
                id="signature"
                {...register("signature", {
                  validate: {
                    format: (signature) => {
                      if (!signature || signature.length === 0) return true; // Allow empty input unless required validation is needed.

                      const validFormats = [
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                      ];
                      return (
                        validFormats.includes(signature[0]?.type) ||
                        "Unsupported file format"
                      );
                    },
                  },
                })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="role" className="form-label">
                Role *
              </label>
              <select
                className={`form-select ${errors.role ? "is-invalid" : ""}`}
                aria-label="Default select example"
                {...register("role", {
                  required: "This field is required",
                })}
              >
                <option value="" hidden>
                  Select Role
                </option>
                <option value="admin">Admin</option>
                <option value="team-member">Organization Member</option>
                <option value="accountant">Accountant</option>
              </select>
              {errors.role && (
                <div className="invalid-feedback">{errors.role.message}</div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="image" className="form-label">
                User Image
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
                <div className="invalid-feedback">{errors?.image?.message}</div>
              )}
            </div>

            <div className="col-md-4 mb-3">
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
            <div className="col-md-4 mb-3">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.password ? "is-invalid" : ""
                }`}
                autoComplete="off"
                id="password"
                {...register("password", {
                  required: "Password is required", // Required field
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long", // Minimum length
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                    message:
                      "Password must include uppercase, lowercase, number, and special character", // Custom pattern for complexity
                  },
                })}
                placeholder="Enter Your Password"
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                id="confirmPassword"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                placeholder="Confirm Your Password"
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mb-2 mt-4 commonButton"
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
    const res = await Axios.get("/organization/get-all-organizations?limit=100", {
        authenticated: true,
        context,
      })

    return {
      props: {
        data: res.data.data,
      },
    }; // Pass data as props
  } catch (error) {
    toast.error(error.response?.data?.message || "Check the error");

    return {
      props: {
        error: error.message || "Failed to fetch data",
        data: []
      },
    };
  }
}

Usersa.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default Usersa;
