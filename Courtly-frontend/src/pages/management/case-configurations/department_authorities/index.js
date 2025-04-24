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
import tableStyle from "@/styles/table-nav.module.css";
import modalStyle from "@/styles/modal.module.css";
import { Edit, Trash, Add } from "@/utils/icons";
import formStyle from "@/styles/authForm.module.css";
import createExcerpt from "@/config/excerptDescription";
import { render } from "@fullcalendar/core/preact";

const DepartmentAuthority = ({ DepartmentAuthority, Departments }) => {
  const {
    docs: DepartmentAuthorities,
    page,
    totalPages,
    limit,
    totalDocs = 0,
  } = DepartmentAuthority;

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
      setValue("departmentId", preData.departmentId || "");
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
      title: "Department",
      key: "departmentId",
      render: (value, row) => {
        return <span>{createExcerpt(row?.departmentId?.title, 50)}</span>;
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

  const handleDeleteAction = async (departmentAuthorityId) => {
    try {
      await Axios.delete(
        `/comission/delete-department_authority/${departmentAuthorityId}`,
        { authenticated: true }
      );
      toast.success("Department Authority is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete Department Authority"
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
      await Axios.post("/comission/add-department_authority", filteredData, {
        authenticated: true,
      });
      reset();
      closeAddModal?.current?.click();
      toast.success("Department Authority is created successfully");
      setLoading(false);
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to create Department Authority"
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
      if (preData) filteredData["departmentAuthorityId"] = preData?._id;
      await Axios.post("/comission/update-department_authority", filteredData, {
        authenticated: true,
      });
      updateReset();
      closeUpdateModal?.current?.click();
      toast.success("Department Authority is updated successfully");
      setLoading(false);
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      updateReset();
      toast.error(
        error.response?.data?.message || "Failed to update Department Authority"
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
                All Department Authorities({totalDocs})
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
                    data={DepartmentAuthorities}
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

          {/* add new State modal */}
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
                    Add Department Authority
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
                      <div className="col-md-12 mt-3">
                        <label className="form-label">Department *</label>
                        <select
                          className={`${formStyle.commonFormInput} ${
                            errors.departmentId ? "is-invalid" : ""
                          }`}
                          {...register("departmentId", {
                            required: "This field is required",
                          })}
                        >
                          <option value="" hidden>
                            Select Department
                          </option>
                          {Departments?.docs &&
                            Array.isArray(Departments.docs) &&
                            Departments.docs.map((item, index) => {
                              return (
                                <option value={item._id} key={index}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                        {errors.departmentId && (
                          <div className="invalid-feedback">
                            {errors.departmentId.message}
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
                          className={`form-control ${
                            formStyle.commonFormTextArea
                          } ${errors.discription ? "is-invalid" : ""}`}
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
                    Update Department Authority
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

                      <div className="col-md-12 mt-3">
                        <label className="form-label">Departments *</label>
                        <select
                          className={` ${formStyle.commonFormSelect}`}
                          {...updateRegister("departmentId")}
                        >
                          <option value="" hidden>
                            Select Department
                          </option>
                          {Departments?.docs &&
                            Array.isArray(Departments.docs) &&
                            Departments.docs.map((item, index) => {
                              return (
                                <option
                                  value={item._id}
                                  key={index}
                                  selected={
                                    preData?.departmentId == item._id
                                      ? item._id
                                      : ""
                                  }
                                >
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                      <div className="col-md-12 mt-3">
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
    const [DepartmentAuthority, DepartmentRes] = await Promise.all([
      Axios.get(`/comission/get-all-department_authority?page=${page}`, {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-departments?limit=100", {
        authenticated: true,
        context,
      }),
    ]);

    return {
      props: {
        DepartmentAuthority: DepartmentAuthority.data.data, // Adjust based on your API response
        Departments: DepartmentRes.data.data,
      },
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Check the error");

    return {
      props: {
        error: error.message || "Failed to fetch data",
        DepartmentAuthority: [],
        Departments: [],
      },
    };
  }
}

DepartmentAuthority.getLayout = (page) => (
  <CaseConfigurationsLayout>{page}</CaseConfigurationsLayout>
);

export default DepartmentAuthority;
