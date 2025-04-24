import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ManagementLayout from "@/layouts/management";
import { useForm, useFieldArray } from "react-hook-form";
import todoStyle from "@/styles/toDo.module.css";
import Axios from "@/config/axios";

import { toast } from "react-toastify";
import Breadcrumb from "@/components/breadcrumb";
import formstyle from "@/styles/authForm.module.css";
import styles from "@/styles/toDo.module.css";
import CustomEditor from "@/components/Editor/customEditor";
import { AddIcon, RightArrow, Search, TrashIcon } from "@/utils/icons";
import { useSession } from "next-auth/react";
import { formatDateToReadableString } from "@/utils/common";
import { useParams } from "next/navigation";
import modalStyle from "@/styles/modal.module.css";
import ReactPaginate from "react-paginate";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";

const now = new Date();
const formattedDateTime = now.toISOString().slice(0, 16);

const Todos = ({ allTodos }) => {
  const { cases, counts, organization, todos, users } = allTodos;
  const { page, totalPages, limit, totalDocs = 0 } = todos;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users || []);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [search, setSearch] = useState();
  const currentTodos = useMemo(() => {
    if (!todos || !todos.docs) return [];
    return [...todos.docs] || [];
  }, [todos, allTodos]);

  const [currentTodoCount, setCurrentTodoCount] = useState(counts);
  const [allCases, setAllCases] = useState(
    (cases && Array.isArray(cases) && cases.length > 0 && [...cases]) || []
  );
  const dropdownRef = useRef(null);
  const openModal = useRef(null);
  const closeModal = useRef(null);
  const session = useSession();
  const [activityEditorValue, setActivityEditorValue] = useState();
  const role = session?.data?.user?.role || null;
  const [todaData, setTodoData] = useState(allTodos);
  const params = useParams();
  const [showTodo, setShowTodo] = useState();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    trigger,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reminder: [],
      assignToMemberId: [],
    },
  });
  const router = useRouter();
  const { query } = router;
  const { filter } = query;

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    // Update selected users
    const updatedUsers = checked
      ? [...selectedUsers, value]
      : selectedUsers.filter((id) => id !== value);

    setSelectedUsers(updatedUsers);

    // Update react-hook-form field value and trigger validation
    setValue("assignToMemberId", updatedUsers);
    trigger("assignToMemberId");
  };
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleOption = (value) => {
    const selectedOptions = new Set(watch("relatedToCaseId") || []);
    if (selectedOptions.has(value)) {
      selectedOptions.delete(value);
    } else {
      selectedOptions.add(value);
    }
    setValue("relatedToCaseId", Array.from(selectedOptions));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      // Add selected users if available
      if (
        selectedUsers &&
        Array.isArray(selectedUsers) &&
        selectedUsers.length > 0
      ) {
        filteredData["assignToMemberId"] = [...selectedUsers];
      }

      // Add reminder if applicable
      if (
        data.reminder &&
        Array.isArray(data.reminder) &&
        data.reminder.some((rem) => rem.reminderTime || rem.reminderMode)
      ) {
        filteredData["reminder"] = data.reminder;
      } else {
        delete filteredData.reminder;
      }

      // Make the API call
      const res = await Axios.post("/to-dos/add-to-dos", filteredData, {
        authenticated: true,
      });

      // Check for a successful response
      toast.success("ToDo is created successfully");
      setActivityEditorValue("");
      reset();
      setSelectedUsers([]);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while trying to create ToDo";
      toast.error(errorMessage);
      reset();
      setSelectedUsers([]);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "reminder",
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "To-do's" }, // Last item (non-clickable)
  ];

  const activityEditorHandler = (data) => {
    setActivityEditorValue(data);
  };
  const organizationHandleChange = async (e) => {
    const organization = e.target.value;
    try {
      const [memberRes, caseRes] = await Promise.all([
        Axios.get(`/user/get-all-team-members?organization=${organization}`, {
          authenticated: true,
        }),
        Axios.get(`/case/get-all-cases?organization=${organization}`, {
          authenticated: true,
        }),
      ]);
      setFilteredUsers([...memberRes?.data?.data?.docs] || []);
      setAllCases([...caseRes?.data?.data?.docs] || []);
    } catch (error) {
      console.error(error);
    }
  };

  const todoClickHandler = async (id, status) => {
    try {
      const payLoad = {
        todoId: showTodo?._id,
        status: status,
      };

      const res = await Axios.post("/to-dos/update-to-dos", payLoad, {
        authenticated: true,
      });

      const newTodo = [...currentTodos];
      const index =
        newTodo &&
        Array.isArray(newTodo) &&
        newTodo.findIndex((item) => item._id == showTodo?._id);
      newTodo[index] = { ...res.data.data };
      setShowTodo();
      setActivityEditorValue("");
      toast.success("Todo is updated successfully");
      closeModal.current.click();
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Ac error occured while update todo status"
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

  const handleFilterChange = (e) => {
    const search = e.target.value;
    return router.push({
      pathname: router.pathname,
      query: { ...query, page: 1, filter: search },
    });
  };
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container-fluid">
        <div className="row">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="col-md-12 ">
              <h5 className={formstyle.commonFormHeading}>Create To-dos</h5>
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <label className="mb-2">Description*</label>
                    <div className="col-md-12">
                      {/* <textarea
                        className="form-control"
                        placeholder="Click here to write to-do description"
                        {...register("description",
                          {required:"This field is required"})
                        
                        }
                      /> */}
                      {/* {errors?.description && <span className="text-danger">{errors?.description?.message}</span>} */}

                      <CustomEditor
                        value={activityEditorValue}
                        onChange={(value) => {
                          activityEditorHandler(value);
                          setValue("description", value);
                          setError("description",{
                            type:"manual",
                            message:""
                          })
                        }}
                      />
                      <input
                        type="hidden"
                        {...register("description", {
                          required: "This field is required",
                          maxLength: {
                            value: 500,
                            message:
                              "This field must not exceed 500 characters",
                          },
                        })}
                      />
                      {errors.description && (
                        <span className="text-danger">
                          {errors.description.message}
                        </span>
                      )}
                    </div>
                    <div className="col-md-6 mt-3">
                      <label className={styles.todoLabels}>
                        Please Select Due Date *
                      </label>
                      <div className="d-flex">
                        <div>
                          <input
                            type="datetime-local"
                            className="form-control"
                            id="startDateTime"
                            {...register("startDateTime", {
                              required: "This field is required",
                            })}
                            min={formattedDateTime}
                          />
                          {errors.startDateTime && (
                            <span className="text-danger">
                              {errors.startDateTime.message}
                            </span>
                          )}
                        </div>
                        <span className={`p-2 ${styles.dateHeading}`}>TO</span>
                        <div>
                          <input
                            type="datetime-local"
                            className="form-control"
                            id="endDateTime"
                            {...register("endDateTime", {
                              required: "This field is required",
                            })}
                            min={formattedDateTime}
                          />
                          {errors.endDateTime && (
                            <span className="text-danger">
                              {errors.endDateTime.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mt-3">
                      <label>Please Select Auto Reminder</label>
                      {!showReminder && (
                        <div
                          type="button"
                          className="additionalReminder mt-2"
                          onClick={() => {
                            setShowReminder(true);
                            append({
                              reminderMode: "",
                              reminderTime: "",
                              reminderModeTime: "minutes",
                            }); // Add an initial reminder when clicking "Click Here"
                          }}
                        >
                          <span>
                            <AddIcon color="#FDD106" />
                            <span className={styles.reminderHeading}>
                              Click Here
                            </span>
                            <span
                              className={`${styles.reminderSecondheading} ms-1`}
                            >
                              to Add Reminder
                            </span>
                          </span>
                        </div>
                      )}

                      {showReminder && (
                        <>
                          {fields.map((field, index) => {
                            const reminderMode = watch(
                              `reminder.${index}.reminderMode`
                            );
                            const reminderModeTime = watch(
                              `reminder.${index}.reminderModeTime`
                            );

                            return (
                              <div className="mt-3" key={field.id}>
                                <div className="row">
                                  <div className="col-md-4">
                                    <select
                                      className="form-control form-select"
                                      {...register(
                                        `reminder.${index}.reminderMode`,
                                        {
                                          required: "This field is required",
                                        }
                                      )}
                                    >
                                      <option value="" hidden>
                                        Please Select
                                      </option>
                                      <option value="email">Email</option>
                                      <option value="whatsapp">Whatsapp</option>
                                      <option value="sms">SMS</option>
                                    </select>
                                    {errors.reminder?.[index]?.reminderMode && (
                                      <span className="text-danger">
                                        {
                                          errors.reminder[index]?.reminderMode
                                            .message
                                        }
                                      </span>
                                    )}
                                  </div>

                                  {/* Minutes */}
                                  {watch(
                                    `reminder.${index}.reminderModeTime`
                                  ) === "minutes" && (
                                    <div className="col-md-4">
                                      <select
                                        className="form-control form-select"
                                        {...register(
                                          `reminder.${index}.reminderTime`,
                                          {
                                            required: "This field is required",
                                          }
                                        )}
                                      >
                                        <option value="" hidden>
                                          Please Select
                                        </option>
                                        {Array.from(
                                          { length: 11 },
                                          (_, idx) => (idx + 1) * 5
                                        ).map((item) => (
                                          <option value={item} key={item}>
                                            {item}
                                          </option>
                                        ))}
                                      </select>
                                      {errors.reminder?.[index]
                                        ?.reminderTime && (
                                        <span className="text-danger">
                                          {
                                            errors.reminder[index]?.reminderTime
                                              .message
                                          }
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Hours */}
                                  {watch(
                                    `reminder.${index}.reminderModeTime`
                                  ) === "hours" && (
                                    <div className="col-md-4">
                                      <select
                                        className="form-control form-select"
                                        {...register(
                                          `reminder.${index}.reminderTime`,
                                          {
                                            required: "This field is required",
                                          }
                                        )}
                                      >
                                        <option value="" hidden>
                                          Please Select
                                        </option>
                                        {Array.from(
                                          { length: 23 },
                                          (_, idx) => idx + 1
                                        ).map((item) => (
                                          <option value={item} key={item}>
                                            {item}
                                          </option>
                                        ))}
                                      </select>
                                      {errors.reminder?.[index]
                                        ?.reminderTime && (
                                        <span className="text-danger">
                                          {
                                            errors.reminder[index]?.reminderTime
                                              .message
                                          }
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Days */}
                                  {watch(
                                    `reminder.${index}.reminderModeTime`
                                  ) === "days" && (
                                    <div className="col-md-4">
                                      <select
                                        className="form-control form-select"
                                        {...register(
                                          `reminder.${index}.reminderTime`,
                                          {
                                            required: "This field is required",
                                          }
                                        )}
                                      >
                                        <option value="" hidden>
                                          Please Select
                                        </option>
                                        {Array.from(
                                          { length: 28 },
                                          (_, idx) => idx + 1
                                        ).map((item) => (
                                          <option value={item} key={item}>
                                            {item}
                                          </option>
                                        ))}
                                      </select>
                                      {errors.reminder?.[index]
                                        ?.reminderTime && (
                                        <span className="text-danger">
                                          {
                                            errors.reminder[index]?.reminderTime
                                              .message
                                          }
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Weeks */}
                                  {watch(
                                    `reminder.${index}.reminderModeTime`
                                  ) === "weeks" && (
                                    <div className="col-md-4">
                                      <select
                                        className="form-control form-select"
                                        {...register(
                                          `reminder.${index}.reminderTime`
                                        )}
                                      >
                                        <option value="" hidden>
                                          Please Select
                                        </option>
                                        {Array.from(
                                          { length: 4 },
                                          (_, idx) => idx + 1
                                        ).map((item) => (
                                          <option value={item} key={item}>
                                            {item}
                                          </option>
                                        ))}
                                      </select>
                                      {errors.reminder?.[index]
                                        .reminderTime && (
                                        <span className="text-danger">
                                          {
                                            errors.reminder[index]?.reminderTime
                                              .message
                                          }
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Reminder Mode Time */}
                                  <div className="col-md-4">
                                    <select
                                      className="form-control form-select"
                                      {...register(
                                        `reminder.${index}.reminderModeTime`
                                      )}
                                    >
                                      <option value="minutes">Minute(s)</option>
                                      <option value="hours">Hour(s)</option>
                                      <option value="days">Day(s)</option>
                                      <option value="weeks">Week(s)</option>
                                    </select>
                                    {errors.reminder?.[index]
                                      ?.reminderModeTime && (
                                      <span className="text-danger">
                                        {
                                          errors.reminder[index]
                                            ?.reminderModeTime.message
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <button
                                    type="button"
                                    className="btn btn-danger me-2"
                                    onClick={() => {
                                      remove(index);
                                      if (fields.length === 1) {
                                        // If it's the last reminder, reset the state
                                        setShowReminder(false);
                                      }
                                    }}
                                  >
                                    <TrashIcon />
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-secondary ${styles.addButton}`}
                                    onClick={() =>
                                      append({
                                        reminderMode: "",
                                        reminderTime: "",
                                        reminderModeTime: "minutes",
                                      })
                                    }
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>

                    <div
                      className={`${
                        organization &&
                        Array.isArray(organization) &&
                        organization.length > 0
                          ? "col-md-6"
                          : "col-md-12 "
                      }  ${styles.markasPvtbutton}`}
                    >
                      <div className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          id="agree"
                          {...register("markAsPrivate")}
                        />
                        <label htmlFor="agree">
                          <h6 className={`py-0 mb-0 ${styles.markpvtHeading}`}>
                            Mark As Private
                          </h6>
                        </label>
                      </div>
                    </div>
                    {/* organizations */}
                    {role && role == "super-admin" && (
                      <div className="col-md-6 mb-3">
                        <label htmlFor="court" className="form-label">
                          Organizations *
                        </label>
                        {organization &&
                          Array.isArray(organization) &&
                          organization?.length > 0 && (
                            <select
                              className="form-control form-select"
                              {...register("organization", {
                                required: "This field is required",
                                onChange: (e) => organizationHandleChange(e), // Pass the function reference
                              })}
                            >
                              <option value="" hidden>
                                Please Select
                              </option>
                              {organization?.map((item, index) => {
                                return (
                                  <option value={item._id} key={index}>
                                    {item?.companyName}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                        {errors?.organization && (
                          <span className="text-danger">
                            {errors?.organization?.message}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="col-md-5 mt-3">
                      <label>Related To</label>
                      <div className="dropdown">
                        <button
                          className={`btn dropdown-toggle text-white w-100 text-start d-flex justify-content-between align-items-center  ${styles.dropDownsection}`}
                          type="button"
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          <span>Please Select</span>
                        </button>

                        {showDropdown && (
                          <div
                            className="dropdown-menu show w-100"
                            style={{ padding: "20px" }}
                          >
                            {allCases &&
                              Array.isArray(allCases) &&
                              allCases.length > 0 &&
                              allCases.map((item, index) => {
                                return (
                                  <div>
                                    <input
                                      type="checkbox"
                                      id={index}
                                      value={item._id}
                                      checked={(
                                        watch("relatedToCaseId") || []
                                      ).includes(item._id)}
                                      onChange={() => toggleOption(item._id)}
                                    />
                                    <label htmlFor={index} className="ms-2">
                                      {item.title}
                                    </label>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-5 mt-3">
                      <label>Assign To</label>
                      <div className="dropdown" ref={dropdownRef}>
                        <button
                          type="button"
                          className={`btn dropdown-toggle text-white text-start w-100 d-flex justify-content-between align-items-center ${styles.dropDownsection}`}
                          onClick={toggleDropdown}
                        >
                          <span>Please Select</span>
                        </button>

                        {isDropdownOpen && (
                          <div
                            className="dropdown-menu show ps-2 w-100"
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                          >
                            {filteredUsers &&
                              Array.isArray(filteredUsers) &&
                              filteredUsers.map((item) => (
                                <div className="form-check" key={item._id}>
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`user-${item._id}`}
                                    value={item._id}
                                    onChange={(e) => handleCheckboxChange(e)}
                                    checked={selectedUsers.includes(item._id)}
                                  />
                                  <label
                                    htmlFor={`user-${item._id}`}
                                    className="form-check-label"
                                  >
                                    {`${item.firstName} ${item.lastName}`}
                                  </label>
                                </div>
                              ))}
                          </div>
                        )}
                        {errors.assignToMemberId && (
                          <span className="text-danger">
                            {errors.assignToMemberId.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-md-2 d-flex justify-content-center align-items-end">
                      <button
                        className={`commonButton ${styles.submitButton} `}
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit"}
                        <RightArrow />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div className="col-md-12 py-2">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="d-flex mb-4 justify-content-between align-items-center">
                      <div className="d-flex">
                        <div className={`d-flex align-items-center`}>
                          <h6 className="px-2 m-0">All</h6>
                          <span className={`${todoStyle.alltotalCount}`}>
                            {Object.entries(currentTodoCount || {})
                              .filter(([key]) => key !== "close") // Exclude the key "close"
                              .reduce((sum, [, value]) => sum + value, 0)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <h6 className="px-2 m-0">Pending</h6>
                          <span className={todoStyle.pendingtotalCount}>
                            {currentTodoCount?.pending}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <h6 className="px-2 m-0">Upcoming</h6>
                          <span className={todoStyle.upcomingtotalCount}>
                            {currentTodoCount?.upcoming}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <h6 className="px-2 m-0">Completed</h6>
                          <span className={todoStyle.completedtotalCount}>
                            {currentTodoCount?.completed}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex">
                        <div className="px-2">
                          <select
                            className="form-control form-select"
                            onChange={(e) => handleFilterChange(e)}
                            defaultValue={filter ? filter : "all"}
                          >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        {/* <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <button
                            className={`btn btn-primary ${styles.submitButton}`}
                            type="submit"
                          >
                            <Search />
                            Search
                          </button>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="row">
                      <div className={`col-md-12 mt-2`}>
                        {currentTodos &&
                          Array.isArray(currentTodos) &&
                          currentTodos.length > 0 &&
                          currentTodos.map((item, index) => {
                            if (item.status == "close") return;
                            return (
                              <div
                                data-bs-target="#calenderModal3"
                                className={`row my-2 ${todoStyle.todoList} text-white`}
                                key={index + "todos"}
                                style={{
                                  cursor: "pointer",
                                  backgroundColor: item.progressStatus
                                    ? item.progressStatus == "upcoming"
                                      ? "#1a09d6"
                                      : item.progressStatus == "pending"
                                      ? "#f31805"
                                      : "#31b713"
                                    : "#f5f3ba",
                                }}
                                onClick={() => {
                                  setShowTodo(item);
                                  openModal.current.click();
                                }}
                              >
                                <div
                                  className={`col-md-4 ${styles.todoHeading}`}
                                  key={index}
                                  dangerouslySetInnerHTML={{
                                    __html: item.description,
                                  }}
                                ></div>
                                <div
                                  className={`col-md-4 ${styles.todoDescription}`}
                                >
                                  {item.relatedToCaseId &&
                                    Array.isArray(item.relatedToCaseId) &&
                                    item.relatedToCaseId.map((el) => (
                                      <span>{el.title}</span>
                                    ))}
                                </div>
                                <div className="col-md-4 text-center">
                                  <span>
                                    <span className={styles.dueDateheading}>
                                      Due Date :{" "}
                                    </span>{" "}
                                    {formatDateToReadableString(
                                      item.endDateTime
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel=">"
                      forcePage={page - 1}
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
          </div>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-primary d-none"
        ref={openModal}
        data-bs-toggle="modal"
        data-bs-target="#todoModal"
      ></button>
      <div
        className="modal fade"
        id="todoModal"
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
                  <div className="col-md-6">Description</div>
                  <div
                    className="col-md-6"
                    dangerouslySetInnerHTML={{ __html: showTodo?.description }}
                  ></div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Start Date</div>
                  <div className="col-md-6">
                    {formatDateToReadableString(showTodo?.startDateTime)}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">End Date</div>
                  <div className="col-md-6">
                    {formatDateToReadableString(showTodo?.endDateTime)}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Status</div>
                  <div className="col-md-6">
                    {showTodo?.status && showTodo?.status == "open"
                      ? "Pending"
                      : showTodo?.status}
                  </div>
                </div>
                <div className="row">
                  <div className="d-flex justify-content-end gap-3 mt-3">
                    <div>
                      <button
                        className="commonButton"
                        name="close"
                        value="close"
                        onClick={() => todoClickHandler(showTodo._id, "close")}
                        disabled={showTodo?.status == "close"}
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
                          todoClickHandler(showTodo._id, "completed")
                        }
                        disabled={showTodo?.status == "completed"}
                        style={
                          showTodo?.status === "completed"
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
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const { page = 1, status = null } = query;
    const { filter = "all" } = query;
    const res = await Axios.get(
      `${
        filter
          ? `/to-dos/get-all-todos?filter=${filter}&page=${page}`
          : `/to-dos/get-all-todos?page=${page}`
      }`,
      {
        authenticated: true,
        context,
      }
    );
    return {
      props: {
        allTodos: res.data.data,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.message || "Failed to fetch data",
        allTodos: [],
      },
    };
  }
}

Todos.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;
export default Todos;
