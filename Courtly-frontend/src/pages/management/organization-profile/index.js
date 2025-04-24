import React, { useState } from "react";
import ManagementLayout from "@/layouts/management";
import formStyle from "@/styles/authForm.module.css";
import profileStyle from "@/styles/userProfile.module.css";
import formstyle from "@/styles/authForm.module.css";
import { useForm, useFieldArray } from "react-hook-form";
import Axios from "@/config/axios";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import File from "@/components/file-input";
import { useRouter } from "next/router";
import { AddIcon, RightArrow, TrashIcon } from "@/utils/icons";

const OrganizationProfile = ({ data }) => {
  const { _id: organizationId } = data;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { ...data } });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "address",
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      delete data.isDeleted;
      delete data.__v;
      if (data?._id) delete data._id;
      if (data?.addedBy) delete data.addedBy;
      if (data?.createdAt) delete data.createdAt;
      if (data?.updatedAt) delete data.updatedAt;
      delete data.address[0]._id;
      delete data.logo;
      delete data.status;
      delete data.updateLogo;

      if (organizationId) data["organizationId"] = organizationId;
      await Axios.post("/user/update-organization-profile", data, {
        authenticated: true,
      });
      reset();
      setLoading(false);
      toast.success("Organization is updated successfully");
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to update organization"
      );
    }
  };

  const [loading, setLoading] = useState(false);

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
                            {/* <img src={profile} className="img-fluid"/> */}
                          </div>

                          {/* Right side: Upload details */}
                          <div className={profileStyle.uploadDetails}>
                            <h4 className={profileStyle.profileFormHeading}>
                              Organizations Profile Picture
                            </h4>
                            <p className={profileStyle.uploadInstructions}>
                              You can upload JPG, GIF, or PNG (file size limit
                              is 4 MB).
                              <br />
                              The size should be 190px X 190px.
                            </p>

                            {/* File upload field */}
                            {/* <div className={profileStyle.fileInputWrapper}>
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
                              
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row  mt-lg-3">
                  <div className="col-md-12">
                    <h2 className={profileStyle.profileFormHeading}>
                      Organizations Profile
                    </h2>
                  </div>
                </div>
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
                          value:
                            /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
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
                  <div className="col-md-4 mb-3">
                    <label htmlFor="GSTN" className="form-label">
                      GSTN
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput}`}
                      placeholder="Enter GSTN Number"
                      id="GSTN"
                      {...register("GSTN")}
                    />
                  </div>

                  {/* PAN */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="PAN" className="form-label">
                      PAN
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formstyle.commonFormInput}`}
                      id="PAN"
                      placeholder="Enter PAN Number"
                      {...register("PAN")}
                    />
                  </div>

                  {/* Company logo */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="updateLogo" className="form-label">
                      Company Logo
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="updateLogo"
                      {...register("updateLogo")}
                    />
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
                        {/* City */}
                        <div className="col-md-3 mb-3">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formstyle.commonFormInput
                            } ${
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

                        {/* State */}
                        <div className="col-md-3 mb-3">
                          <label className="form-label">State</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formstyle.commonFormInput
                            } ${
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

                        {/* Postal Code */}
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Postal Code</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formstyle.commonFormInput
                            } ${
                              errors.address?.[index]?.postalCode
                                ? "is-invalid"
                                : ""
                            }`}
                            placeholder="Enter Postal Code"
                            {...register(`address.${index}.postalCode`, {
                              required: "Postal Code is required",
                              maxLength: {
                                value: 6,
                                message: "Max length is 6",
                              },
                            })}
                            maxLength={6}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              ); // Allow only digits
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
                          <label className="form-label">Office Number</label>
                          <input
                            type="text"
                            className={`form-control ${
                              formstyle.commonFormInput
                            } ${
                              errors.address?.[index]?.officeNumber
                                ? "is-invalid"
                                : ""
                            }`}
                            placeholder="Enter Office Number"
                            {...register(`address.${index}.officeNumber`, {
                              required: "Office Number is required",
                              maxLength: {
                                value: 10,
                                message: "Max length is 10",
                              },
                            })}
                            maxLength={10}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              ); // Allow only digits
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
          </div>
        </div>
      </section>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const res = await Axios.get("/user/organization-profile", {
      authenticated: true,
      context,
    });

    return { props: { data: res.data.data } };
  } catch (error) {
    console.warn(error.message || "Unable to reach server. || User");

    return {
      props: {
        error: error.message || "Failed to fetch data",
        data: [],
      },
    };
  }
}

OrganizationProfile.getLayout = (page) => (
  <ManagementLayout>{page}</ManagementLayout>
);

export default OrganizationProfile;
