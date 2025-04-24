import React, { useState, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import modalStyle from "@/styles/modal.module.css";
import ManagementLayout from "@/layouts/management";
import createExcerpt from "@/config/excerptDescription";
import CustomEditor from "@/components/Editor/customEditor";
import Axios from "@/config/axios";
import { formatDateToReadableString } from "@/utils/common";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { formatDate } from "@fullcalendar/core";
import { Router, useRouter } from "next/router";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/breadcrumb";

const CaseCalendar = ({ cases, members, calendar }) => {
  const navigate = useRouter();
  const [caseInfoEditorData, setCaseInfoEditorData] = useState("");
  const [genricEditorData, setGenricEditorData] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGenricUsers, setSelectedGenricUsers] = useState([]);
  const [organization, setOrganization] = useState();
  const [genricOrganizaion, setGenricOrganizaion] = useState();
  const [loading, setLoading] = useState(false);
  const [currentTodo, setCurrentTodo] = useState();
  const [hearings, setHearings] = useState(calendar?.hearings || []);
  const [currentHearing, setCurrentHearing] = useState();

  const [todo, setTodo] = useState(calendar?.todos || []);
  const params = useParams();

  const openModal = useRef(null);
  const todoModal = useRef(null);
  const hearingModal = useRef(null);
  const closeModal = useRef(null);
  const closeCaseInfoModal = useRef();
  const closeGenricModal = useRef();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const {
    register: todoRegister,
    handleSubmit: todoHandleSubmit,
    watch: todoWatch,
    reset: todoReset,
  } = useForm();

  const currentAssignStatus = todoWatch("assignStatus");

  const handleDateClick = (arg) => {
    openModal.current.click();
    setSelectedDate(arg.dateStr);
  };

  const handleCaseInfoEditorChange = (data) => {
    setCaseInfoEditorData(data); // Update state with the editor content
  };

  const handleGenricEditor = (data) => {
    setGenricEditorData(data);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="px-2 text-white rounded" style={{ cursor: "pointer" }}>
        <i>{createExcerpt(eventInfo.event.title, 18)}</i>
      </div>
    );
  };

  const submit = async (data) => {
    try {
      setLoading(true);

      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      const payLoad = {
        ...filteredData,
        description: caseInfoEditorData,
        attendies: [...selectedUsers],
        caseId: params?.id,
      };
      const res = await Axios.post("/case/add-hearing", payLoad, {
        authenticated: true,
      });
      toast.success("Next hearing date is successfully added");
      setHearings((pre) => [...pre, { ...res.data.data }]);
      reset();
      setCaseInfoEditorData("");
      closeCaseInfoModal.current.click();
      setLoading(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "An error ocured while add hearing data"
      );
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedUsers((prev) => {
      const updatedUsers = checked
        ? [...prev, value]
        : prev.filter((id) => id !== value);
      return updatedUsers;
    });
  };

  const handleEventClick = (datainfo) => {
    const { extendedProps } = datainfo.event._def;
    const eventTitle = extendedProps.eventType;

    if (eventTitle === "todo") {
      setCurrentTodo({ ...extendedProps.todoData });
      todoModal.current.click();
      // setSelectedDate(info.title);
    } else if (eventTitle === "hearingDate") {
      setCurrentHearing({ ...extendedProps.hearing });
      hearingModal.current.click();
    }
  };

  const todoClickHandler = async (id, status) => {
    try {
      const payLoad = {
        todoId: currentTodo._id,
        status: status,
      };

      const res = await Axios.post("/to-dos/update-to-dos", payLoad, {
        authenticated: true,
      });
      setCurrentTodo({ ...currentTodo, status: res.data.data.status });

      fetchData();
      toast.success("Todo is updated successfully");
      closeModal.current.click();
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Ac error occured while update todo status"
      );
    }
  };

  const handleGenricCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedGenricUsers((prev) => {
      const updatedUsers = checked
        ? [...prev, value]
        : prev.filter((id) => id !== value);
      return updatedUsers;
    });
  };

  const genericSubmit = async (data) => {
    try {
      setLoading(true);

      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      const { assignStatus, ...restData } = filteredData;
      const payLoad = {
        ...restData,
        relatedToCaseId: [params?.id],
        description: genricEditorData,
        assignToMemberId: [...selectedGenricUsers],
      };
      const res = await Axios.post("/to-dos/add-to-dos", payLoad, {
        authenticated: true,
      });
      toast.success("Todo is created successfully");
      setTodo((pre) => [...pre, { ...res.data.data }]);
      todoReset();
      setGenricEditorData("");
      closeCaseInfoModal.current.click();
      closeGenricModal.current.click();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message || "An error occur while adding todo"
      );
    }
  };

  const getUser = useMemo(() => {
    if (organization) {
      if (!Array.isArray(members?.docs)) return []; // Ensure members.docs is an array
      return members.docs.filter(
        (item) => item.organizationId === organization
      );
    } else {
      return members?.docs;
    }
  }, [organization]); // Add dependencies

  const genricGetUser = useMemo(() => {
    if (genricOrganizaion) {
      if (!Array.isArray(members?.docs)) return []; // Ensure members.docs is an array
      return members.docs.filter(
        (item) => item.organizationId == genricOrganizaion
      );
    } else {
      return members?.docs;
    }
  }, genricOrganizaion);

  const stripHTML = (html) => {
    if (!html) return ""; // Return empty string if null or undefined
    return html.replace(/<[^>]*>/g, ""); // Remove HTML tags
  };

  const events = hearings
    .map((hearing) => {
      if (!hearing || !hearing.hearingDate) {
        return null; // Skip if hearing or hearingDate is missing
      }

      return {
        title: hearing.caseId?.title || "Untitled Case", // Default title if missing
        date: new Date(hearing.hearingDate).toISOString().split("T")[0], // Ensure proper date formatting
        addedBy: hearing?.addedBy || null,
        hearing: hearing,
        backgroundColor:
          hearing.session === "morning"
            ? "#E0BF00"
            : hearing.session === "evening"
            ? "#9C00C3"
            : "#AAAAAA", // Default to grey for other sessions
        borderColor:
          hearing.session === "morning"
            ? "#E0BF00"
            : hearing.session === "evening"
            ? "#9C00C3"
            : "#AAAAAA",
        eventType: "hearingDate",
      };
    })
    .filter(Boolean);

  const todos = todo.map((todo) => {
    return {
      title: stripHTML(todo?.description) || "Untitled Case", // Default title if missing
      date: new Date(todo?.startDateTime).toISOString().split("T")[0], // Ensure proper date formatting
      backgroundColor: "#00a6cb",
      eventType: "todo",
      todoData: todo,
    };
  });

  const handleDatesSet = async (info) => {
    try {
      if (!info) return;
      const date = info?.startStr.split("T")[0];
      const res = await Axios.get(`/calender/get?date=${date}`, {
        authenticated: true,
      });
      if (res.data.data?.calendar?.hearings) {
        setHearings([...res.data.data.calendar?.hearings]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" }, // Last item (non-clickable)
    { label: "Calendar" }, // Last item (non-clickable)
    { label: createExcerpt(calendar?.case[0]?.title, 40) }, // Last item (non-clickable)
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <section className="date-calendar pt-0">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="calendarHeading">Calendar</h2>

              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dayMaxEvents={1}
                eventSources={[{ events: events }, { events: todos }]}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                className="main-calender"
                dateClick={handleDateClick}
                datesSet={handleDatesSet}
              />
            </div>
          </div>
          <div className="row">
            <div className="listWrapper">
              <ul>
                <li>
                  <span className="eventList"></span>To-Do
                </li>
                <li>
                  <span className="eventListTwo"></span>Hearing Date (No
                  Sessions)
                </li>
                <li>
                  <span className="eventListThree"></span>Hearing Date (Morning
                  Session)
                </li>
                <li>
                  <span className="eventListFour"></span>Hearing Date (Evening
                  Session)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <button
        type="button"
        ref={openModal}
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#calenderModal"
      ></button>

      <div
        className="modal fade"
        id="calenderModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="calenderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className={modalStyle.modalHeader}>
              <h1
                className={`modal-title ${modalStyle.modalTitle}`}
                id="staticBackdropLabel"
              >
                New Calendar Entry
              </h1>
              <button
                type="button"
                className={`btn ${modalStyle.modalButtn}`}
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={closeGenricModal}
              >
                X
              </button>
            </div>
            <hr />
            <div className={modalStyle.tabsWrapper}>
              <ul
                className={`nav nav-pills mb-3 ${modalStyle.modalTabs}`}
                id="pills-tab"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    class={`nav-link active ${modalStyle.caseInfoButton}`}
                    id="pills-home-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-home"
                    type="button"
                    role="tab"
                    aria-controls="pills-home"
                    aria-selected="true"
                  >
                    Case To-do
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    className={`nav-link ${modalStyle.genericButton}  `}
                    id="pills-profile-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-profile"
                    type="button"
                    role="tab"
                    aria-controls="pills-profile"
                    aria-selected="false"
                  >
                    Generic To-do
                  </button>
                </li>
              </ul>
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-home"
                  role="tabpanel"
                  aria-labelledby="pills-home-tab"
                >
                  <div className={`modal-body ${modalStyle.modalFormWrapper}`}>
                    <div className="container-fluid">
                      <form onSubmit={handleSubmit(submit)}>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              {/* <label htmlFor="blongs-to" className="form-label">
                                Belongs To
                              </label> */}
                              {/* <select
                                className={`form-select ${modalStyle.modalFormSelect}`}
                                aria-label="Default select example"
                                id="blongs-to"
                                {...register("caseId")}
                                onChange={(e) => {
                                  const selectedCase = cases?.docs?.find(
                                    (item) => item._id === e.target.value
                                  );
                                  setOrganization(
                                    selectedCase?.organization || ""
                                  );
                                }}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {cases?.docs?.map((item, index) => (
                                  <option value={item._id} key={index}>
                                    {item.title}
                                  </option>
                                ))}
                              </select> */}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label" for="stage">
                                Stage:
                              </label>
                              <input
                                type="text"
                                className={`form-control ${modalStyle.modalInput}`}
                                id="stage"
                                {...register("stage")}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label" for="posted-for">
                                Posted For:
                              </label>
                              <input
                                type="text"
                                className={`form-control ${modalStyle.modalInput}`}
                                id="posted-for"
                                {...register("postedFor")}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label" for="action-taken">
                                Action Taken:
                              </label>
                              <input
                                type="text"
                                className={`form-control ${modalStyle.modalInput}`}
                                id="action-taken"
                                {...register("actionTaken")}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label" for="hearing-date">
                                Next Hearing Date:
                              </label>
                              <input
                                type="date"
                                className={`form-control ${modalStyle.modalInput}`}
                                id="hearing-date"
                                min={getCurrentDate()}
                                {...register("hearingDate")}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label for="session" className="form-label">
                                Session:
                              </label>
                              <select
                                class={`form-select ${modalStyle.modalFormSelect}`}
                                aria-label="Default select example"
                                id="session"
                                {...register("session")}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                <option value="morning">Morning</option>
                                <option value="evening">Evening</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12 mb-3">
                          <div className="btn-group w-100">
                            <button
                              className={`form-select text-start`}
                              type="button"
                              data-bs-toggle="dropdown"
                              data-bs-auto-close="outside"
                              aria-expanded="false"
                            >
                              Choose To Attended
                            </button>
                            <div className="dropdown-menu p-4 w-100">
                              {Array.isArray(getUser) &&
                                getUser.map((item) => {
                                  const isChecked = selectedUsers.includes(
                                    item._id
                                  );

                                  return (
                                    <div className="form-check" key={item._id}>
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`user-${item._id}`}
                                        value={item._id}
                                        onChange={handleCheckboxChange}
                                        checked={isChecked}
                                      />
                                      <label
                                        htmlFor={`user-${item._id}`}
                                        className="form-check-label"
                                      >
                                        {`${item.firstName} ${item.lastName}`}
                                      </label>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                        <div className={modalStyle.Editorsection}>
                          <label className="mb-2">Description :</label>
                          <CustomEditor
                            value={caseInfoEditorData}
                            onChange={handleCaseInfoEditorChange}
                          />
                        </div>
                        <div className={modalStyle.modalButtnWrapper}>
                          <button
                            type="submit"
                            className="commonButton"
                            disabled={loading}
                          >
                            {loading ? "Sumbmiting" : "Submit"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="pills-profile"
                  role="tabpanel"
                  aria-labelledby="pills-profile-tab"
                >
                  <div
                    className="tab-pane fade show active"
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                  >
                    <div
                      className={`modal-body ${modalStyle.modalFormWrapper}`}
                    >
                      <div className="container-fluid">
                        <form onSubmit={todoHandleSubmit(genericSubmit)}>
                          <div className="row">
                            <div className="col-md-12">
                              <label className="mb-2">Description :</label>
                              <CustomEditor
                                value={genricEditorData}
                                onChange={handleGenricEditor}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-12 pt-4">
                              <p>
                                Would you like to assign this to-do to any case?
                              </p>
                              <div
                                class={`form-check form-check-inline ${modalStyle.genericRadioButton}  `}
                              >
                                <div>
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="inlineRadioOptions"
                                    id="inlineRadio1"
                                    value="yes"
                                    {...todoRegister("assignStatus")}
                                  />
                                  <label
                                    className="form-check-label"
                                    for="inlineRadio1"
                                  >
                                    Yes
                                  </label>
                                </div>
                                <div className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="inlineRadioOptions"
                                    id="inlineRadio2"
                                    value="no"
                                    {...todoRegister("assignStatus")}
                                  />
                                  <label
                                    className="form-check-label"
                                    for="inlineRadio2"
                                  >
                                    No
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            {currentAssignStatus &&
                              currentAssignStatus == "yes" && (
                                <div className="mb-3">
                                  <label className="form-label">
                                    Blongs To
                                  </label>
                                  <select
                                    className={`form-select ${modalStyle.modalFormSelect}`}
                                    aria-label="Default select example"
                                    id="blongs-to"
                                    {...todoRegister("relatedToCaseId")}
                                    onChange={(e) => {
                                      const selectedCase = cases?.docs?.find(
                                        (item) => item._id === e.target.value
                                      );
                                      setGenricOrganizaion(
                                        selectedCase?.organization || ""
                                      );
                                    }}
                                  >
                                    <option value="" hidden>
                                      Please Select
                                    </option>
                                    {cases?.docs?.map((item, index) => (
                                      <option value={item._id} key={index}>
                                        {item.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            <div className="col-md-12 mb-3">
                              <div className="btn-group w-100">
                                <button
                                  className={`form-select text-start`}
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  data-bs-auto-close="outside"
                                  aria-expanded="false"
                                >
                                  Assign To
                                </button>
                                <div className="dropdown-menu p-4 w-100">
                                  {Array.isArray(genricGetUser) &&
                                    genricGetUser.map((item) => {
                                      const isChecked =
                                        selectedGenricUsers.includes(item._id);

                                      return (
                                        <div
                                          className="form-check"
                                          key={item._id}
                                        >
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`genric-${item._id}`}
                                            value={item._id}
                                            onChange={
                                              handleGenricCheckboxChange
                                            }
                                            checked={isChecked}
                                          />
                                          <label
                                            htmlFor={`genric-${item._id}`}
                                            className="form-check-label"
                                          >
                                            {`${item.firstName} ${item.lastName}`}
                                          </label>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-5">
                              <span className={modalStyle.dueDateheading}>
                                Start date
                              </span>
                              <div className="my-2">
                                <input
                                  type="date"
                                  className={`form-control ${modalStyle.modalInput}`}
                                  {...todoRegister("startDateTime")}
                                />
                              </div>
                            </div>
                            <div className="col-md-2 ">
                              <h2 className={modalStyle.dateToline}>TO</h2>
                            </div>
                            <div className="col-md-5">
                              <span className={modalStyle.dueDateheading}>
                                End date
                              </span>
                              <div className="my-2">
                                <input
                                  type="date"
                                  className={`form-control ${modalStyle.modalInput}`}
                                  {...todoRegister("endDateTime")}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div
                              className={`col-md-12 ${modalStyle.modalcheckBox} `}
                            >
                              <input
                                type="checkbox"
                                {...todoRegister("markAsPrivate")}
                              />
                              Mark as Private
                            </div>
                          </div>
                          <div className={modalStyle.modalButtnWrapper}>
                            <button
                              type="submit"
                              className="commonButton"
                              disabled={loading}
                            >
                              {loading ? "Submitting" : "Submit"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----To-Do Modal */}

      <button
        type="button"
        className="btn btn-primary d-none"
        ref={todoModal}
        data-bs-toggle="modal"
        data-bs-target="#todoModal3"
      ></button>
      <div
        className="modal fade"
        id="todoModal3"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="calenderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className={modalStyle.modalHeader}>
              <h1
                className={`modal-title ${modalStyle.modalTitle}`}
                id="staticBackdropLabel"
              >
                Todo Data
              </h1>
              <button
                type="button"
                className={`btn ${modalStyle.modalButtn}`}
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={closeCaseInfoModal}
              >
                X
              </button>
            </div>
            <hr />

            <div className={`p-4 ${modalStyle.tabsWrapper}`}>
              <div>
                <div className="row mb-2">
                  {/* <div className="col-md-6">Case</div>
        <div className="col-md-6">{showTodo?.relatedToCaseId[0]?.title}</div> */}
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Description</div>
                  <div
                    className="col-md-6"
                    dangerouslySetInnerHTML={{
                      __html: currentTodo?.description,
                    }}
                  ></div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Start Date</div>
                  <div className="col-md-6">
                    {formatDateToReadableString(currentTodo?.startDateTime)}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">End Date</div>
                  <div className="col-md-6">
                    {formatDateToReadableString(currentTodo?.endDateTime)}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Status</div>
                  <div className="col-md-6">
                    {currentTodo?.status && currentTodo?.status == "open"
                      ? "Pending"
                      : currentTodo?.status}
                  </div>
                </div>
                <div className="row">
                  <div className="d-flex justify-content-end gap-3 mt-3">
                    <div>
                      <button
                        className="commonButton"
                        name="close"
                        value="close"
                        onClick={() =>
                          todoClickHandler(currentTodo._id, "close")
                        }
                        disabled={currentTodo?.status == "close"}
                      >
                        Close
                      </button>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="commonButton"
                        name="completed"
                        value="completed"
                        onClick={() =>
                          todoClickHandler(currentTodo._id, "completed")
                        }
                        disabled={currentTodo?.status == "completed"}
                        style={
                          currentTodo?.status === "completed"
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : {}
                        }
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------ Hearing-Date Modal-----*/}

      <button
        type="button"
        className="btn btn-primary d-none"
        ref={hearingModal}
        data-bs-toggle="modal"
        data-bs-target="#todoModal0"
      ></button>
      <div
        className="modal fade"
        id="todoModal0"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="calenderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className={modalStyle.modalHeader}>
              <h1
                className={`modal-title ${modalStyle.modalTitle}`}
                id="staticBackdropLabel"
              >
                Hearing Data
              </h1>
              <button
                type="button"
                className={`btn ${modalStyle.modalButtn}`}
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={closeModal}
              >
                X
              </button>
            </div>
            <hr />

            <div className={`p-4 ${modalStyle.tabsWrapper}`}>
              <div>
                <div className="row mb-2">
                  {/* <div className="col-md-6">Case</div>
        <div className="col-md-6">{showTodo?.relatedToCaseId[0]?.title}</div> */}
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Case Title</div>
                  <div className="col-md-6">
                    {currentHearing?.caseId?.title}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Session</div>
                  <div className="col-md-6">{currentHearing?.session}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Hearing Date</div>
                  <div className="col-md-6">
                    {formatDateToReadableString(currentHearing?.hearingDate)}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Description</div>
                  <div className="col-md-6">
                    {stripHTML(currentHearing?.description)}
                  </div>
                </div>
                <div className="row">
                  <div className="d-flex justify-content-end gap-3 mt-3">
                    {/*        
        <div>
          <button className="commonButton" name="close" value="close" onClick={()=>todoClickHandler(currentTodo._id,"close")} disabled={currentTodo?.status == "close"}>Close</button>
            </div>
            <div>
          <button type="submit" className="commonButton" name="completed" value="completed" onClick={() => todoClickHandler(currentTodo._id, "completed")}
 disabled={currentTodo?.status == "completed"} style={currentTodo?.status === "completed" ? { opacity: 0.5, cursor: "not-allowed" } : {}}>Completed</button>
          </div> */}
                    <div>
                      <button
                        type="submit"
                        className="commonButton"
                        onClick={() => {
                          navigate.push(
                            `/management/cases/${currentHearing?.caseId?._id}`
                          );
                          closeModal.current.click();
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const { id: caseId } = query;

    const { page = 1 } = query;
    const [memeberRes, calendarRes] = await Promise.all([
      Axios.get("/user/get-all-team-members?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get(`/calender/get?caseId=${caseId}`, {
        authenticated: true,
        context,
      }),
    ]);

    return {
      props: {
        members: memeberRes.data.data,
        calendar: calendarRes.data.data,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.message || "Failed to fetch data",
        members: [],
        calendar: [],
      },
    };
  }
}

CaseCalendar.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default CaseCalendar;
