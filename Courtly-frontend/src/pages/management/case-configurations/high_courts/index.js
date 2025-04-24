import React, { useCallback, useRef, useEffect, useState } from "react";
import ReactResponsiveTable from "@/components/super-responsive-table";
import CaseConfigurationsLayout from "@/layouts/case-configurations";
import { useRouter } from "next/router";
import Axios from "@/config/axios";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { useForm } from "react-hook-form";
import tableStyle from "@/styles/table-nav.module.css";
import modalStyle from "@/styles/modal.module.css";
import { Edit, Trash, Add } from "@/utils/icons";
import formStyle from "@/styles/authForm.module.css";
import createExcerpt from "@/config/excerptDescription";
import { render } from "@fullcalendar/core/preact";

const HighCourts = ({ data }) => {
  const { docs: highCourts, page, totalPages, limit, totalDocs = 0 } = data;
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

  const handleDeleteAction = async (highCourtId) => {
    try {
      await Axios.delete(`/high-court/delete-high_court/${highCourtId}`, {
        authenticated: true,
      });
      toast.success("High Court is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete High Court"
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
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      setLoading(true);
      await Axios.post("/high-court/add-high_court", filteredData, {
        authenticated: true,
      });

      reset();
      closeAddModal?.current?.click();
      setLoading(false);
      toast.success("High Court is created successfully");
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to create user");
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

      if (preData) filteredData["highCourtId"] = preData?._id;
      await Axios.post("/high-court/update-high_court", filteredData, {
        authenticated: true,
      });
      updateReset();
      closeUpdateModal?.current?.click();
      toast.success("High Court is updated successfully");
      setLoading(false);
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      updateReset();
      toast.error(error.response?.data?.message || "Failed to create district");
    }
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center">
        <h1 className={tableStyle.tableRunningHeading}>
          All High Courts-({totalDocs})
        </h1>
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
                data={highCourts}
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
      {/* add new high court modal */}
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
                Add High Court
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
            <div className={`modal-body ${modalStyle.modalFormWrapper}`}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col-md-12">
                    <label htmlFor="title" className="form-label">
                      Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Title"
                      className={`form-control ${formStyle.commonFormInput} ${
                        errors.title ? "is-invalid" : ""
                      }`}
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
                        {errors.title.message} {/* Displays error message */}
                      </div>
                    )}
                  </div>

                  <div className="col-md-12 mt-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      type="text"
                      placeholder="Description"
                      className={`form-control ${formStyle.commonFormInput} ${
                        errors.discription ? "is-invalid" : ""
                      }`}
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
                    <span
                      class={`${
                        loading ? "spinner-border spinner-border-sm me-1" : ""
                      }`}
                      aria-hidden="true"
                    ></span>
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
                Update High Court
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
                  <div className="col-md-12 mb-2">
                    <label htmlFor="updateTitle" className="form-label">
                      Title *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formStyle.commonFormInput} ${
                        updateErrors.title ? "is-invalid" : ""
                      }`}
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
                  <div className="col-md-12 mt-3">
                    <label htmlFor="updateDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      type="text"
                      className={`form-control ${formStyle.commonFormInput} ${
                        errors.discription ? "is-invalid" : ""
                      }`}
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
                    <span
                      class={`${
                        loading ? "spinner-border spinner-border-sm me-1" : ""
                      }`}
                      aria-hidden="true"
                    ></span>
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
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

    const res = await Axios.get(
      `/high-court/get-all-high_courts?page=${page}`,
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

HighCourts.getLayout = (page) => (
  <CaseConfigurationsLayout>{page}</CaseConfigurationsLayout>
);

export default HighCourts;
