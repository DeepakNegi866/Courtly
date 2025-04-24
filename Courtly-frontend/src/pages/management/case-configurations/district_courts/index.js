import React, { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import CaseConfigurationsLayout from "@/layouts/case-configurations";
import ReactResponsiveTable from "@/components/super-responsive-table";
import { useRouter } from "next/router";
import Axios from "@/config/axios";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { useForm } from "react-hook-form";
import modalStyle from "@/styles/modal.module.css";
import tableStyle from "@/styles/table-nav.module.css";
import formStyle from "@/styles/authForm.module.css";
import { Edit, Trash, Add } from "@/utils/icons";
import createExcerpt from "@/config/excerptDescription";
import { render } from "@fullcalendar/core/preact";

const DistrictCourts = ({ allDistrictCourts, districts }) => {
  const {
    docs: districtCourts,
    page,
    totalPages,
    limit,
    totalDocs = 0,
  } = allDistrictCourts;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [preData, setPreData] = useState();
  const router = useRouter();
  const closeAddModal = useRef();
  const closeUpdateModal = useRef();
  const { query } = router;

  const {
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    reset: updateReset,
    setValue,
    formState: { errors: updateErrors },
  } = useForm();

  useEffect(() => {
    if (preData) {
      setValue("title", preData.title || "");
      setValue("districtId", preData.districtId || "");
      setValue("description", preData.description || "");
    }
  }, [preData, setValue]);

  if (totalPages < page && totalPages > 0) {
    router.push({
      pathname: router.pathname,
      query: { ...query, page: totalPages },
    });
  }

  const columns = [
    {
      title: "Title",
      key: "title",
      render: (value) => {
        return <span>{createExcerpt(value, 50)}</span>;
      },
    },
    {
      title: "Description",
      key: "description",
      render: (value) => {
        return <span>{createExcerpt(value, 50)}</span>;
      },
    },
    {
      title: "District",
      key: "districtId",
      render: (value, row) => {
        return <span>{createExcerpt(row?.districtId?.title, 50)}</span>;
      },
    },
    {
      title: "Actions",
      key: "_id",
      render: (value, row, index) => {
        return (
          <>
            <button
              className="btn ps-0"
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#updateModal"
              onClick={() => setPreData(row)}
            >
              <span
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Edit"
              >
                <Edit />
              </span>
            </button>
            <button
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Delete"
              className="btn ps-0"
              onClick={() => handleDeleteAction(value)}
            >
              <span>
                <Trash />
              </span>
            </button>
          </>
        );
      },
    },
  ];

  const handleDeleteAction = async (districtCourtId) => {
    try {
      await Axios.delete(
        `/district-court/delete-district_court/${districtCourtId}`,
        { authenticated: true }
      );
      toast.success("District court is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete District Court"
      );
    }
  };

  const handlePageClick = useCallback(
    debounce((event) => {
      const selectedPage = event.selected + 1;
      if (selectedPage !== page) {
        router.push({
          pathname: router.pathname,
          query: { ...query, page: selectedPage },
        });
      }
    }, 300),
    [query]
  );

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      await Axios.post("/district-court/add-district_court", filteredData, {
        authenticated: true,
      });
      reset();
      closeAddModal?.current?.click();
      toast.success("District court is created successfully");
      setLoading(false);
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to create District court"
      );
    }
  };

  const update = async (data) => {
    try {
      setLoading(true);
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );
      if (preData) filteredData["districtCourtId"] = preData?._id;
      await Axios.post("/district-court/update-district_court", filteredData, {
        authenticated: true,
      });
      reset();
      closeUpdateModal?.current?.click();
      toast.success("District court is updated successfully");
      setLoading(false);
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to create District court"
      );
    }
  };
  return (
    <section>
      <div className="container mt-4">
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="pagetitle">
              <h2 className={tableStyle.tableRunningHeading}>
                All District Courts-({totalDocs})
              </h2>
            </div>
            <button
              type="button"
              className={`${tableStyle.tableButton} btn`}
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
            >
              <span className="me-2">
                <Add />
              </span>
              <span>Add New</span>
            </button>
          </div>
          {totalDocs > 0 ? (
            <div className="row">
              <div className="col-md-12">
                <div className="pt-4 super-responsive-table">
                  <ReactResponsiveTable
                    columns={columns}
                    data={districtCourts}
                    serialize={true}
                    initialCount={limit * (page - 1)}
                  />
                  {totalPages > 1 && (
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel=">"
                      initialPage={page - 1}
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={5}
                      pageCount={totalPages}
                      previousLabel="<"
                      renderOnZeroPageCount={null}
                      className="react-pagination "
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="container-fluid py-5 text-secondary">
              <div className="row h-100 w-100">
                <div className="col-12 text-center my-auto">
                  <h1>NO DATA FOUND</h1>
                </div>
              </div>
            </div>
          )}

          {/* add new district court modal */}
          <div
            className="modal fade"
            id="exampleModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className={modalStyle.modalHeader}>
                  <h1
                    className={`modal-title ${modalStyle.modalTitle}`}
                    id="exampleModalLabel"
                  >
                    Add District Court
                  </h1>
                  <button
                    type="button"
                    ref={closeAddModal}
                    className={`btn ${modalStyle.modalButtn}`}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => reset()}
                  >
                    X
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="title" className="form-label">
                          Title *
                        </label>
                        <input
                          type="text"
                          placeholder="Title"
                          className={`form-control ${
                            formStyle.commonFormInput
                          } ${errors.title ? "is-invalid" : ""}`}
                          id="title"
                          {...register("title", {
                            required: "This field is required",
                            maxLength: {
                              value: 100,
                              message: "Title must not exceed 100 characters",
                            },
                          })}
                        />
                        {errors.title && (
                          <div className="invalid-feedback">
                            {errors.title.message}
                          </div>
                        )}
                      </div>

                      <div className="col-md-12 mb-3">
                        <label htmlFor="districtId" className="form-label">
                          Districts *
                        </label>
                        <select
                          className={`${formStyle.commonFormSelect} ${
                            errors.districtId ? "is-invalid form-select" : ""
                          }`}
                          id="districtId"
                          {...register("districtId", {
                            required: "This field is required",
                          })}
                        >
                          <option value="" hidden>
                            Select District
                          </option>
                          {districts?.docs &&
                            Array.isArray(districts?.docs) &&
                            districts.docs.map((item, index) => (
                              <option key={index} value={item._id}>
                                {item.title}
                              </option>
                            ))}
                        </select>
                        {errors.districtId && (
                          <div className="invalid-feedback">
                            {errors.districtId.message}
                          </div>
                        )}
                      </div>

                      <div className="col-md-12">
                        <label htmlFor="description" className="form-label">
                          Description
                        </label>
                        <textarea
                          placeholder="Description"
                          className={`form-control ${
                            formStyle.commonFormTextArea
                          } ${errors.description ? "is-invalid" : ""}`}
                          id="description"
                          {...register("description")}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className={`${modalStyle.modalButtnWrapper} mt-3`}>
                      <button
                        type="submit"
                        className="commonButton"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* update district court modal*/}
          <div
            className="modal fade"
            id="updateModal"
            tabindex="-1"
            aria-labelledby="updateModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className={modalStyle.modalHeader}>
                  <h1
                    className={`modal-title ${modalStyle.modalTitle}`}
                    id="updateModalLabel"
                  >
                    Update District Court
                  </h1>
                  <button
                    type="button"
                    ref={closeUpdateModal}
                    className={`btn ${modalStyle.modalButtn}`}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => updateReset()}
                  >
                    X
                  </button>
                </div>
                <div className={`modal-body ${modalStyle.modalFormWrapper}`}>
                  <form onSubmit={updateHandleSubmit(update)}>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="updateTitle" className="form-label">
                          Title *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            formStyle.commonFormInput
                          } ${updateErrors.title ? "is-invalid" : ""}`}
                          defaultValue={preData ? preData.title : ""}
                          id="updateTitle"
                          {...updateRegister("title", {
                            required: "This field is required",
                            maxLength: {
                              value: 100,
                              message: "Title must not exceed 100 characters",
                            },
                          })}
                        />
                        {updateErrors.title && (
                          <div className="invalid-feedback">
                            {updateErrors.title.message}
                          </div>
                        )}
                      </div>
                      <div className="col-md-12 mb-3">
                        <label
                          htmlFor="updateDistrictId"
                          className="form-label"
                        >
                          Districts *
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            updateErrors.districtId ? "is-invalid" : ""
                          }`}
                          id="updateDistrictId"
                          {...updateRegister("districtId")}
                        >
                          <option value="" hidden>
                            Select District
                          </option>
                          {districts &&
                            districts?.docs &&
                            Array.isArray(districts?.docs) &&
                            districts?.docs.map((item, index) => {
                              return (
                                <option
                                  key={index}
                                  value={item._id}
                                  selected={
                                    preData?.districtId == item._id
                                      ? item._id
                                      : ""
                                  }
                                >
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                        {updateErrors.districtId && (
                          <div className="invalid-feedback">
                            {updateErrors.districtId.message}
                          </div>
                        )}
                      </div>
                      <div className="col-md-12">
                        <label
                          htmlFor="updateDescription"
                          className="form-label"
                        >
                          Description
                        </label>
                        <textarea
                          type="text"
                          className={`form-control ${
                            formStyle.commonFormTextArea
                          } ${errors.discription ? "is-invalid" : ""}`}
                          defaultValue={
                            preData?.description ? preData.description : ""
                          }
                          id="updateDescription"
                          {...updateRegister("description")}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className={`${modalStyle.modalButtnWrapper} mt-3`}>
                      <button
                        type="submit"
                        className="commonButton"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const { page = 1 } = query;
    const [districtCourtRes, districtRes] = await Promise.all([
      Axios.get(`/district-court/get-all-district_courts?page=${page}`, {
        authenticated: true,
        context,
      }),
      Axios.get("/district/get-all-districts?limit=100", {
        authenticated: true,
        context,
      }),
    ]);

    return {
      props: {
        allDistrictCourts: districtCourtRes.data.data, // Adjust based on your API response
        districts: districtRes.data.data,
      },
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Check the error");

    return {
      props: {
        error: error.message || "Failed to fetch data",
        allDistrictCourts: [],
        districts: [],
      },
    };
  }
}

DistrictCourts.getLayout = (page) => (
  <CaseConfigurationsLayout>{page}</CaseConfigurationsLayout>
);

export default DistrictCourts;
