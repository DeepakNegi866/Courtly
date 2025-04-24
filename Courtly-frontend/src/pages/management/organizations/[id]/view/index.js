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

const url = process.env.NEXT_PUBLIC_IMAGE_URL || "";

const ViewOrganization = ({ data }) => {
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
  });

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
            View Organization
          </h2>
        </div>
        <div className={formstyle.addOrganizationform}>
          <div className="row">
            {organizationData?.logo && (
              <div
                className={`${formstyle.organizationCompanyLogoDiv} col-md-4 mb-3 text-center`}
              >
                <label htmlFor="updateLogo" className="form-label">
                  Company Logo
                </label>
                <img
                  src={
                    organizationData?.logo
                      ? `${url}/${organizationData.logo}`
                      : ""
                  }
                  alt="Organization Logo"
                  className={`${formstyle.organizationCompanyLogo} col-md-4 mb-3`}
                />
              </div>
            )}
          </div>
          <div className="row">
            {/* Company Name */}
            <div className="col-md-4 mb-3">
              <label htmlFor="companyName" className="form-label">
                Company Name
              </label>
              <input
                type="text"
                className={`form-control`}
                placeholder="Enter Company Name"
                id="companyName"
                value={organizationData.companyName || ""}
              />
            </div>

            {/* Company Email */}
            <div className="col-md-4 mb-3">
              <label htmlFor="companyEmail" className="form-label">
                Company Email
              </label>
              <input
                type="email"
                className={`form-control `}
                placeholder="Enter Company Email"
                id="companyEmail"
                value={organizationData.companyEmail || ""}
              />
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
                value={organizationData.website || ""}
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
                className={`form-control ${formstyle.commonFormInput} `}
                placeholder="Enter GSTN Number"
                id="GSTN"
                value={organizationData.GSTN || ""}
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
                value={organizationData.PAN || ""}
              />
            </div>

            {/* Company logo */}

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
                value={organizationData.description || ""}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-3">
            <label className="form-label">Address</label>
            {organizationData.address &&
              Array.isArray(organizationData.address) &&
              organizationData.address.map((item, index) => (
                <div key={item.id} className="border p-3 mb-2 rounded">
                  <div className="row">
                    {/* City */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className={`form-control`}
                        value={item.city || ""}
                        placeholder="Enter City"
                      />
                    </div>

                    {/* State */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className={`form-control `}
                        placeholder="Enter State"
                        value={item.state || ""}
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        className={`form-control `}
                        placeholder="Enter Postal Code"
                        value={item.postalCode || ""}
                      />
                    </div>

                    {/* Office Number */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Office Number</label>
                      <input
                        type="text"
                        className={`form-control `}
                        placeholder="Enter Office Number"
                        value={item.officeNumber}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
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

ViewOrganization.getLayout = function getLayout(page) {
  return <ManagementLayout>{page}</ManagementLayout>;
};

export default ViewOrganization;
