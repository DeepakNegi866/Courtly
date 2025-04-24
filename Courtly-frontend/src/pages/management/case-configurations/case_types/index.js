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
import { courts, Commissionerate } from "@/utils/case-configurations";
import tableStyle from "@/styles/table-nav.module.css";
import modalStyle from "@/styles/modal.module.css";
import { Edit, Trash, Add } from "@/utils/icons";
import formStyle from "@/styles/authForm.module.css";
import { render } from "@fullcalendar/core/preact";
import createExcerpt from "@/config/excerptDescription";

const Districts = ({
  allCourts,
  allCaseTypes,
  allHighCourts,
  allDistricts,
  states,
  districtCourts,
  commissions,
  commissionStates,
  commissionBenches,
  tribunalAuthorities,
  revenuCourts,
  commissionerateAuths,
  departments,
  departmentAuths,
  lokAdalats,
  allHighCourtBenches,
}) => {
  const {
    docs: CaseTypes,
    page,
    totalPages,
    limit,
    totalDocs = 0,
  } = allCaseTypes;
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
      setValue("court", preData.courtId || "");
      setValue("highCourtId", preData.highCourtId || "");
      setValue("highCourtBenchId", preData.highCourtBenchId || "");
      setValue("stateId", preData.stateId || "");
      setValue("districtId", preData.districtId || "");
      setValue("districtCourtId", preData.districtCourtId || "");
      setValue("comissionId", preData.comissionId || "");
      setValue("comissionStateId", preData.comissionStateId || "");
      setValue("comissionBenchId", preData.comissionBenchId || "");
      setValue("tribunalAuthorityId", preData.tribunalAuthorityId || "");
      setValue("revenueCourtId", preData.revenueCourtId || "");
      setValue(
        "comissionerRateAuthorityId",
        preData.comissionerRateAuthorityId || ""
      );
      setValue("departmentId", preData.departmentId || "");
      setValue("departmentAuthorityId", preData.departmentAuthorityId || "");
      setValue("lokAdalatId", preData.lokAdalatId || "");
      setValue("comissionerRate", preData.comissionerRate || "");
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
      render: (value, row, index) => {
        return <span>{createExcerpt(value, 50)}</span>;
      },
    },
    {
      title: "Court",
      key: "court",
      render: (value, row, index) => {
        return <span>{createExcerpt(row?.court?.title, 50)}</span>;
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

  const handleDeleteAction = async (caseTypeId) => {
    try {
      await Axios.delete(`/case-type/delete-case-type/${caseTypeId}`, {
        authenticated: true,
      });
      toast.success("Case type is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete Case type"
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

  const update = async (data) => {
    try {
      if (data?.comissionId) delete data.comissionId;
      setLoading(true);
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );
      const parsedCourt =
        typeof filteredData?.court === "string"
          ? JSON.parse(filteredData.court)
          : filteredData.court;

      const { court, ...restData } = filteredData;
      const payload = {
        ...restData,
        court: parsedCourt,
      };

      if (preData) payload["caseTypeId"] = preData?._id;
      await Axios.post("/case-type/update-case-type", payload, {
        authenticated: true,
      });
      updateReset();
      closeUpdateModal?.current?.click();
      toast.success("Case type is updated successfully");
      setLoading(false);
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      updateReset();
      toast.error(
        error.response?.data?.message || "Failed to update case type"
      );
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      await Axios.post("/case-type/add-case-type", filteredData, {
        authenticated: true,
      });
      reset();
      closeAddModal?.current?.click();
      toast.success("Case type is created successfully");
      setLoading(false);
      router.replace(router.asPath);
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to create case type"
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
                All Case Types-({totalDocs})
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
                    data={CaseTypes}
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

          {/* add new District modal */}
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
                    Add Case Type
                  </h1>
                  <button
                    type="button"
                    ref={closeAddModal}
                    className={`btn ${modalStyle.modalButtn}`}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    X
                  </button>
                </div>
                <div className={`modal-body ${modalStyle.modalFormWrapper}`}>
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
                          })}
                        />
                        {errors.title && (
                          <div className="invalid-feedback">
                            {errors.title.message}
                          </div>
                        )}
                      </div>
                      {/* courts */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="court" className="form-label">
                          Court's
                        </label>
                        <select
                          className={`form-control ${
                            formStyle.commonFormSelect
                          } ${errors.court ? "is-invalid" : ""}`}
                          {...register("court", {
                            required: "This field is required",
                          })}
                        >
                          <option value="" hidden>
                            Please Select
                          </option>
                          {allCourts?.docs &&
                            Array.isArray(allCourts?.docs) &&
                            allCourts?.docs.length > 0 &&
                            allCourts?.docs.map((item, index) => {
                              return (
                                <option value={item._id} key={index}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                        {errors.court && (
                          <div className="invalid-feedback">
                            {errors.court.message}
                          </div>
                        )}
                      </div>
                      {/* high courts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label" htmlFor="highCourtId">
                          High Court's
                        </label>
                        <select
                          type="text"
                          className={` ${formStyle.commonFormSelect} ${
                            errors.highCourtId ? "is-invalid" : ""
                          }`}
                          {...register("highCourtId")}
                        >
                          <option value="" hidden>
                            Please Select
                          </option>
                          {allHighCourts?.docs &&
                            Array.isArray(allHighCourts?.docs) &&
                            allHighCourts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                      {/* high courts benches */}
                      <div className="col-md-6 mb-3">
                        <label
                          className="form-label"
                          htmlFor="highCourtBenchId"
                        >
                          High Court Benches
                        </label>
                        <select
                          type="text"
                          className={` ${formStyle.commonFormSelect} ${
                            errors.highCourtBenchId ? "is-invalid" : ""
                          }`}
                          {...register("highCourtBenchId")}
                        >
                          <option value="" hidden>
                            Please Select
                          </option>
                          {allHighCourtBenches?.docs &&
                            Array.isArray(allHighCourtBenches?.docs) &&
                            allHighCourtBenches?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                      {/* states */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="stateId" className="form-label">
                          States
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.stateId ? "is-invalid" : ""
                          }`}
                          id="stateId"
                          {...register("stateId")}
                        >
                          <option value="" hidden>
                            Select State
                          </option>
                          {states?.docs &&
                            Array.isArray(states?.docs) &&
                            states?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* districts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Districts</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.districtId ? "is-invalid" : ""
                          }`}
                          {...register("districtId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {allDistricts?.docs &&
                            Array.isArray(allDistricts?.docs) &&
                            allDistricts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* District Courts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">District Court's</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.districtCourtId ? "is-invalid" : ""
                          }`}
                          {...register("districtCourtId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {districtCourts?.docs &&
                            Array.isArray(districtCourts?.docs) &&
                            districtCourts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Commission States */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Commission States</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect}${
                            errors.comissionStateId ? "is-invalid" : ""
                          }`}
                          {...register("comissionStateId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {commissionStates?.docs &&
                            Array.isArray(commissionStates?.docs) &&
                            commissionStates?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Commission Benches */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="stateId" className="form-label">
                          Commission Benches
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.comissionBenchId ? "is-invalid" : ""
                          }`}
                          {...register("comissionBenchId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {commissionBenches?.docs &&
                            Array.isArray(commissionBenches?.docs) &&
                            commissionBenches?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* commissionerate */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Commissionerate</label>
                        <select
                          className={formStyle.commonFormSelect}
                          {...register("comissionerRate")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {Commissionerate &&
                            Array.isArray(Commissionerate) &&
                            Commissionerate.length > 0 &&
                            Commissionerate.map((item, index) => {
                              return (
                                <option value={item.title} key={index}>
                                  {item.title}
                                </option>
                              );
                            })}{" "}
                        </select>
                      </div>
                      {/* Tribunal Authority */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Tribunal Authorities
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.tribunalAuthorityId ? "is-invalid" : ""
                          }`}
                          {...register("tribunalAuthorityId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {tribunalAuthorities?.docs &&
                            Array.isArray(tribunalAuthorities?.docs) &&
                            tribunalAuthorities?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Revenue courts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Revenue Court's</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.revenueCourtId ? "is-invalid" : ""
                          }`}
                          {...register("revenueCourtId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {revenuCourts?.docs &&
                            Array.isArray(revenuCourts?.docs) &&
                            revenuCourts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* commissionerate authorities */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Commissionerate Athoritie's
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.comissionerRateAuthorityId
                              ? "is-invalid"
                              : ""
                          }`}
                          {...register("comissionerRateAuthorityId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {commissionerateAuths?.docs &&
                            Array.isArray(commissionerateAuths?.docs) &&
                            commissionerateAuths?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Departments */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Department's</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect}${
                            errors.departmentId ? "is-invalid" : ""
                          }`}
                          {...register("departmentId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {departments?.docs &&
                            Array.isArray(departments?.docs) &&
                            departments?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Department Authority */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Department Authorities
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.departmentAuthorityId ? "is-invalid" : ""
                          }`}
                          {...register("departmentAuthorityId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {departmentAuths?.docs &&
                            Array.isArray(departmentAuths?.docs) &&
                            departmentAuths?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Lok adalats */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Lok Adalat</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormSelect} ${
                            errors.lokAdalatId ? "is-invalid" : ""
                          }`}
                          id="lokAdalatId"
                          {...register("lokAdalatId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {lokAdalats?.docs &&
                            Array.isArray(lokAdalats?.docs) &&
                            lokAdalats?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
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
                    Update Case Type
                  </h1>
                  <button
                    type="button"
                    ref={closeUpdateModal}
                    className={`btn ${modalStyle.modalButtn}`}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    X
                  </button>
                </div>
                <div className={`modal-body ${modalStyle.modalFormWrapper}`}>
                  <form onSubmit={updateHandleSubmit(update)}>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="title" className="form-label">
                          Title *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${
                            formStyle.commonFormInput
                          } ${updateErrors.title ? "is-invalid" : ""}`}
                          id="title"
                          {...updateRegister("title", {
                            required: "This field is required",
                          })}
                        />
                        {updateErrors.title && (
                          <div className="invalid-feedback">
                            {updateErrors.title.message}
                          </div>
                        )}
                      </div>
                      {/* courts */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="court" className="form-label">
                          Court's
                        </label>
                        <select
                          className={`${formStyle.commonFormInput} ${
                            errors.court ? "is-invalid" : ""
                          }`}
                          {...updateRegister("court", {
                            required: "This field is required",
                          })}
                        >
                          <option value="" hidden>
                            Please Select
                          </option>
                          {courts &&
                            Array.isArray(courts) &&
                            courts.length > 0 &&
                            courts.map((item, index) => {
                              return (
                                <option
                                  value={JSON.stringify(item)}
                                  key={index}
                                  selected={
                                    preData?.court?.id == item._id
                                      ? item.title
                                      : ""
                                  }
                                >
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                        {updateErrors.court && (
                          <div className="invalid-feedback">
                            {updateErrors.court.message}
                          </div>
                        )}
                      </div>
                      {/* high courts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">High Court's</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.highCourtId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("highCourtId")}
                        >
                          <option value="" hidden>
                            Please Select
                          </option>
                          {allHighCourts?.docs &&
                            Array.isArray(allHighCourts?.docs) &&
                            allHighCourts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                      {/* high courts benches */}
                      <div className="col-md-6 mb-3">
                        <label
                          className="form-label"
                          htmlFor="highCourtBenchId"
                        >
                          High Court Benches
                        </label>
                        <select
                          type="text"
                          className={` ${formStyle.commonFormSelect} ${
                            errors.highCourtBenchId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("highCourtBenchId")}
                        >
                          <option value="" hidden>
                            Please Select
                          </option>
                          {allHighCourtBenches?.docs &&
                            Array.isArray(allHighCourtBenches?.docs) &&
                            allHighCourtBenches?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                      {/* states */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="stateId" className="form-label">
                          States
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.stateId ? "is-invalid" : ""
                          }`}
                          id="stateId"
                          {...updateRegister("stateId")}
                        >
                          <option value="" hidden>
                            Select State
                          </option>
                          {states?.docs &&
                            Array.isArray(states?.docs) &&
                            states?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* districts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Districts</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.districtId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("districtId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {allDistricts?.docs &&
                            Array.isArray(allDistricts?.docs) &&
                            allDistricts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* District Courts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">District Court's</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.districtCourtId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("districtCourtId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {districtCourts?.docs &&
                            Array.isArray(districtCourts?.docs) &&
                            districtCourts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Commission States */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Commission States</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.comissionStateId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("comissionStateId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {commissionStates?.docs &&
                            Array.isArray(commissionStates?.docs) &&
                            commissionStates?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Commission Benches */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="stateId" className="form-label">
                          Commission Benches
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.comissionBenchId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("comissionBenchId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {commissionBenches?.docs &&
                            Array.isArray(commissionBenches?.docs) &&
                            commissionBenches?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* commissionerate */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Commissionerate</label>
                        <select
                          className={formStyle.commonFormInput}
                          {...updateRegister("comissionerRate")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {Commissionerate &&
                            Array.isArray(Commissionerate) &&
                            Commissionerate.length > 0 &&
                            Commissionerate.map((item, index) => {
                              return (
                                <option value={item.title} key={index}>
                                  {item.title}
                                </option>
                              );
                            })}{" "}
                        </select>
                      </div>
                      {/* Tribunal Authority */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Tribunal Authorities
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.tribunalAuthorityId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("tribunalAuthorityId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {tribunalAuthorities?.docs &&
                            Array.isArray(tribunalAuthorities?.docs) &&
                            tribunalAuthorities?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Revenue courts */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Revenue Court's</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.revenueCourtId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("revenueCourtId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {revenuCourts?.docs &&
                            Array.isArray(revenuCourts?.docs) &&
                            revenuCourts?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* commissionerate authorities */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Commissionerate Athorities
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.comissionerRateAuthorityId
                              ? "is-invalid"
                              : ""
                          }`}
                          {...updateRegister("comissionerRateAuthorityId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {commissionerateAuths?.docs &&
                            Array.isArray(commissionerateAuths?.docs) &&
                            commissionerateAuths?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Departments */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Department's</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.departmentId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("departmentId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {departments?.docs &&
                            Array.isArray(departments?.docs) &&
                            departments?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Department Authority */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Department Authorities
                        </label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.departmentAuthorityId ? "is-invalid" : ""
                          }`}
                          {...updateRegister("departmentAuthorityId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {departmentAuths?.docs &&
                            Array.isArray(departmentAuths?.docs) &&
                            departmentAuths?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>{" "}
                      {/* Lok adalats */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Lok Adalat</label>
                        <select
                          type="text"
                          className={`${formStyle.commonFormInput} ${
                            errors.lokAdalatId ? "is-invalid" : ""
                          }`}
                          id="lokAdalatId"
                          {...updateRegister("lokAdalatId")}
                        >
                          <option value="" hidden>
                            Please select
                          </option>
                          {lokAdalats?.docs &&
                            Array.isArray(lokAdalats?.docs) &&
                            lokAdalats?.docs.map((item, index) => {
                              return (
                                <option key={index} value={item._id}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className={`${modalStyle.modalButtnWrapper} mt-3`}>
                      {" "}
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
    const [
      courtRes,
      caseTypes,
      highCourtRes,
      districtRes,
      stateRes,
      districtCourtRes,
      commissionRes,
      commissionStateRes,
      commissionBenchRes,
      tribunalAuthorityRes,
      revenuCourtRes,
      commissionerateAuthRes,
      departmentRes,
      departmentAuthRes,
      lokAdalatRes,
      highCourtBenchesRes,
    ] = await Promise.all([
      Axios.get("/court/get-all-courts?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get(`/case-type/get-all-case-types?page=${page}`, {
        authenticated: true,
        context,
      }),
      Axios.get("/high-court/get-all-high_courts?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/district/get-all-districts?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/state/get-all-states?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/district-court/get-all-district_courts?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-comissions?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-states?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-benches?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-tribunal_authority?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-revenue_court?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-comission_rate_authority?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-departments?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-department_authority?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-lok_adalat?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get(`/high-court-benches/get-all?limit=100`, {
        authenticated: true,
        context,
      }),
    ]);

    return {
      props: {
        allCourts: courtRes.data.data,
        allCaseTypes: caseTypes.data.data,
        allHighCourts: highCourtRes.data.data,
        allDistricts: districtRes.data.data, // Adjust based on your API response
        states: stateRes.data.data,
        districtCourts: districtCourtRes.data.data,
        commissions: commissionRes.data.data,
        commissionStates: commissionStateRes.data.data,
        commissionBenches: commissionBenchRes.data.data,
        tribunalAuthorities: tribunalAuthorityRes.data.data,
        revenuCourts: revenuCourtRes.data.data,
        commissionerateAuths: commissionerateAuthRes.data.data,
        departments: departmentRes.data.data,
        departmentAuths: departmentAuthRes.data.data,
        lokAdalats: lokAdalatRes.data.data,
        allHighCourtBenches: highCourtBenchesRes.data.data,
      },
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Check the error");

    return {
      props: {
        error: error.message || "Failed to fetch data",
        allCourts: [],
        allCaseTypes: [],
        allHighCourts: [],
        allDistricts: [],
        states: [],
        districtCourts: [],
        commissions: [],
        commissionStates: [],
        commissionBenches: [],
        tribunalAuthorities: [],
        revenuCourts: [],
        commissionerateAuths: [],
        departments: [],
        departmentAuths: [],
        lokAdalats: [],
      },
    };
  }
}

Districts.getLayout = (page) => (
  <CaseConfigurationsLayout>{page}</CaseConfigurationsLayout>
);

export default Districts;
