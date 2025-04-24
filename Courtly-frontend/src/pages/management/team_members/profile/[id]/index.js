import React, { useEffect, useState } from "react";
import formStyle from "@/styles/authForm.module.css";
import profileStyle from "@/styles/userProfile.module.css";
import ManagementLayout from "@/layouts/management";
import { useForm } from "react-hook-form";
import Axios from "@/config/axios";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import File from "@/components/file-input";
import {
  PasswordEye,HideEye
} from "@/utils/icons";
function Profile({ data }) {
  const params = useParams();

  const url = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const [userdata, setUserData] = useState(data || {});
  const [profile, setProfile] = useState(
    data && data.image ? `${url}/${data.image}` : ""
  );
  const [showPassword, setShowPassword] = useState(false);
  
  const [showConformPassword, setshowConformPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); 
  };

  const toggleConformPasswordVisibility = () => {
    setshowConformPassword(!showConformPassword); 
  };

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { ...userdata } }, { mode: "all" });

  const userProfile = watch("updateImage");
  const password = watch("password");
  const router = useRouter();

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      setValue("updateImage", files);
      const fileUrl = URL.createObjectURL(files[0]);
      setProfile(fileUrl);
      return () => {
        URL.revokeObjectURL(fileUrl);
      };
    } else {
      setProfile(""); // Clear the image preview if no file is selected
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      delete data.isDeleted;
      delete data.__v;
      if (data?._id) delete data._id;
      if (data?.addedBy) delete data.addedBy;
      if (data?.image) delete data.image;
      if (data?.isActive || !data?.isActive) delete data.isActive;
      if (data?.status) delete data.status;
      if (data?.createdAt) delete data.createdAt;
      if (data?.updatedBy) delete data.updatedBy;
      if (data?.updatedAt) delete data.updatedAt;
      if (!data?.updateImage) delete data.updateImage;
      if (data.updatePassword) {
        data["password"] = data.updatePassword;
        delete data.updatePassword;
        delete data.confirmPassword;
      } else {
        delete data.password;
        delete data.confirmPassword;
      }

      if (params) data["userId"] = params.id;
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );
      const formData = new FormData();
      Object.keys(filteredData).forEach((key) => {
        const value = filteredData[key];

        if (value !== undefined && value !== null) {
          if (key === "updateImage") {
            if (filteredData[key] && filteredData[key].length > 0) {
              formData.append("image", filteredData[key][0]);
            }
          } else {
            formData.append(key, value);
          }
        }
      });
      const res = await Axios.post("/user/update-user", formData, {
        authenticated: true,
      });
      toast.success("User Profile is updated successfully");
      setUserData(res.data.data);
      reset(res.data.data);
      router.push("/management/team_members");
      setLoading(false);
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "An error occured while updating user profile"
      );
      setLoading(false);
    }
  };

  return (
    <>
      <section className={profileStyle.profileArea}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <form
                className={profileStyle.profileAreaForm}
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="row">
                  <div className="col-md-12">
                    <div className={profileStyle.profileAreaUpload}>
                      <div>
                        <div className={profileStyle.uploadContainer}>
                          <div className={profileStyle.dummyPicWrapper}>
                            {/* <svg
                              className={profileStyle.dummyPic}
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth="0"
                              viewBox="0 0 448 512"
                              height="1em"
                              width="1em"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path>
                            </svg> */}
                            <img
                              src={profile ? profile : ""}
                              className="img-fluid h-100 w-100 object-fit-cover"
                            />
                          </div>

                          {/* Right side: Upload details */}
                          <div className={profileStyle.uploadDetails}>
                            <h4 className={profileStyle.profileFormHeading}>
                              Upload Profile Picture
                            </h4>
                            <p className={profileStyle.uploadInstructions}>
                              You can upload JPG, GIF, or PNG (file size limit
                              is 4 MB).
                              <br />
                              The size should be 190px X 190px.
                            </p>

                            {/* File upload field */}
                            <div className={profileStyle.fileInputWrapper}>
                              <input
                                type="file"
                                id="file"
                                className={`${profileStyle.fileInput} ${
                                  errors.updateImage ? "is-invalid" : ""
                                }`}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/gif"
                              />

                              <label
                                htmlFor="file"
                                className={profileStyle.fileInputLabel}
                              >
                                Choose File
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row  mt-lg-3">
                  <div className="col-md-12">
                    <h2 className={profileStyle.profileFormHeading}>
                      User Profile
                    </h2>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={`${formStyle.commonFormLabel}`}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.firstName ? "is-invalid" : ""
                        }`}
                        {...register("firstName", {
                          required: "This field is required",
                          maxLength: {
                            value: 100,
                            message:
                              "This field must not exceed 100 characters",
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
                  </div>
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.lastName ? "is-invalid" : ""
                        }`}
                        {...register("lastName", {
                          maxLength: {
                            value: 100,
                            message:
                              "This field must not exceed 100 characters",
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
                  </div>
                  <div className="col-lg-6">
                    <label htmlFor="phone" className="form-label">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formStyle.commonFormInput} ${
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
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={`${formStyle.commonFormLabel}`}>
                        Email Address *
                      </label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        {...register("email", {
                          required: "This field is required",
                          pattern: {
                            value:
                              /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email address",
                          },
                        })}
                        placeholder="Enter Email Address"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Designation
                      </label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.designation ? "is-invalid" : ""
                        }`}
                        {...register("designation", {
                          maxLength: {
                            value: 100,
                            message:
                              "This field must not exceed 100 characters",
                          },
                        })}
                        placeholder="Enter Designation"
                      />
                      {errors.designation && (
                        <div className="invalid-feedback">
                          {errors.designation.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Address
                      </label>
                      <textarea
                        className={` ${formStyle.commonFormTextArea} ${
                          errors.address ? "is-invalid" : ""
                        }`}
                        {...register("address")}
                        placeholder="Enter Address"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Landmark
                      </label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.landmark ? "is-invalid" : ""
                        }`}
                        {...register("landmark", {
                          maxLength: {
                            value: 100,
                            message:
                              "This field must not exceed 100 characters",
                          },
                        })}
                        placeholder="Enter Landmark"
                      />
                      {errors.landmark && (
                        <div className="invalid-feedback">
                          {errors.landmark.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>City:</label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.city ? "is-invalid" : ""
                        }`}
                        {...register("city", {
                          maxLength: {
                            value: 100,
                            message:
                              "This field must not exceed 100 characters",
                          },
                        })}
                        placeholder="Enter City"
                      />
                      {errors.city && (
                        <div className="invalid-feedback">
                          {errors.city.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>State</label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.state ? "is-invalid" : ""
                        }`}
                        {...register("state", {
                          maxLength: {
                            value: 100,
                            message:
                              "This field must not exceed 100 characters",
                          },
                        })}
                        placeholder="Enter State"
                      />
                      {errors.state && (
                        <div className="invalid-feedback">
                          {errors.state.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        className={` ${formStyle.commonFormInput} ${
                          errors.zipPostalCode ? "is-invalid" : ""
                        }`}
                        {...register("postalCode", {
                          pattern: {
                            value: /^\d{6}$/,
                            message: "Please enter 6 digit",
                          },
                        })}
                        maxLength={6}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                        }}
                        placeholder="Enter Zip/Postal Code"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Password
                      </label>
                      <input
                        className={` ${formStyle.commonFormInput} ${
                          errors.password ? "is-invalid" : ""
                        }`}
                       
                        type={showPassword ? "text" : "password"}
                        autoFill="off"
                        {...register("updatePassword", {
                          minLength: {
                            value: 8,
                            message:
                              "Password must be at least 8 characters long",
                          },
                          pattern: {
                            value:
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                            message:
                              "Password must include uppercase, lowercase, number, and special character", // Custom pattern for complexity
                          },
                        })}
                        placeholder="password"
                      />
                      {errors.updatePassword && (
                        <p className="text-danger">
                          {errors.updatePassword.message}
                        </p>
                      )}
                      <span
        onClick={togglePasswordVisibility}
        style={{
          position: 'relative',
          right: '-94%',
          bottom: '31px',
          cursor: 'pointer',
        }}
      >
        {showPassword ? <HideEye /> : <PasswordEye />} 
      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Confirm Password
                      </label>
                      <input
                        className={`form-control ${formStyle.commonFormInput}`}
                        type={showConformPassword ? "text" : "password"}
                        {...register("confirmPassword", {
                          validate: (value) => {
                            if (
                              watch("updatePassword") &&
                              value !== watch("updatePassword")
                            ) {
                              return "Passwords do not match";
                            }
                            return true; // Pass validation if no password is provided
                          },
                        })}
                        placeholder="Confirm Your Password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-danger">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                      <span
        onClick={toggleConformPasswordVisibility}
        style={{
          position: 'relative',
          right: '-94%',
          bottom: '31px',
          cursor: 'pointer',
        }}
      >
        {showConformPassword ? <HideEye /> : <PasswordEye />} 
      </span>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className={formStyle.inputFeildsCommonWrapper}>
                      <label className={formStyle.commonFormLabel}>
                        Brief About Yourself
                      </label>
                      <textarea
                        className={` ${formStyle.commonFormTextArea} ${
                          errors.description ? "is-invalid" : ""
                        }`}
                        {...register("description")}
                        placeholder="About Yourself"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className={profileStyle.btnWrapper}>
                      <button
                        type="button"
                        className={`btn  mb-5 mt-3 me-2 ${formStyle.continueBackButton}`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="mb-5 mt-3 commonButton"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit"}
                        <span className="ms-lg-2">
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 448 512"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const res = await Axios.get(`/user/get-user?userId=${query.id}`, {
      authenticated: true,
      context,
    });
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

Profile.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default Profile;
