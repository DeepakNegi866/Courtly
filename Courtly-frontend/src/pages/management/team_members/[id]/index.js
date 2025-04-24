import React, { useState, useEffect } from "react";
import ManagementLayout from "@/layouts/management";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Axios from "@/config/axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { getSession } from "next-auth/react";
import Breadcrumb from "@/components/breadcrumb";
import formstyle from "@/styles/authForm.module.css";

const UpdateUser = ({ data }) => {
  const { data: user } = data;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { ...user } }, { mode: "all" });

  const router = useRouter();
  const [organizations, setOrganizations] = useState();
  const [teamMembers,setTeamMembers] = useState();
  const [loading, setLoading] = useState(false);
  const organizationId = watch("organizationId");

  useEffect(() => {
    getAllOrganization();
  }, []);

  useEffect(()=>{
    getAllTeamMembers();
  },[organizationId])

  const getAllTeamMembers = async () => {
    try {
      const res = await Axios.get(`/user/get-all-team-members?limit=100&organization=${organizationId}`, {
        authenticated: true,
      });
      setTeamMembers(res.data.data || []);
    } catch (error) {
      toast.error("An error occured while getting all organization member");
    }
  };
  const getAllOrganization = async () => {
    try {
      const res = await Axios.get("/organization/get-all-organizations", {
        authenticated: true,
      });
      setOrganizations(res?.data?.data?.docs);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    delete data.createdAt;
    delete data.isDeleted;
    delete data.image;
    delete data.password;
    delete data.signature;
    delete data._id;
    delete data.__v;
    delete data.status;
    delete data.updatedAt;
    delete data.addedBy;
    delete data.updatedBy;
    delete data.isActive;

    if (data && data.updateImage && data.updateImage.length == 0)
      delete data.updateImage;

    if (data && data.updateSignature && data.updateSignature.length == 0)
      delete data.updateSignature;

    if (user && user._id) {
      data["userId"] = user._id;
    }

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );
    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(filteredData).forEach((key) => {
        const value = filteredData[key];

        if (value !== undefined && value !== null) {
          if (key === "updateImage" || key === "updateSignature") {
            if (filteredData[key] && filteredData[key].length > 0) {
              const newKey = (key === "updateImage" ? "image" : "signature");
              formData.append(newKey, filteredData[key][0]); // Append only the first file
            }
          } else {
            formData.append(key, value);
          }
        }
      });
      await Axios.post("/user/update-user", formData, { authenticated: true });
      reset();
      setLoading(false);
      toast.success("User is updated successfully");
      router.push("/management/team_members");
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const breadcrumbItems = [
    { label: "Team_members", href: "/management/team_members" }, // Last item (non-clickable)
    { label: "Edit" }, // Last item (non-clickable)
    { label: user && user.firstName }, // Last item (non-clickable)
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className={`mb-4 ${formstyle.commonFormHeading}`}>
              Update Team_Member
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
                id="email"
                {...register("email", {
                  required: "This field is required",
                  pattern: {
                    value: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter Email Address"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

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
                    <option
                      key={index}
                      value={item._id}
                      selected={
                        user?.organizationId == item._id ? item._id : ""
                      }
                    >
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
                      <option key={index} value={item._id}
                      selected={
                        user?.manager == item._id ? item._id : ""
                      }>
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
              <label htmlFor="updateSignature" className="form-label">
                User Signature
              </label>
              <input
                type="file"
                className={`form-control ${formstyle.commonFormInput}`}
                id="updateSignature"
                {...register("updateSignature", {
                  validate: {
                    format: (updateSignature) => {
                      if (!updateSignature || updateSignature.length === 0) return true; // Allow empty input unless required validation is needed.

                      const validFormats = [
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                      ];
                      return (
                        validFormats.includes(updateSignature[0]?.type) ||
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
              <label htmlFor="updateImage" className="form-label">
                User Image
              </label>
              <input
                type="file"
                className={`form-control ${formstyle.commonFormInput} ${
                  errors.updateImage ? "is-invalid" : ""
                }`}
                id="updateImage"
                {...register("updateImage", {
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
              {errors.updateImage && (
                <div className="invalid-feedback">
                  {errors?.updateImage?.message}
                </div>
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mb-4 mt-4 commonButton"
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
  const { query } = context;
  const { page = 1 } = query;
  try {
    const res = await Axios.get(`/user/get-user?userId=${query.id}`, {
        authenticated: true,
        context,
      })
    return {
       props:
        {
           data: res.data,
        }}; // Pass data as props
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

UpdateUser.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default UpdateUser;
