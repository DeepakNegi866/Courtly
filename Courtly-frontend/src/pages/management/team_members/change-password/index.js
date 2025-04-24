import React, { useState } from "react";
import formstyle from "@/styles/authForm.module.css";
import ManagementLayout from "@/layouts/management";
import { useForm } from "react-hook-form";
import Axios from "@/config/axios";
import { toast } from "react-toastify";

const Changepassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  
  const [loading,setLoading] = useState(false)

  const onSubmit = async(formData) => {
    try{
        if(loading) return null;
        setLoading(true);
        await Axios.post("/user/change-password",formData, {
            authenticated : true
           }); 
        
        toast.success("Password changed successfully");
        reset();
    }
    catch(error){
        toast.error(error?.response?.data?.message ||  "An error occured while updating user profile")
    }
    finally{
        setLoading(false);
    }
  };

  const password = watch("password");

  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className={`mb-4 ${formstyle.commonFormHeading}`}>
              Change Password
            </h2>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="password"
                className={`form-control ${formstyle.commonFormInput}`}
                placeholder="Enter New Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p style={{ color: "red" }}>{errors.password.message}</p>
              )}
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`form-control ${formstyle.commonFormInput}`}
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="mb-4 mt-4 commonButton"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

Changepassword.getLayout = (page) => (
  <ManagementLayout>{page}</ManagementLayout>
);

export default Changepassword;
