import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  ActivityIcon,
  Add,
  AddIcon,
  CalendarIcon,
  Connected,
  Court4,
  Document,
  Download,
  Expenses,
  Eyeicon,
  FeeReceived,
  Next,
  Notes,
  RightArrow,
  Search,
  TeamIcon,
  Timesheet,
  TrashIcon,
  Update,
  WatchIcons,
} from "@/utils/icons";
import caseStyle from "@/styles/caseView.module.css";
import Marquee from "react-fast-marquee";
import ReactPaginate from "react-paginate";
import ManagementLayout from "@/layouts/management";
import CustomEditor from "@/components/Editor/customEditor";
import Axios from "@/config/axios";
import debounce from "lodash.debounce";
import Link from "next/link";
import { formatDateToReadableString, formatTimeToIST } from "@/utils/common";
import formstyle from "@/styles/authForm.module.css";
import styles from "@/styles/toDo.module.css";
import todoStyle from "@/styles/toDo.module.css";
import ReactResponsiveTable from "@/components/super-responsive-table";
import { useFieldArray, useForm } from "react-hook-form";
import modalStyle from "@/styles/modal.module.css";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { Action, Edit, Grow, Trash } from "@/utils/icons";
import { useSession } from "next-auth/react";
import createExcerpt from "@/config/excerptDescription";
import Breadcrumb from "@/components/breadcrumb";
import RemburshmentPdf from "@/components/remburshmentPdf";

const downloadUrl = process.env.NEXT_PUBLIC_DOWNLOAD_URL;
const now = new Date();
const formattedDateTime = now.toISOString().slice(0, 16);
const ViewCase = ({
  data,
  activities,
  allCases,
  notes,
  allTodos,
  allTimeSheet,
  expenses,
  allTeamMembers,
  allCaseDocuments,
}) => {
  const { data: currentCase } = data;
  const {
    docs: timeSheets,
    page: timesheetPage,
    totalPages: timesheetTotalPage,
    limit: timesheetLimit,
    pagingCounter: timesheetPagingCounter,
    totalDocs: timesheetTotalDocs = 0,
  } = allTimeSheet;
     
  const [selectedTimeSheetpage, setSelectedTimesheetpage] =
    useState(timesheetPage);

  const {
    docs: teamMembers,
    page: membersPage,
    totalPages: membersTotalPage,
    limit: membersLimit,
    totalDocs: membersTotalDocs = 0,
  } = allTeamMembers;

  const [selectedMembersPage, setSelectedMembersPage] = useState(membersPage);

  const {
    docs: allExpense,
    page: expensesPage,
    admins : adminUser,
    accountants : accountantUser,
    totalPages: expensesTotalPage,
    limit: expensesLimit,
    totalDocs: expensesTotalDocs = 0,
  } = expenses;

  const [selectedExpensespage, setselectedExpensespage] =
    useState(expensesPage);

  const {
    docs: caseDocuments,
    page: documentsPage,
    totalPages: documentsTotalPage,
    limit: documentsLimit,
    totalDocs: documentsTotalDocs = 0,
  } = allCaseDocuments;

  const [selectedDocumentspage, setselectedDocumentspage] =
    useState(documentsPage);

  const {
    docs: allActivities,
    page: activitiesPage,
    totalPages: activitiesTotalPage,
    limit: activitiesLimit,
    totalDocs: activitiesTotalDocs = 0,
  } = activities;

  const {
    docs: notesData,
    page: notesPage,
    totalPages: notesTotalPage,
    limit: notesLimit,
    totalDocs: notesTotalDocs = 0,
  } = notes;

  const [allTodosData, setAllTodosData] = useState(allTodos?.todos || {});
  const {
    docs: todos,
    page: todoPage,
    totalPages: todoTotalPage,
    limit: todoLimit,
    totalDocs: todoTotalDocs = 0,
    organization,
    counts,
  } = allTodosData || {};

  useEffect(() => {
    setCurrentTodos(todos || []);
  }, [allTodosData]);

  const { caseData, hearings, authority, courtTitle } = currentCase;

  const {
    title,
    highCourtId,
    benches,
    departmentId,
    caseType,
    classification,
    status,
    caseNumber,
    dateOfFilling,
    caseYear,
    financialYear,
  } = caseData;
  const {
    priority,
    appearingModel,
    appearingAs,
    yourClientId,
    opponents,
    opponentAdvocates,
  } = caseData;
  const nextHearing =
    hearings &&
    Array.isArray(hearings) &&
    hearings.length > 0 &&
    new Date(hearings[0].hearingDate) > new Date()
      ? hearings[0]
      : null;

  const [loading, setLoading] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newOpponents, setNewOpponents] = useState(opponents || []);
  const [newAdvocateOpponents, setNewAdvocateOpponents] = useState(
    opponentAdvocates || []
  );
  const [currentTodos, setCurrentTodos] = useState(
    (todos && Array.isArray(todos) && todos?.length > 0 && [...todos]) || []
  );
  const [expsEditorValue, setExpsEditorValue] = useState();
  const [todoEditorValue, setTodoEditorValue] = useState();
  const [todoEditorError, setTodoEditorError] = useState();
  const [teamMemberId, setTeamMemberId] = useState([]);
  const [activityEditorValue, setActivityEditorValue] = useState();
  const [activityEditError, setActivityEditError] = useState();
  const [timeSheetEditor, setTimeSheetEditor] = useState();
  const [notesEditor, setNotesEditor] = useState();
  const [notesEditorError, setNotesEditorError] = useState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTodoCount, setCurrentTodoCount] = useState(counts);
  const [allConnectedCase, setAllConnactedCases] = useState(
    (allCases?.docs &&
      Array.isArray(allCases?.docs) &&
      allCases?.docs.length > 0 && [...allCases.docs]) ||
      []
  );
  const [connactedCases, setConnactedCases] = useState();
  const [connactedCaseError, setConnactedCaseError] = useState();
  const [selectedValues, setSelectedValues] = useState({});
  const [connactedAllCases, setConnactedAllCases] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [members, setMembers] = useState(
    (teamMembers &&
      Array.isArray(teamMembers) &&
      teamMembers.length > 0 && [...teamMembers]) ||
      []
  );
  const [showTodo, setShowTodo] = useState();
  const [selectedStatus, setSlectedStatus] = useState(status ? status : "");
  const [organizationUser, setOrganizationUser] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [timeSheet, setTimeSheet] = useState(
    (timeSheets &&
      timeSheets &&
      Array.isArray(timeSheets) &&
      timeSheets.length > 0 && [...timeSheets]) ||
      []
  );
  const [allExpenses, setAllExpenses] = useState(
    Array.isArray(allExpense) && allExpense.length > 0 ? [...allExpense] : []
  );

  const [currentCaseDocuments, setCurrentCaseDocuments] = useState(
    (caseDocuments &&
      Array.isArray(caseDocuments) &&
      caseDocuments.length > 0 && [...caseDocuments]) ||
      []
  );
  const [activity, setActivity] = useState(
    (allActivities &&
      Array.isArray(allActivities) &&
      allActivities.length > 0 && [...allActivities]) ||
      []
  );
  const session = useSession();
  const role = session?.data?.user?.role || null;
  const userEmail = session?.data?.user?.email || null;

  const [currentNotes, setCurrentNotes] = useState(
    (notesData &&
      Array.isArray(notesData) &&
      notesData.length > 0 && [...notesData]) ||
      []
  );
  const [search, setSearch] = useState();
  const [allOrganizationMembers, setAllOrganizationMembers] = useState();
  const [selectedSendingActiveMembers, setSelectedSendingActiveMembers] =
    useState([]);
  const [selectedSendingNoteSheetMembers, setSelectedSendingNoteSheetMembers] =
    useState([]);
  const [activeTeamQuery, setActiveTeamQuery] = useState("");
  const [activeSuggestions, setActiveSuggestions] = useState([]);
  const [activeTeamSelectedUsers, setActiveTeamSelectedUsers] = useState([]);
  const [teamQuery, setTeamQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [teamSelectedUsers, setTeamSelectedUsers] = useState([]);
  const [remburshmentData,setRemburshmentData] = useState([]);
  const dropdownRef = useRef(null);
  const params = useParams();
  const closeModal = useRef();
  const openTodoModal = useRef();
  const closeTdoModal = useRef();
  const closeExpenseModal = useRef();
  const router = useRouter();
  const opponentCloseModal = useRef();
  const opponentAdvocateCloseModal = useRef();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reminder: [],
      assignToMemberId: [],
    },
  });

  // const {
  //   register: opponentRegister,
  //   reset: opponentReset,
  //   handleSubmit: opponentHandleSubmit,
  //   formState: { errors: opponentErrors },
  // } = useForm({ defaultValues: {} });

  // const {
  //   register: advocateRegister,
  //   reset: advocateReset,
  //   handleSubmit: addvocateHandleSubmit,
  //   formState: { errors: advocateErrors },
  // } = useForm();

  const {
    register: expsRegister,
    handleSubmit: expsHnadleSubmit,
    reset: expsReset,
    formState: { errors: expsErrors },
  } = useForm();

  const {
    register: timeRegister,
    handleSubmit: timeHandlerSubmit,
    reset: timeReset,
    formState: { errors: timeErrors },
  } = useForm();

  const {
    register: notesRegister,
    handleSubmit: notesHnadler,
    reset: notesReset,
    watch: notesWatch,
  } = useForm();

  const {
    register: activeRegister,
    handleSubmit: activeHandleSubmit,
    reset: activeReset,
    watch: activeWatch,
  } = useForm();

  const informClient = activeWatch("inform");
  const informTeamMember = activeWatch("informTeamMember");

  const informNoteSheetClient = notesWatch("inform");
  const informNoteSheetTeamMember = notesWatch("informTeamMember");

  const informHandleCheckboxChange = (memberId, isChecked) => {
    if (isChecked) {
      setSelectedSendingActiveMembers((prevSelected) => [
        ...prevSelected,
        memberId,
      ]);
    } else {
      setSelectedSendingActiveMembers((prevSelected) =>
        prevSelected.filter((id) => id !== memberId)
      );
    }
  };

  const informNoteHandleCheckboxChange = (memberId, isChecked) => {
    if (isChecked) {
      setSelectedSendingNoteSheetMembers((prevSelected) => [
        ...prevSelected,
        memberId,
      ]);
    } else {
      setSelectedSendingNoteSheetMembers((prevSelected) =>
        prevSelected.filter((id) => id !== memberId)
      );
    }
  };

  const {
    register: docsRegister,
    handleSubmit: docsHnadleSubmit,
    reset: docsReset,
    watch: docsWatch,
    formState: { errors: docsError },
  } = useForm();

  const {
    register: todoRegister,
    handleSubmit: todoSubmitHandler,
    reset: todoReset,
    trigger: todoTrigger,
    setValue,
    control,
    watch: todoWatch,
    setError: setTodoError,
    formState: { errors: todoError },
  } = useForm({
    defaultValues: {
      reminder: [],
      assignToMemberId: [],
    },
  });

  // const selectedFile = docsWatch("document");
  const { query } = router;
  const { progress } = query;

  useEffect(() => {
    if (caseData?.organization) {
      getAllTeamMembers(caseData?.organization?._id);
    }
  }, [caseData]);

  const getAllTeamMembers = async (id) => {
    try {
      const res = await Axios.get(
        `/user/get-all-team-members?organization=${id}&limit=100`,
        {
          authenticated: true,
        }
      );
      setAllOrganizationMembers(res.data.data.docs || []);
      setOrganizationUser(res.data.data.docs || []);
    } catch (error) {
      toast.error("An error occured while getting all organization member");
    }
  };
  useEffect(() => {
    filterConnactedCase();
  }, [caseData]);

  const filterConnactedCase = () => {
    if (
      allConnectedCase &&
      Array.isArray(allConnectedCase) &&
      allConnectedCase.length > 0
    ) {
      const connactedCaseId =
        (caseData &&
          caseData.connectedCases &&
          Array.isArray(caseData.connectedCases) &&
          caseData.connectedCases.length > 0 && [...caseData.connectedCases]) ||
        [];
      const connactedCase =
        allConnectedCase &&
        allConnectedCase.filter((item) => connactedCaseId.includes(item._id));
      setConnactedAllCases([...connactedCase]);
    }
  };

  const filterNotConnated = useMemo(() => {
    const connactedAllCasesId =
      connactedAllCases && connactedAllCases.map((item) => item._id);
    const notConnactedCase =
      allConnectedCase &&
      allConnectedCase.filter(
        (item) => !connactedAllCasesId.includes(item._id)
      );
    return notConnactedCase;
  }, [caseData, connactedAllCases]);

  useEffect(() => {
    if (params.id || search) {
      fetchData(params.id);
    } else {
      setAllTodosData(allTodos.todos);
    }
  }, [search]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const filterNotTeamMember = useMemo(() => {
    if (members && Array.isArray(members) && members.length > 0) {
      const connected = members.map((item) => item._id);
      return allOrganizationMembers?.filter(
        (item) => !connected.includes(item._id)
      );
    }
    return [];
  }, [members, allOrganizationMembers]);

  const getDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

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

  const toggleOption = (value) => {
    const selectedOptions = new Set(todoWatch("relatedToCaseId") || []);
    if (selectedOptions.has(value)) {
      selectedOptions.delete(value);
    } else {
      selectedOptions.add(value);
    }
    setValue("relatedToCaseId", Array.from(selectedOptions));
  };

  const handleFileDownload = (url, fileName) => {
    if (!url) {
      return;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to download file. Status: ${response.status}`
          );
        }
        return response.blob();
      })
      .then((blob) => {
        const link = document.createElement("a"); // Correct tag
        const objectUrl = window.URL.createObjectURL(blob); // Create object URL
        link.href = objectUrl;
        link.download = fileName; // Set download filename
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up the link element
        window.URL.revokeObjectURL(objectUrl); // Revoke the blob URL
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  };

  const connatedColumns = [
    {
      title: "Title",
      key: "title",
    },
    {
      title: "Case Type",
      key: "caseType",
    },
    {
      title: "Case Number",
      key: "caseNumber",
    },
    {
      title: "Actions",
      key: "_id",
      render: (value, row, index) => {
        return (
          <>
            <button
              className="btn"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Delete"
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

  const handleSelectChange = async (row, value) => {
    try {
      // Update the selected value in the state for the specific row
      setSelectedValues((prevSelectedValues) => ({
        ...prevSelectedValues,
        [row._id]: value, // Store the selected value for the specific row
      }));

      // Prepare the payload for the API request
      const payLoad = {
        documentId: row?._id,
        docType: value,
      };

      // Make the API call to update the document
      await Axios.post("/case/update-documents", payLoad, {
        authenticated: true,
      });

      // Show success toast on successful update
      toast.success("Document is updated successfully");
    } catch (error) {
      toast.error("Failed to update document. Please try again.");
    }
  };
  const documentcolumns = [
    {
      title: "Title",
      key: "document",
      render: (value) => createExcerpt(value?.originalname, 20),
    },
    {
      title:"Added By",
      render: (_,raw)=>{
        return (
          <div>{raw.uploadedBy?.firstName + raw.uploadedBy?.lastName }</div>
        )
      }
    },
    {
      title: "Type",
      key: "document",
      render: (value) => value?.mimetype,
    },
    {
      title: "Uploaded At",
      key: "updatedAt",
      render: (value) => (
        <>
          {formatDateToReadableString(value)} {formatTimeToIST(value)}
        </>
      ),
    },
    {
      title: "Doc Type",
      key: "docType",
      render: (value, row, index) => (
        <select
          className="w-100 fomr-select"
          value={selectedValues[row._id] || row.docType || ""} // Use the selected value from state or fallback to row.docType
          onChange={(e) => handleSelectChange(row, e.target.value)}
        >
          <option value="">Select Doc Type</option>
          <option value="Adjournment Letter">Adjournment Letter</option>
          <option value="Admission/ Denial">Admission/ Denial</option>
          <option value="Affidavit">Affidavit</option>
          <option value="Appeal">Appeal</option>
          <option value="ADT-01">ADT-01</option>
          <option value="Affidavit of Evidence">Affidavit of Evidence</option>
          <option value="Affidavit of Service">Affidavit of Service</option>
          <option value="Affidavit of documents">Affidavit of documents</option>
          <option value="Annexure">Annexure</option>
          <option value="Application">Application</option>
          <option value="Arbitration Petition">Arbitration Petition</option>
          <option value="Arguments">Arguments</option>
          <option value="Assessment Order">Assessment Order</option>
          <option value="Bare Acts">Bare Acts</option>
          <option value="CIT(Appeals) Order">CIT(Appeals) Order</option>
          <option value="Chamber Summons">Chamber Summons</option>
          <option value="Circulars">Circulars</option>
          <option value="COD (Condonation of the Delay)">COD (Condonation of the Delay)</option>
          <option value="Commission Agreement">Commission Agreement</option>
          <option value="Company Petition">Company Petition</option>
          <option value="Compilation of documents">
            Compilation of documents
          </option>
          <option value="Complaint">Complaint</option>
          <option value="Consent Terms">Consent Terms</option>
          <option value="Criminal Complaint">Criminal Complaint</option>
          <option value="Draft Issues">Draft Issues</option>
          <option value="End User Undertaking EUU">
            End User Undertaking EUU
          </option>
          <option value="Engagement Letter">Engagement Letter</option>
          <option value="High Court Orders">High Court Orders</option>
          <option value="ITAT Order">ITAT Order</option>
          <option value="Index">Index</option>
          <option value="Intellectual Property Agreement">
            Intellectual Property Agreement
          </option>
          <option value="International Channel Partner Agreement">
            International Channel Partner Agreement
          </option>
          <option value="International Distribution Agreement">
            International Distribution Agreement
          </option>
          <option value="International Representative Agreement">
            International Representative Agreement
          </option>
          <option value="Intervention Application">
            Intervention Application
          </option>
          <option value="Issues framed">Issues framed</option>
          <option value="JV- Joint Venture Agreement">
            JV- Joint Venture Agreement
          </option>
          <option value="Lease Deed">Lease Deed</option>
          <option value="Legal Consultancy Agreement">
            Legal Consultancy Agreement
          </option>
          <option value="Letter">Letter</option>
          <option value="List of dates (LOD)">List of dates (LOD)</option>
          <option value="MOU-Memorandum of Understanding">
            MOU-Memorandum of Understanding
          </option>
          <option value="Miscellaneous Agreements">
            Miscellaneous Agreements
          </option>
          <option value="Miscellaneous Application">
            Miscellaneous Application
          </option>
          <option value="NCLT Form">NCLT Form</option>
          <option value="NDA- Non Disclosure Agreement">
            NDA- Non Disclosure Agreement
          </option>
          <option value="Notice of Motion">Notice of Motion</option>
          <option value="24">Notices</option>
          <option value="Notices">Order</option>
          <option value="Paper books">Paper books</option>
          <option value="Particular of claim">Particular of claim</option>
          <option value="Partnership Agreement">Partnership Agreement</option>
          <option value="Plaint">Plaint</option>
          <option value="Power of Attorney">Power of Attorney</option>
          <option value="Precipe">Precipe</option>
          <option value="Reconciliation">Reconciliation</option>
          <option value="Registration Certificate">
            Registration Certificate
          </option>
          <option value="Rejoinder">Rejoinder</option>
          <option value="Rent Agreement">Rent Agreement</option>
          <option value="Reply">Reply</option>
          <option value="Reply to Chamber Summons">
            Reply to Chamber Summons
          </option>
          <option value="Reply to Notice of Motion">
            Reply to Notice of Motion
          </option>
          <option value="Residual">Residual</option>
          <option value="Sales Agreement">Sales Agreement</option>
          <option value="Schedule">Schedule</option>
          <option value="Security Agency Agreement">
            Security Agency Agreement
          </option>
          <option value="Statement">Statement</option>
          <option value="Summary Suit">Summary Suit</option>
          <option value="Summon">Summon</option>
          <option value="Summons for Judgment">Summons for Judgment</option>
          <option value="Sur – rejoinder">Sur – rejoinder</option>
          <option value="Synopsis">Synopsis</option>
          <option value="Temporary Injunction Application">
            Temporary Injunction Application
          </option>
          <option value="The Agreement">The Agreement</option>
          <option value="Transfer of Technology Agreement">
            Transfer of Technology Agreement
          </option>
          <option value="Vakalatnama">Vakalatnama</option>
          <option value="Writ of Summons">Writ of Summons</option>
          <option value="Written Statement">Written Statement</option>
          <option value="Written Submission">Written Submission</option>
          <option value="Others">Others</option>
        </select>
      ),
    },
    {
      title: "Actions",
      key: "_id",
      render: (value, row, index) => {
        const fileUrl = `${downloadUrl}/${row?.document?.filename}`;
        return (
          <>
            <a href={fileUrl} target="_blank">
              <Eyeicon />
            </a>
            <button
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Download"
              className="btn ps-3"
              onClick={() =>
                handleFileDownload(
                  fileUrl,
                  row?.document?.fileName || "downloaded_file"
                )
              }
            >
              <span>
                <Download />
              </span>
            </button>
            <button
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Delete"
              className="btn ps-1"
              onClick={() => handleDeleteDocument(value)}
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

  const handleDeleteDocument = async (documentId) => {
    try {
      const res = await Axios.delete(`/case/delete-document/${documentId}`, {
        authenticated: true,
      });
      toast.success("Document is deleted successfully.");
      const id = res.data.data._id;
      const afterDeleted =
        currentCaseDocuments &&
        Array.isArray(currentCaseDocuments) &&
        currentCaseDocuments.length > 0 &&
        currentCaseDocuments.filter((item) => item._id != id);
      setCurrentCaseDocuments([...afterDeleted]);
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete Document"
      );
    }
  };

  const timeSheetColumns = [
    {
      title: "Date",
      key: "date",
      render: (value) => formatDateToReadableString(value),
    },
    {
      title: "Start",
      key: "startTime",
    },
    {
      title: "End",
      key: "endTime",
    },
    {
      title: "Description",
      key: "description",
      render: (value) => {
        const excerpt = createExcerpt(value, 20);
        return <div dangerouslySetInnerHTML={{ __html: excerpt }}></div>;
      },
    },
    {
      title: "Actions",
      key: "_id",
      render: (value, row, index) => {
        return (
          <>
            <button
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Delete"
              className="btn"
              onClick={() => handleDeleteTimesheet(value)}
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

  const handleDeleteTimesheet = async (timesheetId) => {
    try {
      const res = await Axios.delete(`/timesheet/delete/${timesheetId}`, {
        authenticated: true,
      });
      toast.success("Time sheet is deleted successfully.");
      const id = res.data.data._id;
      const afterDeleted =
        timeSheet &&
        Array.isArray(timeSheet) &&
        timeSheet.length > 0 &&
        timeSheet.filter((item) => item._id != id);
      setTimeSheet([...afterDeleted]);
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete Time sheet"
      );
    }
  };

  // handle reimbursement

  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [reimLoading, setReimLoading] = useState(false);

  const reimbursementExpenses = useMemo(
    () =>
      allExpenses?.filter(
        (item) => !item.reimbursement && item.addedBy?.email == userEmail
      ),
    [allExpenses, userEmail]
  );

  const handleToggleSelectAllExpenses = (e) => {
    let value = e.target.checked;
    if (value) {
      // let allPosibleExpenses = allExpenses.filter((item) => !item.reimbursement && item.addedBy.email == userEmail);
      if (reimbursementExpenses.length > 0) {
        let allExpensesData = reimbursementExpenses.map((item) => item._id);
        setSelectedExpenses(allExpensesData);
      }
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleExpenseSelect = (e, data) => {
    let value = e.target.checked;
    let expenseId = e.target.value;
  
    setSelectedExpenses((prev) => {
      if (value) {
        if (!prev.includes(expenseId)) {
          return [...prev, expenseId]; // Append the selected ID
        }
        return prev;
      } else {
        return prev.filter((el) => el !== expenseId); // Remove the deselected ID
      }
    });
  
    setRemburshmentData((prev = []) => {
      if (value) {
        return [...prev, data]; // Add new expense data
      } else {
        return prev.filter((el) => el.id !== data.id); // Remove deselected expense data
      }
    });
  };
  
  

  const handleResetExpenses = async () => {
    try {
      const res = await Axios.get(`/expenses/get-all?caseId=${caseData._id}`, {
        authenticated: true,
      });

      const result = res.data.data;
      setAllExpenses(
        (result.docs &&
          Array.isArray(result?.docs) &&
          result.docs.length > 0 && [...result.docs]) ||
          []
      );
    } catch (error) {
      console.error(error.message, "Error reseting expenses.");
    }
  };

  const expenseColumns = [
    {
      title: "Type",
      key: "_id",
      renderTh: () => {
        return (
          <input
            type="checkbox"
            name="selectAllExpenses"
            id="selectAllExpenses"
            onChange={(e) => handleToggleSelectAllExpenses(e)}
            checked={
              selectedExpenses &&
              Array.isArray(selectedExpenses) &&
              selectedExpenses.length > 0 &&
              selectedExpenses.length == reimbursementExpenses.length
            }
          />
        );
      },
      render: (value, item, index) => {
        return (
          <input
            type="checkbox"
            name={`expense${index}`}
            id={`expense${index}`}
            onChange={(e)=>handleExpenseSelect(e,item)}
            value={value}
            checked={selectedExpenses.includes(value)}
            disabled={
              (item.reimbursement ? true : false) ||
              item.addedBy?.email !== userEmail
            }
          />
        );
      },
    },
    {
      title: "Type",
      key: "type",
    },
    {
      title: "Amount",
      key: "amount",
    },
    {
      title: "Date",
      render: (value,row) => {
        return <>{formatDateToReadableString(row?.startDate)} To {formatDateToReadableString(row?.endDate)}</>;
      },
    },
    {
      title: "Description",
      key: "description",
      render: (value) => {
        const excerpt = createExcerpt(value, 20);
        return <div dangerouslySetInnerHTML={{ __html: excerpt }}></div>;
      },
    },
    {
      title: "Reimbursement",
      key: "reimbursement",
      render: (value) => {
        return (
          <span
            className={`text-capitalize ${
              value == "approved"
                ? "text-success"
                : value == "rejected"
                ? "text-danger"
                : ""
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "_id",
      render: (value, row, index) => {
        const fileUrl = `${downloadUrl}/${row?.bill}`;
        return (
          <>
            {row?.bill && (
              <button
                className="btn"
                onClick={() =>
                  handleFileDownload(
                    fileUrl,
                    row?.billName || "downloaded_file"
                  )
                }
              >
                <span>
                  <Download />
                </span>
              </button>
            )}
            {!row?.reimbursement ||
              (row?.reimbursement == "requested" && (
                <button
                  className="btn"
                  onClick={() => handleDeleteExpense(value)}
                >
                  <span>
                    <Trash />
                  </span>
                </button>
              ))}
          </>
        );
      },
    },
  ];

  const handleRaiseReimbursementRequest = async () => {
    try {
      if (reimLoading) return;
      setReimLoading(true);

      // Generate PDF Blob
      const pdfBlob = await RemburshmentPdf(remburshmentData,adminUser,accountantUser);
      if (!(pdfBlob instanceof Blob) || pdfBlob.size < 10) {
        throw new Error("Generated PDF is empty or invalid.");
      }

      const pdfFile = new File([pdfBlob], "Reimbursement.pdf", {
        type: "application/pdf",
      });

      // Prepare FormData
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      // Ensure expenses are sent as an array
      selectedExpenses.forEach((expense) => {
        formData.append("expenses[]", expense);
      });

      // Send request
      const res = await Axios.post(
        `/expenses/raise-reimbursement-request`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          authenticated: true, // Ensure authentication
        }
      );

      toast.success("Reimbursement raised successfully.");
      setRemburshmentData({});
      setSelectedExpenses([]);
      handleResetExpenses();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while raising reimbursement."
      );
    } finally {
      setRemburshmentData({});
      setReimLoading(false);
    }
  };

  // End handle reimbursement

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await Axios.delete(`/expenses/delete/${expenseId}`, {
        authenticated: true,
      });
      toast.success("Expense is deleted successfully.");
      const id = res.data.data._id;
      const afterDeleted =
        allExpenses &&
        Array.isArray(allExpenses) &&
        allExpenses.length > 0 &&
        allExpenses.filter((item) => item._id != id);
      setAllExpenses([...afterDeleted]);
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete Expense"
      );
    }
  };

  const membersColumns = [
    {
      title: "Name",
      key: "firstName",
    },
    {
      title: "Email",
      key: "email",
    },
    {
      title: "Phone Number",
      key: "phoneNumber",
    },
    {
      title: "Actions",
      key: "_id",
      render: (value, row, index) => {
        return (
          <>
            <button
              className="btn"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Delete"
              onClick={() => handleDeleteTeamMember(value)}
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

  const handleDeleteTeamMember = async (memeberId) => {
    try {
      setLoading(true);
      const newTeamMemberId =
        members && Array.isArray(members) && members.length > 0
          ? members
              .filter((item) => item._id != memeberId) // Filter out the member with the specified ID
              .map((item) => item._id) // Map to extract the IDs
          : [];

      const payLoad = {
        caseId: params?.id,
        yourTeam: [...newTeamMemberId],
      };
      const res = await Axios.post("/case/update-case", payLoad, {
        authenticated: true,
      });
      toast.success("Team-member is deleted successfully");
      setMembers((pre) => [...res.data.data?.yourTeam]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const fetchData = async (caseId) => {
    try {
      const response = await Axios.get(
        `/to-dos/get-all-todos?&caseId=${caseId}&page=1&${
          search ? `filter=${search}` : ""
        }`,
        { authenticated: true }
      );
      setAllTodosData(response?.data?.data?.todos || {});
      setCurrentTodoCount({ ...response?.data?.data?.counts });
    } catch (error) {
      return;
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "reminder",
  });

  const expsEditorHandler = (data) => {
    setExpsEditorValue(data);
  };

  const todoEditorHandler = (data) => {
    setTodoEditorValue(data);
  };

  const activityEditorHandler = (data) => {
    setActivityEditError("");
    setActivityEditorValue(data);
  };

  const timeSheetEdtorHandle = (data) => {
    setTimeSheetEditor(data);
  };

  const notesEdtorHandle = (data) => {
    setNotesEditorError("");
    setNotesEditor(data);
  };

  const expsSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("caseId", params?.id); // Add case ID
      formData.append("description", expsEditorValue || ""); // Add description

      // Append non-file data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "bill") {
          formData.append(key, value);
        }
      });

      // Handle file input
      if (data.bill && data.bill[0]) {
        formData.append("bill", data.bill[0]); // Add the file
      }

      const res = await Axios.post("/expenses/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        authenticated: true, // Ensure you handle authentication properly
      });

      toast.success("Expense Added successfully");
      handleResetExpenses();
      setExpsEditorValue("");
      expsReset(); // Reset the form
      closeExpenseModal.current.click(); // Close the modal
    } catch (error) {
      toast.error("Failed to add expense. Please try again.");
    }
  };

  const timeSubmit = async (data) => {
    try {
      const payLoad = {
        ...data,
        caseId: params?.id,
        description: timeSheetEditor,
      };
      const res = await Axios.post("/timesheet/add", payLoad, {
        authenticated: true,
      });
      setTimeSheet((prev) => {
        const newEntry = { ...res.data.data };
        return prev.length === 0 ? [newEntry] : [...prev, { ...newEntry }];
      });
      toast.success("Time Sheet Entry Added successfully");
      setTimeSheetEditor("");
      timeReset(); // Reset the form
      closeModal.current.click(); // Close the modal
    } catch (error) {
      toast.error("Failed to add expense. Please try again.");
    }
  };

  const opponentSubmit = async (data) => {
    try {
      const payload = {
        opponents: [{ ...data }],
        caseId: params?.id,
      };
      const res = await Axios.post("/case/update-case", payload, {
        authenticated: true,
      });
      opponentReset();
      setNewOpponents(res.data.data?.opponents);
      opponentCloseModal.current.click();
      toast.success("Opponent added successfully");
    } catch (error) {
      toast.error(error.response.data.message || "An error occured");
    }
  };

  const advocateSubmit = async (data) => {
    try {
      const payload = {
        opponentAdvocates: [{ ...data }],
        caseId: params?.id,
      };
      const res = await Axios.post("/case/update-case", payload, {
        authenticated: true,
      });
      advocateReset();
      setNewAdvocateOpponents(res.data.data?.opponents);
      opponentAdvocateCloseModal.current.click();
      toast.success("Opponent added successfully");
    } catch (error) {
      toast.error(error.response.data.message || "An error occured");
    }
    advocateReset();
  };

  const addConnactedHnadler = async () => {
    if (!connactedCases) {
      return setConnactedCaseError("Please select atleast one case to connact");
    }
    try {
      setLoading(true);
      const id = params.id;
      const res = await Axios.post(
        `/case/connect-case/${id}`,
        { connectedCase: connactedCases },
        {
          authenticated: true,
        }
      );
      toast.success("Case connacted successfully");
      setLoading(false);
      setConnactedAllCases([...res.data.data?.caseData?.connectedCases]);
      setConnactedCases("");
    } catch (error) {
      setLoading(false);
      setConnactedCases("");
      toast.error(error.response.data.message || "An error occured");
    }
  };

  const notesSubmit = async (data) => {
    try {
      if (!notesEditor) {
        return setNotesEditorError("This field is required");
      }
      let informClient = {};
      if (data && data.inform && data.inform === "yes") {
        informClient["email"] = data.email || false;
        informClient["phoneNumber"] = data.phoneNumber || false;
        informClient["whatsapp"] = data.whatsapp || false;
      }

      let informTeamMember = [];
      if (
        data.informTeamMember &&
        data.informTeamMember === "yes" &&
        selectedSendingNoteSheetMembers &&
        Array.isArray(selectedSendingNoteSheetMembers) &&
        selectedSendingNoteSheetMembers.length > 0
      ) {
        informTeamMember = [...selectedSendingNoteSheetMembers];
      }
      setLoading(true);
      const payLoad = {
        caseId: params?.id,
        description: notesEditor,
        ...(informClient && { informClient }),
        ...(informTeamMember.length && { informTeamMember }),
      };

      const res = await Axios.post("/notes/add", payLoad, {
        authenticated: true,
      });
      toast.success("Notes Added successfully");
      setLoading(false);
      setNotesEditor("");
      setCurrentNotes((pre) => [...pre, { ...res.data.data }]);
      setTeamSelectedUsers([]);
      setSuggestions([]);
      setTeamQuery("");
      setSelectedSendingNoteSheetMembers([]);
      notesReset();
    } catch (error) {
      setLoading(false);
      toast.success(error?.response?.data?.message || "An error occured");
    }
  };

  // List of valid file extensions
  const validFileExtensions = [
    "pdf",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "jpg",
    "jpeg",
    "png",
  ];

  // File validation function to check the file's extension and size
  const validateFile = (file) => {
    if (!file) return "No file selected";

    // Check file extension
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!validFileExtensions.includes(fileExtension)) {
      return "Unsupported file format";
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      return "File size should be less than 100MB";
    }

    return true; // File is valid
  };
  // Handle file selection (either through drag-and-drop or file input)
  const handleFileChange = (e) => {
    const files = e.target.files;
    const file = files[0];
    const validationResult = validateFile(file);
    if (validationResult === true) {
      setSelectedFile(file); // Set the selected file if valid
      setError(""); // Clear any previous error
    } else {
      setError(validationResult); // Set error message if validation fails
    }
  };

  // Handle drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    const file = files[0];
    const validationResult = validateFile(file);
    if (validationResult === true) {
      setSelectedFile(file); // Set the selected file if valid
      setError(""); // Clear any previous error
    } else {
      setError(validationResult); // Set error message if validation fails
    }
  };

  // Handle drag over (needed for drag and drop)
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle submit
  const docsSubmitHandler = async (data) => {
    if (!selectedFile) {
      setError("File is required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("caseId", params?.id);

      // Append document if selected
      formData.append("document", selectedFile);

      // Make the API request
      const res = await Axios.post("/case-documents/upload", formData, {
        authenticated: true, // Assuming this flag is handled in an Axios interceptor
      });
      const newDoc = res.data.data;
      toast.success("Document uploaded successfully");
      setLoading(false);
      setSelectedFile(null);
      setCurrentCaseDocuments([...currentCaseDocuments, { ...newDoc[0] }]);
      docsReset(); // Reset the form
    } catch (error) {
      setLoading(false);
      toast.error(error.response.data.message || "An error occurred");
    }
  };

  const todoSubmit = async (data) => {
    try {
      setLoading(true);
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      // Add `assignToMemberId` if `selectedUsers` is an array and not empty
      if (
        selectedUsers &&
        Array.isArray(selectedUsers) &&
        selectedUsers.length > 0
      ) {
        filteredData["assignToMemberId"] = [...selectedUsers];
      }

      if (
        data.reminder &&
        Array.isArray(data.reminder) &&
        data.reminder.some((rem) => rem.reminderTime || rem.reminderMode)
      ) {
        filteredData["reminder"] = data.reminder;
      } else {
        delete filteredData.reminder;
      }

      if (params?.id) {
        filteredData["caseId"] = params?.id;
      }

      // Send the filtered data as the payload
      const res = await Axios.post("/to-dos/add-to-dos", filteredData, {
        authenticated: true,
      });

      toast.success("ToDo is created successfully");
      setLoading(false);
      todoReset();
      fetchData(params.id);
      setTodoEditorValue("");
      setSelectedUsers([]);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An error occurred");
      todoReset();
      setSelectedUsers([]);
    }
  };

  const activeSubmit = async (data) => {
    try {
      if (!activityEditorValue) {
        return setActivityEditError("This field is required");
      }

      let informClient = {};
      if (data && data.inform && data.inform === "yes") {
        informClient["email"] = data.email || false;
        informClient["phoneNumber"] = data.phoneNumber || false;
        informClient["whatsapp"] = data.whatsapp || false;
      }

      let informTeamMember = [];
      if (
        data.informTeamMember &&
        data.informTeamMember === "yes" &&
        selectedSendingActiveMembers &&
        Array.isArray(selectedSendingActiveMembers) &&
        selectedSendingActiveMembers.length > 0
      ) {
        informTeamMember = [...selectedSendingActiveMembers];
      }

      setLoading(true);

      // Build the payload
      const payLoad = {
        caseId: params?.id,
        description: activityEditorValue,
        ...(informClient && { informClient }),
        ...(informTeamMember.length > 0 && { informTeamMember }),
      };

      const res = await Axios.post("/activity/add", payLoad, {
        authenticated: true,
      });

      toast.success("Activity is created successfully");
      setLoading(false);
      setActivityEditorValue("");
      setSelectedSendingActiveMembers([]);
      setActiveTeamSelectedUsers([]);
      setActiveSuggestions([]);
      setActiveTeamQuery("");
      setActivity((pre) => [...pre, { ...res?.data?.data }]);
      activeReset();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const teamSubmitHandler = async () => {
    try {
      if (teamMemberId.length === 0) {
        return setTeamError("Please select at least one team member");
      }
      setLoading(true);
      const previousTeamMemberId =
        members &&
        Array.isArray(members) &&
        members.length > 0 &&
        members.map((item) => item._id);
      const payLoad = {
        caseId: params?.id,
        yourTeam: [...previousTeamMemberId, ...teamMemberId],
      };
      const res = await Axios.post("/case/update-case", payLoad, {
        authenticated: true,
      });
      toast.success("Case is updated successfully");
      setMembers((pre) => [...res.data.data?.yourTeam]);
      setLoading(false);
      setTeamMemberId("");
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleTimeSheetPageClick = useCallback(
    debounce(async (event) => {
      try {
        const selectedPage = event.selected + 1;
        if (selectedPage) {
          const res = await Axios.get(
            `/timesheet/get-all?caseId=${query.id}&page=${selectedPage}`,
            { authenticated: true }
          );
          const result = res.data.data;
          setSelectedTimesheetpage(selectedPage);
          setTimeSheet(
            Array.isArray(result?.docs) && result.docs.length > 0
              ? [...result.docs]
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      }
    }, 300),
    [query]
  );

  const handleNotesPageClick = useCallback(
    debounce(async (event) => {
      try {
        const selectedPage = event.selected + 1;
        if (selectedPage) {
          const res = await Axios.get(
            `/notes/get-all?caseId=${query.id}&page=${selectedPage}`,
            { authenticated: true }
          );
          const result = res.data.data;

          setCurrentNotes(
            Array.isArray(result?.docs) && result.docs.length > 0
              ? [...result.docs]
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      }
    }, 300),
    [query]
  );

  const handleTodoPageClick = useCallback(
    debounce(async (event) => {
      try {
        const selectedPage = event.selected + 1;
        if (selectedPage) {
          const res = await Axios.get(
            `/to-dos/get-all-todos?caseId=${query.id}&page=${selectedPage}`,
            { authenticated: true }
          );
          const result = res.data.data?.todos;

          setCurrentTodos(
            Array.isArray(result?.docs) && result.docs.length > 0
              ? [...result.docs]
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      }
    }, 300),
    [query]
  );

  const handleActivitiesPageClick = useCallback(
    debounce(async (event) => {
      try {
        const selectedPage = event.selected + 1;
        if (selectedPage) {
          const res = await Axios.get(
            `/activity/get-all?caseId=${query.id}&page=${selectedPage}`,
            { authenticated: true }
          );
          const result = res.data.data;

          setActivity(
            Array.isArray(result?.docs) && result.docs.length > 0
              ? [...result.docs]
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      }
    }, 300),
    [query]
  );

  const handleMemberPageClick = useCallback(
    debounce(async (event) => {
      try {
        const selectedPage = event.selected + 1;
        if (selectedPage) {
          const res = await Axios.get(
            `/user/get-all-team-members?caseId=${query.id}&page=${selectedPage}`,
            { authenticated: true }
          );
          const result = res.data.data;
          setSelectedMembersPage(selectedPage);
          setMembers(
            Array.isArray(result?.docs) && result.docs.length > 0
              ? [...result.docs]
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      }
    }, 300),
    [query]
  );

  const handleExpensePageClick = useCallback(
    debounce(async (event) => {
      try {
        const selectedPage = event.selected + 1;
        if (selectedPage) {
          const res = await Axios.get(
            `/expenses/get-all?caseId=${query.id}&page=${selectedPage}`,
            {
              authenticated: true,
            }
          );
          const result = res.data.data;
          setselectedExpensespage(selectedPage);
          setAllExpenses(
            (result.docs &&
              Array.isArray(result?.docs) &&
              result.docs.length > 0 && [...result.docs]) ||
              []
          );
        }
      } catch (error) {
        console.error(error);
      }
    }, 300),
    [query]
  );

  const handleDocumentPageClick = useCallback(
    debounce(async (event) => {
      try {
        const selectedPage = event.selected + 1;
        if (selectedPage) {
          const res = await Axios.get(
            `/case-documents/get-all-case-douments?caseId=${query.id}&page=${selectedPage}`,
            {
              authenticated: true,
            }
          );
          const result = res.data.data;
          setselectedDocumentspage(selectedPage);
          setCurrentCaseDocuments(
            (result.docs &&
              Array.isArray(result?.docs) &&
              result.docs.length > 0 && [...result.docs]) ||
              []
          );
        }
      } catch (error) {
        console.error(error);
      }
    }, 300),
    [query]
  );

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
      fetchData(params.id);
      setShowTodo();
      toast.success("Todo is updated successfully");
      closeTdoModal.current.click();
    } catch (error) {
      toast.error(
        error.response.data.message ||
          "Ac error occured while update todo status"
      );
    }
  };

  const caseStatusHandler = async (e) => {
    const status = e.target.value;
    setSlectedStatus(status);
    try {
      const payLoad = {
        caseId: params?.id,
        status: status,
      };
      const res = await Axios.post("/case/update-case", payLoad, {
        authenticated: true,
      });
      toast.success("Case Status is updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const breadcrumbItems = [
    { label: "Cases", href: "/management/cases" }, // Last item (non-clickable)
    { label: "View Case" }, // Last item (non-clickable)
    { label: createExcerpt(currentCase?.caseData?.title, 40) }, // Last item (non-clickable)
  ];

  // Notification team member select
  const handleChange = (e) => {
    const input = e.target.value;
    setTeamQuery(input);

    if (input.includes("@")) {
      const queryAfterAt = input.split("@")[1];

      const filteredUsers =
        members &&
        Array.isArray(members) &&
        members.filter((user) =>
          user.firstName.toLowerCase().includes(queryAfterAt.toLowerCase())
        );
      setSuggestions(filteredUsers);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (user) => {
    if (
      !teamSelectedUsers.find((selectedUser) => selectedUser._id === user._id)
    ) {
      setTeamSelectedUsers([...teamSelectedUsers, user]);
    }
    setSuggestions([]);
    setTeamQuery("");
  };

  const handleRemove = (userToRemove) => {
    setTeamSelectedUsers(
      teamSelectedUsers.filter((user) => user._id !== userToRemove._id)
    );
  };

  //  Active team member select funtion
  const activeHandleChange = (e) => {
    const input = e.target.value;
    setActiveTeamQuery(input);

    if (input.includes("@")) {
      const queryAfterAt = input.split("@")[1];

      const filteredUsers =
        members &&
        Array.isArray(members) &&
        members.filter((user) =>
          user.firstName.toLowerCase().includes(queryAfterAt.toLowerCase())
        );
      setActiveSuggestions(filteredUsers);
    } else {
      setActiveSuggestions([]);
    }
  };

  const activeHandleSelect = (user) => {
    if (
      !activeTeamSelectedUsers.find(
        (selectedUser) => selectedUser._id === user._id
      )
    ) {
      setActiveTeamSelectedUsers([...activeTeamSelectedUsers, user]);
    }
    setActiveSuggestions([]);
    setActiveTeamQuery("");
  };

  const activeHandleRemove = (userToRemove) => {
    setActiveTeamSelectedUsers(
      activeTeamSelectedUsers.filter((user) => user._id !== userToRemove._id)
    );
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <section className={caseStyle.caseSec}>
        <div className="row mb-4">
          <div className="col-md-4">
            <h2 className={caseStyle.caseheading}>
              {createExcerpt(title, 25) || ""}
            </h2>
          </div>
          <div className="col-lg-4">
            <div className={caseStyle.casegrey}>
              <span className={caseStyle.casebar}>
                <span>
                  <Next />
                </span>
                Next Hearing
              </span>
              <Marquee>
                {nextHearing &&
                  nextHearing.hearingDate &&
                  nextHearing.caseId &&
                  nextHearing.caseId.title && (
                    <>
                      <span>
                        {formatDateToReadableString(nextHearing.hearingDate)}:
                      </span>
                      <span> {nextHearing.caseId.title}</span>
                    </>
                  )}
              </Marquee>
            </div>
          </div>
          <div className="col-lg-2">
            <Link
              href={`/management/calendar/${params?.id}`}
              className={`${caseStyle.casecalender} justify-content-center text-decoration-none`}
            >
              <span className={caseStyle.casespan}>
                <CalendarIcon />
                <h2 className={caseStyle.casecal}>Case Calendar</h2>
              </span>
            </Link>
          </div>
          <div div className="col-lg-2">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => caseStatusHandler(e)}
            >
              <option value="" hidden>
                {status && status == "open"
                  ? "Pending"
                  : status == "archive"
                  ? "Archive"
                  : "Close"}
              </option>
              <option value="close" hidden={selectedStatus == "close"}>
                Close
              </option>
              <option value="archive" hidden={selectedStatus == "archive"}>
                Archive
              </option>
              <option value="open" hidden={selectedStatus == "open"}>
                Pending
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className={caseStyle.caseacc}>
        <div className="row pb-4">
          <div className="col-lg-3">
            <div className="accordion" id="accordionExample">
              <div className="accordion-item mb-3">
                <h2 className="accordion-header" id="headingOne">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    Case Information
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body px-0">
                    {courtTitle && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Court:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {courtTitle || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {highCourtId && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>High Court:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {highCourtId.title || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {benches && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Bench:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {benches.title || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {departmentId && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Department:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {departmentId.title || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {departmentId && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Authority:</div>
                        </div>
                        <div className="col border">
                          <div
                            className={`${caseStyle.caseNumber} text-capitalize`}
                          >
                            {!authority || authority == "Unknown Authority"
                              ? "Other"
                              : authority
                              ? authority
                              : ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {caseType && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Case Type:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {caseType || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {classification && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>
                            Classification:
                          </div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {classification || ""}
                          </div>
                        </div>
                      </div>
                    )}

                    {caseNumber && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Case No:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {caseNumber || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {dateOfFilling && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>
                            Date of Notice/Order:
                          </div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {formatDateToReadableString(dateOfFilling) || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {caseYear && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Case Year:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {caseYear || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {financialYear &&
                      Array.isArray(financialYear) &&
                      financialYear.length > 0 && (
                        <div className="row g-0">
                          <div className="col border">
                            <div className={caseStyle.caseName}>
                              Financial Year:
                            </div>
                          </div>
                          <div className="col border">
                            <div className={caseStyle.caseNumber}>
                              {financialYear?.map((item, index) => {
                                return <div key={index}>{item}</div>;
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div className="accordion-item mb-3">
                <h2 className="accordion-header" id="headingTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Case Priority
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body px-0">
                    {priority && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>Priority:</div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {priority || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {appearingModel && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>
                            Appearing Model:
                          </div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {appearingModel.title || ""}
                          </div>
                        </div>
                      </div>
                    )}
                    {appearingAs && (
                      <div className="row g-0">
                        <div className="col border">
                          <div className={caseStyle.caseName}>
                            Appearing as:
                          </div>
                        </div>
                        <div className="col border">
                          <div className={caseStyle.caseNumber}>
                            {appearingAs || ""}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="accordion-item mb-3">
                <h2 className="accordion-header" id="headingThree">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                    Current Status
                  </button>
                </h2>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingThree"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body px-0">
                    <div className="row g-0">
                      <div className="col border">
                        <div className={caseStyle.caseName}>Stage:</div>
                      </div>
                      <div className="col border">
                        <div className={caseStyle.caseNumber}>
                          {nextHearing && nextHearing.stage
                            ? nextHearing.stage
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="row g-0">
                      <div className="col border">
                        <div className={caseStyle.caseName}>Posted For:</div>
                      </div>
                      <div className="col border">
                        <div className={caseStyle.caseNumber}>
                          {nextHearing && nextHearing.postedFor
                            ? nextHearing.postedFor
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="row g-0">
                      <div className="col border">
                        <div className={caseStyle.caseName}>
                          Last Action Taken:
                        </div>
                      </div>
                      <div className="col border">
                        <div className={caseStyle.caseNumber}>
                          {nextHearing && nextHearing.actionTaken
                            ? nextHearing.actionTaken
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="row g-0">
                      <div className="col border">
                        <div className={caseStyle.caseName}>Hearing Date:</div>
                      </div>
                      <div className="col border">
                        <div className={caseStyle.caseNumber}>
                          {nextHearing && nextHearing.hearingDate
                            ? formatDateToReadableString(
                                nextHearing.hearingDate
                              )
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="row g-0">
                      <div className="col border">
                        <div className={caseStyle.caseName}>Session:</div>
                      </div>
                      <div className="col border">
                        <div className={caseStyle.caseNumber}>
                          {nextHearing && nextHearing.session
                            ? nextHearing.session
                            : ""}
                        </div>
                      </div>
                    </div>
                    {/* <div className="row g-0">
                      <div className="col border">
                        <div className={caseStyle.caseName}>Appeal:</div>
                      </div>
                      <div className="col border">
                        <div className={caseStyle.caseNumber}>
                          FORM GST APL-01-Appeal Order
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="accordion-item mb-3">
                <h2 className="accordion-header" id="yourClientHeading">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#yourClient"
                    aria-expanded="true"
                    aria-controls="yourClient"
                  >
                    {" "}
                    Your Clients  {appearingAs ? "( " + appearingAs + " )" : ""}
                  </button>
                </h2>
                <div
                  id="yourClient"
                  className="accordion-collapse collapse"
                  aria-labelledby="yourClientHeading"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body px-0">
                    {yourClientId && yourClientId.fullName && (
                      <p>{yourClientId.fullName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="accordion-item mb-3">
                <h2 className="accordion-header" id="headingOne">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#opponent"
                    aria-expanded="true"
                    aria-controls="opponent"
                  >
                    Opponents (Respondent)
                  </button>
                </h2>
                <div
                  id="opponent"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body px-0">
                    {newOpponents &&
                      Array.isArray(newOpponents) &&
                      newOpponents.length > 0 &&
                      newOpponents.map((el, ind) => (
                        <>
                          <p className="d-flex gap-4">
                            <span>Name :</span>
                            <span>{el?.fullName}</span>
                          </p>
                          <p className="d-flex gap-4">
                            <span>Email :</span>
                            <span>{createExcerpt(el?.email, 17)}</span>
                          </p>
                          <p className="d-flex gap-4">
                            <span>Phone :</span>
                            <span>{el?.phoneNumber}</span>
                          </p>
                        </>
                      ))}
                  </div>
                </div>
              </div>

              <div className="accordion-item mb-3">
                <h2 className="accordion-header" id="headingAdvocate">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#advocate"
                    aria-expanded="true"
                    aria-controls="advocate"
                  >
                    Opponent Advocates (Respondent)
                  </button>
                </h2>
                <div
                  id="advocate"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingAdvocate"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body px-0">
                    {newAdvocateOpponents &&
                      Array.isArray(newAdvocateOpponents) &&
                      newAdvocateOpponents.length > 0 &&
                      newAdvocateOpponents.map((el, ind) => (
                        <>
                          <p className="d-flex gap-4">
                            <span>Name :</span>
                            <span>{el?.fullName}</span>
                          </p>
                          <p className="d-flex gap-4">
                            <span>Email :</span>
                            <span>{createExcerpt(el?.email, 17)}</span>
                          </p>
                          <p className="d-flex gap-4">
                            <span>Phone :</span>
                            <span>{el?.phoneNumber}</span>
                          </p>
                        </>
                      ))}
                  </div>
                </div>
              </div>

              <div className="accordion-item mb-3">
                <h2 className="accordion-header" id="hearingHistoryHeading">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#hearingHistory"
                    aria-expanded="true"
                    aria-controls="advocate"
                  >
                    Hearings Date History
                  </button>
                </h2>
                <div
                  id="hearingHistory"
                  className="accordion-collapse collapse"
                  aria-labelledby="hearingHistoryHeading"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body px-0">
                    {hearings &&
                    Array.isArray(hearings) &&
                    hearings.length > 0 ? (
                      hearings.map((el) => (
                        <p>
                          <>
                            <span>
                              {formatDateToReadableString(el.hearingDate)}:
                            </span>
                            <span> {el.caseId.title}</span>
                          </>
                        </p>
                      ))
                    ) : (
                      <p>No hearings were recorded for this case</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="card px-0 mb-4">
              <div className={caseStyle.caseCard}>
                <div
                  className={`card-header d-flex justify-content-between ${caseStyle.caseCards}`}
                >
                  <h2>
                    {" "}
                    Your Clients  {appearingAs ? "( " + appearingAs + " )" : ""}
                  </h2>
                  <div className={`d-flex ${caseStyle.caseLink}`}>
                    <Update />
                    <a className="nav-link ms-2" href="#">
                      Update
                    </a>
                  </div>
                </div>
              </div>


              <div className="card-body border-light">
                {yourClientId && yourClientId.fullName && (
                  <p className={caseStyle.caseBodyGrey}>
                    {yourClientId.fullName}
                  </p>
                )}
              </div>
            </div> */}

            {/* <div className="accordion" id="accordionExampleClient">
             
             <div className="accordion-item mb-3">
               <h2 className="accordion-header" id="yourClientHeading">
                 <button
                   className="accordion-button"
                   type="button"
                   data-bs-toggle="collapse"
                   data-bs-target="#yourClient"
                   aria-expanded="true"
                   aria-controls="yourClient"
                 >
                      {" "}
                      Your Clients  {appearingAs ? "( " + appearingAs + " )" : ""}
                 </button>
               </h2>
               <div
                 id="yourClient"
                 className="accordion-collapse collapse"
                 aria-labelledby="yourClientHeading"
                 data-bs-parent="#accordionExampleClient"
               >
                 <div className="accordion-body px-0">
                 {yourClientId && yourClientId.fullName && (
                  <p>
                    {yourClientId.fullName}
                  </p>
                )}
                 </div>
               </div>
             </div>
             </div> */}

            {/* <div className="card px-0 mb-4">
              <div className={caseStyle.caseCard}>
                <div
                  className={`card-header d-flex justify-content-between ${caseStyle.caseCards}`}
                >
                  <h2> Opponents (Respondent)</h2>
                  <div className={`d-flex ${caseStyle.caseLink}`}>
                    <Add color="#FDD106" />
                    <a
                      className="nav-link ms-2"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#opponentModal"
                    >
                      Add Opponent
                    </a>
                  </div>
                </div>
              </div>
              <div className="card-body border-light">
                {newOpponents &&
                  Array.isArray(newOpponents) &&
                  newOpponents.length > 0 &&
                  newOpponents.map((el, ind) => (
                    <>
                      <p className="d-flex gap-4">
                        <span>Name :</span>
                        <span>{el?.fullName}</span>
                      </p>
                      <p className="d-flex gap-4">
                        <span>Email :</span>
                        <span>{createExcerpt(el?.email, 17)}</span>
                      </p>
                      <p className="d-flex gap-4">
                        <span>Phone :</span>
                        <span>{el?.phoneNumber}</span>
                      </p>
                    </>
                  ))}
              </div>
            </div> */}

            {/* <div className="card px-0 mb-4">
              <div className={caseStyle.caseCard}>
                <div
                  className={`card-header d-flex justify-content-between ${caseStyle.caseCards}`}
                >
                  <h2> Opponent Advocates (Respondent)</h2>
                  <div className={`d-flex ${caseStyle.caseLink}`}>
                    <Add color="#FDD106" />
                    <a
                      className="nav-link ms-2"
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#opponentadvocateModal"
                    >
                      Add Opponent Advocates
                    </a>
                  </div>
                </div>
              </div>
              <div className="card-body border-light">
                {newAdvocateOpponents &&
                  Array.isArray(newAdvocateOpponents) &&
                  newAdvocateOpponents.length > 0 &&
                  newAdvocateOpponents.map((el, ind) => (
                    <>
                      <p className="d-flex gap-4">
                        <span>Name :</span>
                        <span>{el?.fullName}</span>
                      </p>
                      <p className="d-flex gap-4">
                        <span>Email :</span>
                        <span>{createExcerpt(el?.email, 17)}</span>
                      </p>
                      <p className="d-flex gap-4">
                        <span>Phone :</span>
                        <span>{el?.phoneNumber}</span>
                      </p>
                    </>
                  ))}
              </div>
            </div> */}

            {/* <div className="card px-0 mb-4">
              <div className={caseStyle.caseCard}>
                <div className={`card-header d-flex ${caseStyle.caseCards}`}>
                  <h2> Hearings Date History</h2>
                </div>
              </div>
              <div className="card-body border-light">
                {hearings && Array.isArray(hearings) && hearings.length > 0 ? (
                  hearings.map((el) => (
                    <p className={caseStyle.caseBodyGrey}>
                      <>
                        <span>
                          {formatDateToReadableString(el.hearingDate)}:
                        </span>
                        <span> {el.caseId.title}</span>
                      </>
                    </p>
                  ))
                ) : (
                  <p className={caseStyle.caseBodyGrey}>
                    No hearings were recorded for this case
                  </p>
                )}
              </div>
            </div> */}
          </div>
          <div className={`col-lg-9 ${caseStyle.tabsWrapper}`}>
            <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="pills-activity-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-activity"
                  type="button"
                  role="tab"
                  aria-controls="pills-activity"
                  aria-selected="true"
                >
                  <ActivityIcon className={caseStyle.iconTabs} />
                  Activity / History
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-to-dos-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-to-dos"
                  type="button"
                  role="tab"
                  aria-controls="pills-to-dos"
                  aria-selected="false"
                >
                  <Court4 className={caseStyle.iconTabs} />
                  To-Dos
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-Documents-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-Documents"
                  type="button"
                  role="tab"
                  aria-controls="pills-Documents"
                  aria-selected="false"
                >
                  <Document className={caseStyle.iconTabs} />
                  Documents
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-notes-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-notes"
                  type="button"
                  role="tab"
                  aria-controls="pills-notes"
                  aria-selected="false"
                >
                  <Notes className={caseStyle.iconTabs} />
                  Note Sheet
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-timesheet-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-timesheet"
                  type="button"
                  role="tab"
                  aria-controls="pills-timesheet"
                  aria-selected="false"
                >
                  <Timesheet className={caseStyle.iconTabs} /> Timesheet
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-TeamMembers-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-TeamMembers"
                  type="button"
                  role="tab"
                  aria-controls="pills-TeamMembers"
                  aria-selected="false"
                >
                  <TeamIcon className={caseStyle.iconTabs} />
                  Team Members
                </button>
              </li>
              {/* Other new tabs */}
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-expenses-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-expenses"
                  type="button"
                  role="tab"
                  aria-controls="pills-expenses"
                  aria-selected="false"
                >
                  <Expenses className={caseStyle.iconTabs} />
                  Expenses
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-connected-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-connected"
                  type="button"
                  role="tab"
                  aria-controls="pills-connected"
                  aria-selected="false"
                >
                  <Connected className={caseStyle.iconTabs} />
                  Connected
                </button>
              </li>
              {/* <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-fee-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-fee"
                  type="button"
                  role="tab"
                  aria-controls="pills-fee"
                  aria-selected="false"
                  disabled
                >
                  <FeeReceived className={caseStyle.iconTabs} /> Fee Received
                </button>
              </li> */}
            </ul>
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-activity"
                role="tabpanel"
                aria-labelledby="pills-activity-tab"
                tabindex="0"
              >
                <div className={caseStyle.activityFormWrapper}>
                  <label className="form-label">Description *</label>
                  <CustomEditor
                    value={activityEditorValue}
                    onChange={activityEditorHandler}
                  />
                  {activityEditError && (
                    <span className="text-danger">{activityEditError}</span>
                  )}
                  <form onSubmit={activeHandleSubmit(activeSubmit)}>
                    <div className="row">
                      <div className="col-md-5">
                        <h2>Would you like to inform client(s)?</h2>
                        <div className={caseStyle.radioWrapper}>
                          <label htmlFor="informClientYes">
                            <input
                              type="radio"
                              name="informClient"
                              id="informClientYes"
                              value="yes"
                              {...activeRegister("inform")}
                            />
                            <span>Yes</span>
                          </label>
                          <label htmlFor="informClientNo">
                            <input
                              type="radio"
                              name="informClient"
                              id="informClientNo"
                              value="no"
                              defaultChecked
                              {...activeRegister("inform")}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                      <div className="col-md-7">
                        <h2>Would you like to inform team member(s)?</h2>
                        <div className={caseStyle.radioWrapper}>
                          <label htmlFor="teamMemberYes">
                            <input
                              type="radio"
                              name="teamMemberYes"
                              id="teamMemberYes"
                              value="yes"
                              {...activeRegister("informTeamMember")}
                            />
                            <span>Yes</span>
                          </label>
                          <label htmlFor="teamMemberNo">
                            <input
                              type="radio"
                              name="teamMemberNo"
                              id="teamMemberNo"
                              value="no"
                              defaultChecked
                              {...activeRegister("informTeamMember")}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                      {informClient && informClient === "yes" && (
                        <div className="col-md-12 mt-4">
                          <h2>Client Information</h2>
                          <table
                            className="w-100"
                            style={{ border: "2px solid #ddd" }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    padding: "10px",
                                    textAlign: "left",
                                    borderBottom: "2px solid #ddd",
                                  }}
                                >
                                  Email
                                </th>
                                <th
                                  style={{
                                    padding: "10px",
                                    textAlign: "left",
                                    borderBottom: "2px solid #ddd",
                                  }}
                                >
                                  Mobile
                                </th>
                                <th
                                  style={{
                                    padding: "10px",
                                    textAlign: "left",
                                    borderBottom: "2px solid #ddd",
                                  }}
                                >
                                  WhatsApp
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #ddd",
                                  }}
                                >
                                  {yourClientId && yourClientId?.email
                                    ? yourClientId?.email
                                    : "Not Found"}
                                </td>
                                <td
                                  style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #ddd",
                                  }}
                                >
                                  {yourClientId && yourClientId?.phoneNumber
                                    ? yourClientId?.phoneNumber
                                    : "Not Found"}
                                </td>
                                <td
                                  style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #ddd",
                                  }}
                                >
                                  {yourClientId && yourClientId?.phoneNumber
                                    ? yourClientId?.phoneNumber
                                    : "Not Found"}
                                </td>
                              </tr>
                              <tr>
                                {yourClientId && yourClientId.email && (
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      {...activeRegister("email")}
                                    />
                                  </td>
                                )}
                                {yourClientId && yourClientId.phoneNumber && (
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      {...activeRegister("phoneNumber")}
                                    />
                                  </td>
                                )}
                                {yourClientId && yourClientId.phoneNumber && (
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      {...activeRegister("whatsNumber")}
                                    />
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {informTeamMember && informTeamMember == "yes" && (
                        <div className="col-md-12 mt-4">
                          <h2>Team Members</h2>
                          <table
                            className="w-100"
                            style={{ border: "2px solid #ddd" }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    width: "30px",
                                    padding: "10px",
                                    textAlign: "left",
                                    borderBottom: "2px solid #ddd",
                                  }}
                                >
                                  #
                                </th>
                                <th
                                  style={{
                                    padding: "10px",
                                    textAlign: "left",
                                    borderBottom: "2px solid #ddd",
                                  }}
                                >
                                  Team Member
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {members &&
                                Array.isArray(members) &&
                                members.length > 0 &&
                                members.map((item, index) => {
                                  return (
                                    <tr>
                                      <td
                                        style={{
                                          width: "30px",
                                          padding: "10px",
                                          borderBottom: "1px solid #ddd",
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          onChange={(e) =>
                                            informHandleCheckboxChange(
                                              item._id,
                                              e.target.checked
                                            )
                                          }
                                          checked={selectedSendingActiveMembers.includes(
                                            item._id
                                          )}
                                        />{" "}
                                      </td>
                                      <td
                                        style={{
                                          padding: "10px",
                                          borderBottom: "1px solid #ddd",
                                        }}
                                      >
                                        {`${item.firstName} ${item.lastName}`}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="commonButton mt-5"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                      <span className="ms-1">
                        {" "}
                        <RightArrow />
                      </span>
                    </button>
                  </form>
                </div>
                {activity &&
                  Array.isArray(activity) &&
                  activity.length > 0 &&
                  activity.map((el) => (
                    <div className={`${caseStyle.activityFormWrapper} mt-3`}>
                      <div
                        className={`text-capitalize ${caseStyle.documentReviewWrapper}`}
                      >
                        <h6>
                          {el?.addedBy?.firstName} {el?.addedBy?.lastName}
                        </h6>
                        <div className={caseStyle.timestampWrapper}>
                          <span className={caseStyle.timestamp}>
                            <CalendarIcon color="#898989" />
                            <span>
                              {el?.createdAt
                                ? formatDateToReadableString(el?.createdAt)
                                : ""}
                            </span>
                          </span>
                          <span className={caseStyle.timestamp}>
                            <WatchIcons color="#898989" />
                            <span className="text-uppercase">
                              {el?.createdAt
                                ? formatTimeToIST(el?.createdAt)
                                : ""}
                            </span>
                          </span>
                        </div>
                      </div>
                      <hr className={caseStyle.horizontalRow} />
                      <div className="d-flex flex-wrap gap-4">
                        <div
                          className={caseStyle.documentWrapper}
                          dangerouslySetInnerHTML={{
                            __html: el?.description || "",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}

                {activity &&
                  Array.isArray(activity) &&
                  activity.length > 0 &&
                  activitiesTotalPage > 1 && (
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel=">"
                      initialPage={activitiesPage - 1}
                      onPageChange={handleActivitiesPageClick}
                      pageRangeDisplayed={5}
                      pageCount={activitiesTotalPage}
                      previousLabel="<"
                      renderOnZeroPageCount={null}
                      className="react-pagination "
                    />
                  )}
              </div>
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade"
                  id="pills-TeamMembers"
                  role="tabpanel"
                  aria-labelledby="pills-TeamMembers-tab"
                  tabindex="0"
                >
                  <div className="container-fluid mt-4 p-0">
                    <section className={caseStyle.activityFormWrapper}>
                      <div className="row">
                        <div className="col-md-12">
                          <div className={caseStyle.tableNavHead}>
                            <div className={caseStyle.tableNavHeadingWrraper}>
                              <h2 className={caseStyle.Sectionmodalheading}>
                                Total Team member(
                                {members.length > 0 ? members.length : 0})
                              </h2>
                            </div>
                            <div className={caseStyle.tableNavButtonWrapper}>
                              <div className={caseStyle.teammemberOption}>
                                <select
                                  className={`form-select form-area ${caseStyle.teammembersectionButton}`}
                                  aria-label="Default select example"
                                  value={teamMemberId}
                                  onChange={(e) => {
                                    setTeamMemberId([e.target.value]);
                                    setTeamError("");
                                  }}
                                >
                                  <option value={""} hidden>
                                    Select members to assign to this case
                                  </option>
                                  {filterNotTeamMember &&
                                    Array.isArray(filterNotTeamMember) &&
                                    filterNotTeamMember.length > 0 &&
                                    filterNotTeamMember.map((item, index) => {
                                      return (
                                        <option
                                          value={item._id}
                                          key={index}
                                        >{`${item.firstName} ${item.lastName}`}</option>
                                      );
                                    })}
                                </select>
                                <button
                                  className={`${caseStyle.teamaddButton} btn`}
                                  type="submit"
                                  disabled={loading}
                                >
                                  <span className="me-2"></span>
                                  <span onClick={teamSubmitHandler}>
                                    Assign
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <div className="card table-card">
                            <div className="card-body  p-0 super-responsive-table">
                              <ReactResponsiveTable
                                columns={membersColumns}
                                data={members}
                                serialize={true}
                                initialCount={
                                  membersLimit * (selectedMembersPage - 1)
                                }
                              />
                              {members &&
                                Array.isArray(members) &&
                                members.length > 0 &&
                                membersTotalPage > 1 && (
                                  <ReactPaginate
                                    breakLabel="..."
                                    nextLabel=">"
                                    initialPage={membersPage - 1}
                                    onPageChange={handleMemberPageClick}
                                    pageRangeDisplayed={5}
                                    pageCount={membersTotalPage}
                                    previousLabel="<"
                                    renderOnZeroPageCount={null}
                                    className="react-pagination "
                                  />
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {members &&
                        Array.isArray(members) &&
                        members.length == 0 && (
                          <div className="container-fluid py-5 text-secondary">
                            <div className="row h-100 w-100">
                              <div className="col-12 text-center my-auto">
                                <h1>NO DATA FOUND</h1>
                              </div>
                            </div>
                          </div>
                        )}
                      {teamError && (
                        <div className="text-danger">{teamError}</div>
                      )}
                    </section>
                  </div>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-Documents"
                role="tabpanel"
                aria-labelledby="pills-Documents-tab"
                tabindex="0"
              >
                <div className="container-fluid mt-4 p-0">
                  <section className={caseStyle.activityFormWrapper}>
                    <div className="row">
                      <div className="col-md-12">
                        <div className={caseStyle.tableNavHead}>
                          <div className={caseStyle.tableNavHeadingWrraper}>
                            <h2 className={caseStyle.Sectionmodalheading}>
                              Documents (
                              {currentCaseDocuments &&
                              Array.isArray(currentCaseDocuments) &&
                              currentCaseDocuments.length > 0
                                ? currentCaseDocuments.length
                                : 0}
                              )
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="card table-card">
                          <div className="card-body  p-0 super-responsive-table">
                            <ReactResponsiveTable
                              columns={documentcolumns}
                              data={currentCaseDocuments}
                              serialize={true}
                              initialCount={
                                documentsLimit * (selectedDocumentspage - 1)
                              }
                            />
                            {currentCaseDocuments &&
                              Array.isArray(currentCaseDocuments) &&
                              currentCaseDocuments.length > 0 &&
                              documentsTotalPage > 1 && (
                                <ReactPaginate
                                  breakLabel="..."
                                  nextLabel=">"
                                  initialPage={documentsPage - 1}
                                  onPageChange={handleDocumentPageClick}
                                  pageRangeDisplayed={5}
                                  pageCount={documentsTotalPage}
                                  previousLabel="<"
                                  renderOnZeroPageCount={null}
                                  className="react-pagination "
                                />
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <form onSubmit={docsHnadleSubmit(docsSubmitHandler)}>
                        <div className={caseStyle.uploadContainer}>
                          <label className={caseStyle.uploadLabel}>
                            Upload Documents
                          </label>
                          <div
                            className={caseStyle.uploadBox}
                            onClick={() =>
                              document
                                .getElementById("opponentDocument")
                                .click()
                            }
                            onDrop={handleDrop} // Handle drop event
                            onDragOver={handleDragOver} // Handle drag over event
                            style={{ cursor: "pointer" }}
                          >
                            <div className={caseStyle.uploadContent}>
                              <Document color={"#000"} />
                              <label
                                htmlFor="opponentDocument"
                                className="chooseFile"
                              >
                                Drag & Drop File here or Choose file
                              </label>
                              <input
                                id="opponentDocument"
                                type="file"
                                accept=".pdf,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                onChange={handleFileChange} // Handle file input change
                                style={{ display: "none" }}
                              />

                              {/* Display the selected file name */}
                              {selectedFile && (
                                <p className={caseStyle.fileName}>
                                  Selected File: {selectedFile.name}
                                </p>
                              )}
                            </div>

                            {/* Display validation errors */}
                            {error && (
                              <p
                                className={`${caseStyle.errorText} text-danger`}
                              >
                                {error}
                              </p>
                            )}
                          </div>
                          <div className={caseStyle.uploadInfo}>
                            <span>
                              Supported formats: PDF, DOCX, XLS, XLSX, PPT,
                              PPTX, JPG, JPEG, PNG
                            </span>
                            <span className={caseStyle.fileSize}>
                              Maximum Size: 100MB
                            </span>
                          </div>
                        </div>
                        <div className="col-md-2 ms-4">
                          <button
                            className="commonButton"
                            type="submit"
                            disabled={loading || error} // Disable button if no file is selected
                          >
                            {loading ? "Submitting..." : "Submit"}
                            <RightArrow />
                          </button>
                        </div>
                      </form>
                    </div>
                  </section>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-notes"
                role="tabpanel"
                aria-labelledby="pills-notes-tab"
                tabindex="0"
              >
                <div className={caseStyle.activityFormWrapper}>
                  <h2 className={caseStyle.Sectionmodalheading}>Note Sheet</h2>
                  <label className="form-label">Description *</label>
                  <CustomEditor
                    value={notesEditor}
                    onChange={notesEdtorHandle}
                  />
                  {notesEditorError && (
                    <span className="text-danger">{notesEditorError}</span>
                  )}
                  <form onSubmit={notesHnadler(notesSubmit)}>
                    <div className="row">
                      <div className="col-md-5">
                        <h2>Would you like to inform client(s)?</h2>
                        <div className={caseStyle.radioWrapper}>
                          <label htmlFor="informNoteClientYes">
                            <input
                              type="radio"
                              name="informNoteClient"
                              id="informNoteClientYes"
                              value="yes"
                              {...notesRegister("inform")}
                            />
                            <span>Yes</span>
                          </label>
                          <label htmlFor="informNoteClientNo">
                            <input
                              type="radio"
                              name="informNoteClient"
                              id="informNoteClientNo"
                              value="no"
                              defaultChecked
                              {...notesRegister("inform")}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                      <div className="col-md-7">
                        <h2>Would you like to inform team member(s)?</h2>
                        <div className={caseStyle.radioWrapper}>
                          <label htmlFor="NoteteamMemberYes">
                            <input
                              type="radio"
                              name="NoteteamMemberYes"
                              id="NoteteamMemberYes"
                              value="yes"
                              {...notesRegister("informTeamMember")}
                            />
                            <span>Yes</span>
                          </label>
                          <label htmlFor="NoteteamMemberNo">
                            <input
                              type="radio"
                              name="NoteteamMemberNo"
                              id="NoteteamMemberNo"
                              value="no"
                              defaultChecked
                              {...notesRegister("informTeamMember")}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                      {informNoteSheetClient &&
                        informNoteSheetClient === "yes" && (
                          <div className="col-md-12 mt-4">
                            <h2>Client Information</h2>
                            <table
                              className="w-100"
                              style={{ border: "2px solid #ddd" }}
                            >
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "left",
                                      borderBottom: "2px solid #ddd",
                                    }}
                                  >
                                    Email
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "left",
                                      borderBottom: "2px solid #ddd",
                                    }}
                                  >
                                    Mobile
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "left",
                                      borderBottom: "2px solid #ddd",
                                    }}
                                  >
                                    WhatsApp
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    {yourClientId && yourClientId?.email
                                      ? yourClientId?.email
                                      : "Not Found"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    {yourClientId && yourClientId?.phoneNumber
                                      ? yourClientId?.phoneNumber
                                      : "Not Found"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      borderBottom: "1px solid #ddd",
                                    }}
                                  >
                                    {yourClientId && yourClientId?.phoneNumber
                                      ? yourClientId?.phoneNumber
                                      : "Not Found"}
                                  </td>
                                </tr>
                                <tr>
                                  {yourClientId && yourClientId.email && (
                                    <td
                                      style={{
                                        padding: "10px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        {...notesRegister("email")}
                                      />
                                    </td>
                                  )}
                                  {yourClientId && yourClientId.phoneNumber && (
                                    <td
                                      style={{
                                        padding: "10px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        {...notesRegister("phoneNumber")}
                                      />
                                    </td>
                                  )}
                                  {yourClientId && yourClientId.phoneNumber && (
                                    <td
                                      style={{
                                        padding: "10px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        {...notesRegister("whatsNumber")}
                                      />
                                    </td>
                                  )}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                      {informNoteSheetTeamMember &&
                        informNoteSheetTeamMember == "yes" && (
                          <div className="col-md-12 mt-4">
                            <h2>Team Members</h2>
                            <table
                              className="w-100"
                              style={{ border: "2px solid #ddd" }}
                            >
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      width: "30px",
                                      padding: "10px",
                                      textAlign: "left",
                                      borderBottom: "2px solid #ddd",
                                    }}
                                  >
                                    #
                                  </th>
                                  <th
                                    style={{
                                      padding: "10px",
                                      textAlign: "left",
                                      borderBottom: "2px solid #ddd",
                                    }}
                                  >
                                    Team Member
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {members &&
                                  Array.isArray(members) &&
                                  members.length > 0 &&
                                  members.map((item, index) => {
                                    return (
                                      <tr>
                                        <td
                                          style={{
                                            padding: "10px",
                                            borderBottom: "1px solid #ddd",
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            onChange={(e) =>
                                              informNoteHandleCheckboxChange(
                                                item._id,
                                                e.target.checked
                                              )
                                            }
                                            checked={selectedSendingNoteSheetMembers.includes(
                                              item._id
                                            )}
                                          />{" "}
                                        </td>
                                        <td
                                          style={{
                                            padding: "10px",
                                            borderBottom: "1px solid #ddd",
                                          }}
                                        >
                                          {`${item.firstName} ${item.lastName}`}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </div>
                    <button
                      type="submit"
                      className="commonButton mt-5"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                      <span className="ms-1">
                        <RightArrow />
                      </span>
                    </button>
                  </form>
                </div>
                {currentNotes &&
                  Array.isArray(currentNotes) &&
                  currentNotes.map((el) => (
                    <div className={`${caseStyle.activityFormWrapper} mt-3`}>
                      <div
                        className={`text-capitalize ${caseStyle.documentReviewWrapper}`}
                      >
                        <h6>
                          {el?.addedBy?.firstName} {el?.addedBy?.lastName}
                        </h6>
                        <div className={caseStyle.timestampWrapper}>
                          <span className={caseStyle.timestamp}>
                            <CalendarIcon color="#898989" />
                            <span>
                              {el?.createdAt
                                ? formatDateToReadableString(el?.createdAt)
                                : ""}
                            </span>
                          </span>
                          <span className={caseStyle.timestamp}>
                            <WatchIcons color="#898989" />
                            <span className="text-uppercase">
                              {el?.createdAt
                                ? formatTimeToIST(el?.createdAt)
                                : ""}
                            </span>
                          </span>
                        </div>
                      </div>
                      <hr className={caseStyle.horizontalRow} />
                      <div className="d-flex flex-wrap gap-4">
                        <div
                          className={caseStyle.documentWrapper}
                          dangerouslySetInnerHTML={{
                            __html: el?.description || "",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                {currentNotes &&
                  Array.isArray(currentNotes) &&
                  currentNotes.length > 0 &&
                  notesTotalPage > 1 && (
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel=">"
                      initialPage={notesPage - 1}
                      onPageChange={handleNotesPageClick}
                      pageRangeDisplayed={5}
                      pageCount={notesTotalPage}
                      previousLabel="<"
                      renderOnZeroPageCount={null}
                      className="react-pagination "
                    />
                  )}
              </div>
              <div
                className="tab-pane fade"
                id="pills-to-dos"
                role="tabpanel"
                aria-labelledby="pills-to-dos-tab"
                tabindex="0"
              >
                <div
                  className={`container-fluid ${caseStyle.activityFormWrapper}`}
                >
                  <div className="row">
                    <form onSubmit={todoSubmitHandler(todoSubmit)}>
                      <div className="col-md-12 ">
                        <h5 className={formstyle.commonFormHeading}></h5>
                        <div className="card">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-12">
                                <label className="form-label">
                                  Description *
                                </label>
                                <CustomEditor
                                  value={todoEditorValue}
                                  onChange={(value) => {
                                    todoEditorHandler(value);
                                    setValue("description", value);
                                    setTodoError("description", {
                                      type: "manual",
                                      message: "",
                                    });
                                  }}
                                />
                                <input
                                  type="hidden"
                                  {...todoRegister("description", {
                                    required: "This field is required",
                                    maxLength: {
                                      value: 500,
                                      message:
                                        "This field must not exceed 500 characters",
                                    },
                                  })}
                                />
                                {todoError.description && (
                                  <span className="text-danger">
                                    {todoError.description.message}
                                  </span>
                                )}
                              </div>
                              <div className="col-md-12 mt-3">
                                <label className={styles.todoLabels}>
                                  Please Select Due Date *
                                </label>
                                <div className="d-flex align-items-center">
                                  <div>
                                    <input
                                      type="datetime-local"
                                      className="form-control"
                                      id="startDateTime"
                                      {...todoRegister("startDateTime", {
                                        required: "This field is required",
                                      })}
                                      min={formattedDateTime}
                                    />
                                    {todoError.startDateTime && (
                                      <span className="text-danger">
                                        {todoError.startDateTime.message}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`p-2 ${styles.dateHeading}`}>
                                    TO
                                  </span>
                                  <div>
                                    <input
                                      type="datetime-local"
                                      className="form-control"
                                      id="endDateTime"
                                      {...todoRegister("endDateTime", {
                                        required: "This field is required",
                                      })}
                                      min={formattedDateTime}
                                    />
                                    {todoError.endDateTime && (
                                      <span className="text-danger">
                                        {todoError.endDateTime.message}
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
                                                {...todoRegister(
                                                  `reminder.${index}.reminderMode`,
                                                  {
                                                    required:
                                                      "This field is required",
                                                  }
                                                )}
                                              >
                                                <option value="" hidden>
                                                  Please Select
                                                </option>
                                                <option value="email">
                                                  Email
                                                </option>
                                                <option value="whatsapp">
                                                  Whatsapp
                                                </option>
                                                <option value="sms">SMS</option>
                                              </select>
                                              {todoError?.reminder?.[index]
                                                ?.reminderMode && (
                                                <span className="text-danger">
                                                  {
                                                    todoError?.reminder[index]
                                                      .reminderMode.message
                                                  }
                                                </span>
                                              )}
                                            </div>

                                            {/* Minutes */}
                                            {todoWatch(
                                              `reminder.${index}.reminderModeTime`
                                            ) === "minutes" && (
                                              <div className="col-md-4">
                                                <select
                                                  className="form-control form-select"
                                                  {...todoRegister(
                                                    `reminder.${index}.reminderTime`,
                                                    {
                                                      required:
                                                        "This field is required",
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
                                                    <option
                                                      value={item}
                                                      key={item}
                                                    >
                                                      {item}
                                                    </option>
                                                  ))}
                                                </select>
                                                {todoError.reminder?.[index]
                                                  ?.reminderTime && (
                                                  <span className="text-danger">
                                                    {
                                                      todoError.reminder[index]
                                                        .reminderTime.message
                                                    }
                                                  </span>
                                                )}
                                              </div>
                                            )}

                                            {/* Hours */}
                                            {todoWatch(
                                              `reminder.${index}.reminderModeTime`
                                            ) === "hours" && (
                                              <div className="col-md-4">
                                                <select
                                                  className="form-control form-select"
                                                  {...todoRegister(
                                                    `reminder.${index}.reminderTime`,
                                                    {
                                                      required:
                                                        "This field is required",
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
                                                    <option
                                                      value={item}
                                                      key={item}
                                                    >
                                                      {item}
                                                    </option>
                                                  ))}
                                                </select>
                                                {todoError.reminder?.[index]
                                                  ?.reminderTime && (
                                                  <span className="text-danger">
                                                    {
                                                      todoError.reminder[index]
                                                        .reminderTime.message
                                                    }
                                                  </span>
                                                )}
                                              </div>
                                            )}

                                            {/* Days */}
                                            {todoWatch(
                                              `reminder.${index}.reminderModeTime`
                                            ) === "days" && (
                                              <div className="col-md-4">
                                                <select
                                                  className="form-control form-select"
                                                  {...todoRegister(
                                                    `reminder.${index}.reminderTime`,
                                                    {
                                                      required:
                                                        "This field is required",
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
                                                    <option
                                                      value={item}
                                                      key={item}
                                                    >
                                                      {item}
                                                    </option>
                                                  ))}
                                                </select>
                                                {todoError.reminder?.[index]
                                                  ?.reminderTime && (
                                                  <span className="text-danger">
                                                    {
                                                      todoError.reminder[index]
                                                        .reminderTime.message
                                                    }
                                                  </span>
                                                )}
                                              </div>
                                            )}

                                            {/* Weeks */}
                                            {todoWatch(
                                              `reminder.${index}.reminderModeTime`
                                            ) === "weeks" && (
                                              <div className="col-md-4">
                                                <select
                                                  className="form-control form-select"
                                                  {...todoRegister(
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
                                                    <option
                                                      value={item}
                                                      key={item}
                                                    >
                                                      {item}
                                                    </option>
                                                  ))}
                                                </select>
                                                {todoError.reminder?.[index]
                                                  .reminderTime && (
                                                  <span className="text-danger">
                                                    {
                                                      todoError.reminder[index]
                                                        .reminderTime.message
                                                    }
                                                  </span>
                                                )}
                                              </div>
                                            )}

                                            {/* Reminder Mode Time */}
                                            <div className="col-md-4">
                                              <select
                                                className="form-control form-select"
                                                {...todoRegister(
                                                  `reminder.${index}.reminderModeTime`
                                                )}
                                              >
                                                <option value="minutes">
                                                  Minute(s)
                                                </option>
                                                <option value="hours">
                                                  Hour(s)
                                                </option>
                                                <option value="days">
                                                  Day(s)
                                                </option>
                                                <option value="weeks">
                                                  Week(s)
                                                </option>
                                              </select>
                                              {todoError.reminder?.[index]
                                                ?.reminderModeTime && (
                                                <span className="text-danger">
                                                  {
                                                    todoError.reminder[index]
                                                      .reminderModeTime.message
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
                                }`}
                              >
                                <div className="d-flex align-items-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    id="agree"
                                    {...todoRegister("markAsPrivate")}
                                  />
                                  <label htmlFor="agree">
                                    <h6
                                      className={`py-0 mb-0 ${styles.markpvtHeading}`}
                                    >
                                      Mark As Private
                                    </h6>
                                  </label>
                                </div>
                              </div>
                              <div className="col-md-6 mt-3">
                                <label>Assign To</label>
                                <div className="dropdown" ref={dropdownRef}>
                                  <button
                                    type="button"
                                    className={`btn dropdown-toggle text-white text-start w-100 d-flex justify-content-between align-items-center ${styles.dropDownsection}`}
                                    onClick={toggleDropdown}
                                  >
                                    {selectedUsers.length > 0
                                      ? `${selectedUsers.length} selected`
                                      : "Select Team Members"}
                                  </button>

                                  {isDropdownOpen && (
                                    <div
                                      className="dropdown-menu show ps-2 w-100"
                                      style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                      }}
                                    >
                                      {organizationUser &&
                                        Array.isArray(organizationUser) &&
                                        organizationUser.map((item) => (
                                          <div
                                            className="form-check"
                                            key={item._id}
                                          >
                                            <input
                                              type="checkbox"
                                              className="form-check-input"
                                              id={`user-${item._id}`}
                                              value={item._id}
                                              onChange={handleCheckboxChange}
                                              checked={selectedUsers.includes(
                                                item._id
                                              )}
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
                                  {todoError.assignToMemberId && (
                                    <span className="text-danger">
                                      {todoError.assignToMemberId.message}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-2 mt-3">
                              <button
                                className="commonButton"
                                disabled={loading}
                              >
                                {loading ? "Submitting..." : "Submit"}
                                <RightArrow />
                              </button>
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
                                    <span
                                      className={`${todoStyle.alltotalCount}`}
                                    >
                                      {Object.entries(currentTodoCount || {})
                                        .filter(([key]) => key !== "close") // Exclude the key "close"
                                        .reduce(
                                          (sum, [, value]) => sum + value,
                                          0
                                        )}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <h6 className="px-2 m-0">Pending</h6>
                                    <span
                                      className={todoStyle.pendingtotalCount}
                                    >
                                      {currentTodoCount?.pending}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <h6 className="px-2 m-0">Upcoming</h6>
                                    <span
                                      className={todoStyle.upcomingtotalCount}
                                    >
                                      {currentTodoCount?.upcoming}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <h6 className="px-2 m-0">Completed</h6>
                                    <span
                                      className={todoStyle.completedtotalCount}
                                    >
                                      {currentTodoCount?.completed}
                                    </span>
                                  </div>
                                </div>
                                <div className="d-flex">
                                  <div className="px-2">
                                    <select
                                      className="form-control form-select"
                                      onChange={(e) =>
                                        setSearch(e.target.value)
                                      }
                                    >
                                      <option value="all">All</option>
                                      <option value="pending">Pending</option>
                                      <option value="upcoming">Upcoming</option>
                                      <option value="completed">
                                        Completed
                                      </option>
                                    </select>
                                  </div>
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
                                              ? item.progressStatus ==
                                                "upcoming"
                                                ? "#1a09d6"
                                                : item.progressStatus ==
                                                  "pending"
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
                                              Array.isArray(
                                                item.relatedToCaseId
                                              ) &&
                                              item.relatedToCaseId.map((el) => (
                                                <span>{el.title}</span>
                                              ))}
                                          </div>
                                          <div className="col-md-4 text-center">
                                            <span>
                                              <span
                                                className={
                                                  styles.dueDateheading
                                                }
                                              >
                                                Due Date :{" "}
                                              </span>{" "}
                                              {getDate(item.endDateTime)}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                            {currentTodos &&
                              Array.isArray(currentTodos) &&
                              currentTodos.length > 0 &&
                              todoTotalPage > 1 && (
                                <ReactPaginate
                                  breakLabel="..."
                                  nextLabel=">"
                                  forcePage={todoPage - 1}
                                  onPageChange={handleTodoPageClick}
                                  pageRangeDisplayed={5}
                                  pageCount={todoTotalPage}
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
              </div>
              <div
                className="tab-pane fade"
                id="pills-connected"
                role="tabpanel"
                aria-labelledby="pills-connected-tab"
                tabindex="0"
              >
                <div className="container-fluid mt-4 p-0">
                  <section className={caseStyle.activityFormWrapper}>
                    <div className="row">
                      <div className="col-md-12">
                        <div className={caseStyle.tableNavHead}>
                          <div className={caseStyle.tableNavHeadingWrraper}>
                            <h2 className={caseStyle.Sectionmodalheading}>
                              Connected Cases (
                              {connactedAllCases &&
                              Array.isArray(connactedAllCases) &&
                              connactedAllCases.length > 0
                                ? connactedAllCases.length
                                : 0}
                              )
                            </h2>
                          </div>
                          <div className={caseStyle.tableNavButtonWrapper}>
                            <div className={caseStyle.tableNavButtonWrapper}>
                              <div className={caseStyle.teammemberOption}>
                                <select
                                  className={`form-select form-area ${caseStyle.teammembersectionButton}`}
                                  aria-label="Default select example"
                                  value={connactedCases}
                                  onChange={(e) => {
                                    setConnactedCases(e.target.value);
                                    setConnactedCaseError("");
                                  }}
                                >
                                  <option value={""} hidden>
                                    Select case to connect
                                  </option>
                                  {filterNotConnated &&
                                    Array.isArray(filterNotConnated) &&
                                    filterNotConnated.length > 0 &&
                                    filterNotConnated.map((item, index) => {
                                      if (item._id == params.id) return;
                                      return (
                                        <option value={item._id} key={index}>
                                          {item.title}
                                        </option>
                                      );
                                    })}
                                </select>
                                <button
                                  className={`${caseStyle.teamaddButton} btn`}
                                  disabled={loading}
                                >
                                  <span className="me-2"></span>
                                  <span onClick={addConnactedHnadler}>Add</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="card table-card">
                          <div className="card-body  p-0 super-responsive-table">
                            <ReactResponsiveTable
                              columns={connatedColumns}
                              data={connactedAllCases}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {connactedAllCases &&
                      Array.isArray(connactedAllCases) &&
                      connactedAllCases.length == 0 && (
                        <div className="container-fluid py-5 text-secondary">
                          <div className="row h-100 w-100">
                            <div className="col-12 text-center my-auto">
                              <h1>NO DATA FOUND</h1>
                            </div>
                          </div>
                        </div>
                      )}
                    {connactedCaseError && (
                      <div>
                        <span className="text-danger">
                          {connactedCaseError}
                        </span>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <div
                className="tab-pane fade"
                id="pills-timesheet"
                role="tabpanel"
                aria-labelledby="pills-timesheet-tab"
                tabindex="0"
              >
                {" "}
                <div className="container-fluid mt-4 p-0">
                  <section className={caseStyle.activityFormWrapper}>
                    <div className="row">
                      <div className="col-md-12">
                        <div className={caseStyle.tableNavHead}>
                          <div className={caseStyle.tableNavHeadingWrraper}>
                            <h2 className={caseStyle.Sectionmodalheading}>
                              Timesheet
                            </h2>
                          </div>
                          <div className={caseStyle.tableNavButtonWrapper}>
                            <div className={caseStyle.teammemberOption}>
                              <button
                                type="button"
                                className={`${caseStyle.teamaddButton} btn`}
                                data-bs-toggle="modal"
                                data-bs-target="#timesheetModal"
                              >
                                <span className="me-2"></span>
                                <span>
                                  <AddIcon />
                                  New
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="card table-card">
                          <div className="card-body  p-0 super-responsive-table">
                            <ReactResponsiveTable
                              columns={timeSheetColumns}
                              data={timeSheet}
                              serialize={true}
                              initialCount={
                                timesheetLimit * (selectedTimeSheetpage - 1)
                              }
                            />
                            {timeSheet &&
                              Array.isArray(timeSheet) &&
                              timeSheet.length > 0 &&
                              timesheetTotalPage > 1 && (
                                <ReactPaginate
                                  breakLabel="..."
                                  nextLabel=">"
                                  initialPage={timesheetPage - 1}
                                  onPageChange={handleTimeSheetPageClick}
                                  pageRangeDisplayed={5}
                                  pageCount={timesheetTotalPage}
                                  previousLabel="<"
                                  renderOnZeroPageCount={null}
                                  className="react-pagination "
                                />
                              )}
                            {timeSheet && timeSheet.length == 0 && (
                              <div className="container-fluid py-5 text-secondary">
                                <div className="row h-100 w-100">
                                  <div className="col-12 text-center my-auto">
                                    <h1>NO DATA FOUND</h1>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-expenses"
                role="tabpanel"
                aria-labelledby="pills-expenses-tab"
                tabindex="0"
              >
                <div className="container-fluid mt-4 p-0">
                  <section className={caseStyle.activityFormWrapper}>
                    <div className="row">
                      <div className="col-md-12">
                        <div className={caseStyle.tableNavHead}>
                          <div className={caseStyle.tableNavHeadingWrraper}>
                            <h2 className={caseStyle.Sectionmodalheading}>
                              Expenses
                            </h2>
                          </div>
                          <div className={caseStyle.tableNavButtonWrapper}>
                            <div className={caseStyle.teammemberOption}>
                              {selectedExpenses &&
                                Array.isArray(selectedExpenses) &&
                                selectedExpenses.length > 0 && (
                                  <button
                                    type="button"
                                    className={`${caseStyle.teamaddButton} btn`}
                                    onClick={handleRaiseReimbursementRequest}
                                    disabled={reimLoading}
                                  >
                                    {reimLoading ? (
                                      <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                      ></span>
                                    ) : (
                                      <FeeReceived
                                        className={caseStyle.iconTabs}
                                      />
                                    )}
                                    Raise Reimbursement Request
                                  </button>
                                )}
                              <button
                                type="button"
                                className={`${caseStyle.teamaddButton} btn`}
                                data-bs-toggle="modal"
                                data-bs-target="#expensesModal"
                              >
                                <span className="me-2"></span>
                                <span>
                                  <AddIcon />
                                  New
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="card table-card">
                          <div className="card-body  p-0 super-responsive-table">
                            <ReactResponsiveTable
                              columns={expenseColumns}
                              data={allExpenses}
                              serialize={true}
                              initialCount={
                                expensesLimit * (selectedExpensespage - 1)
                              }
                            />
                            {allExpenses &&
                              Array.isArray(allExpenses) &&
                              allExpenses.length > 0 &&
                              expensesTotalPage > 1 && (
                                <ReactPaginate
                                  breakLabel="..."
                                  nextLabel=">"
                                  initialPage={expensesPage - 1}
                                  onPageChange={handleExpensePageClick}
                                  pageRangeDisplayed={5}
                                  pageCount={expensesTotalPage}
                                  previousLabel="<"
                                  renderOnZeroPageCount={null}
                                  className="react-pagination "
                                />
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {allExpenses &&
                      Array.isArray(allExpenses) &&
                      allExpenses.length == 0 && (
                        <div className="container-fluid py-5 text-secondary">
                          <div className="row h-100 w-100">
                            <div className="col-12 text-center my-auto">
                              <h1>NO DATA FOUND</h1>
                            </div>
                          </div>
                        </div>
                      )}
                  </section>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-fee"
                role="tabpanel"
                aria-labelledby="pills-fee-tab"
                tabindex="0"
              >
                fee
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Expense */}
      <div
        className="modal fade"
        id="expensesModal"
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
                New Expense Entry
              </h1>
              <button
                type="button"
                className={`btn ${modalStyle.modalButtn}`}
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={closeExpenseModal}
                onClick={() => expsReset()}
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
              ></ul>
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-home"
                  role="tabpanel"
                  aria-labelledby="pills-home-tab"
                >
                  <div className={`modal-body ${modalStyle.modalFormWrapper}`}>
                    <div className="container-fluid">
                      <form onSubmit={expsHnadleSubmit(expsSubmit)}>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Expense Type:
                              </label>
                              <select
                                className={`form-select ${modalStyle.modalFormSelect}`}
                                aria-label="Default select example"
                                {...expsRegister("type", {
                                  required: "This field is required",
                                })}
                              >
                                {expsErrors?.type && (
                                  <span className="text-danger">
                                    {expsErrors.type.message}
                                  </span>
                                )}
                                <option value="">Please Select</option>
                                <option value="Travel">Travel</option>
                                <option value="Documentation">
                                  Documentation
                                </option>
                                <option value="Consultation">
                                  Consultation
                                </option>
                                <option value="Third Party">Third Party</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Start Date*</label>
                              <input
                                type="date"
                                className={`form-control ${modalStyle.modalInput}`}
                                {...expsRegister("startDate", {
                                  required: "This field is required",
                                })}
                              />
                              {expsErrors?.startDate && (
                                <span className="text-danger">
                                  {expsErrors.startDate.message}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">End Date*</label>
                              <input
                                type="date"
                                className={`form-control ${modalStyle.modalInput}`}
                                {...expsRegister("endDate", {
                                  required: "This field is required",
                                })}
                              />
                              {expsErrors?.endDate && (
                                <span className="text-danger">
                                  {expsErrors.endDate.message}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Amount*</label>
                              <input
                                type="text"
                                className={`form-control ${modalStyle.modalInput}`}
                                {...expsRegister("amount", {
                                  required: "This field is required",
                                })}
                              />
                              {expsErrors?.amount && (
                                <span className="text-danger">
                                  {expsErrors.amount.message}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">
                                Attachment/Bill:
                              </label>
                              <input
                                type="file"
                                className={`form-control ${modalStyle.modalInput}`}
                                {...expsRegister("bill")}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={modalStyle.Editorsection}>
                          <label className="form-label">Description</label>
                          <CustomEditor
                            value={expsEditorValue}
                            onChange={expsEditorHandler}
                          />
                        </div>

                        <div className={modalStyle.modalButtnWrapper}>
                          <button
                            type="button"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            className={modalStyle.modalcancelButton}
                            disabled={loading}
                            onClick={() => expsReset()}
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            className="commonButton"
                            disabled={loading}
                          >
                            {loading ? "Submitting..." : "Submit"}
                            <RightArrow />
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
      {/* Time sheet */}
      <div
        className="modal fade"
        id="timesheetModal"
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
                Timesheet Entry
              </h1>
              <button
                type="button"
                className={`btn ${modalStyle.modalButtn}`}
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={closeModal}
                onClick={() => timeReset()}
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
              ></ul>
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-home"
                  role="tabpanel"
                  aria-labelledby="pills-home-tab"
                >
                  <div className={`modal-body ${modalStyle.modalFormWrapper}`}>
                    <div className="container-fluid">
                      <form onSubmit={timeHandlerSubmit(timeSubmit)}>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label for="blongs-to" className="form-label">
                                Date *
                              </label>
                              <input
                                type="date"
                                className={`form-control ${modalStyle.modalInput}`}
                                {...timeRegister("date", {
                                  required: "This field is required",
                                })}
                              />
                              {timeErrors.date && (
                                <span className="text-danger">
                                  {timeErrors.date.message}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Start Time *</label>
                              <input
                                type="time"
                                className={`form-control ${modalStyle.modalInput}`}
                                {...timeRegister("startTime", {
                                  required: "This field is required",
                                })}
                              />
                              {timeErrors.startTime && (
                                <span className="text-danger">
                                  {timeErrors.startTime.message}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">End Time *</label>
                              <input
                                type="time"
                                className={`form-control ${modalStyle.modalInput}`}
                                {...timeRegister("endTime", {
                                  required: "This field is required",
                                })}
                              />
                              {timeErrors.endTime && (
                                <span className="text-danger">
                                  {timeErrors.endTime.message}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={modalStyle.Editorsection}>
                          <label className="form-label">Description</label>
                          <CustomEditor
                            value={timeSheetEditor}
                            onChange={timeSheetEdtorHandle}
                            className="modalEditor"
                          />
                        </div>
                        <div className={modalStyle.modalButtnWrapper}>
                          <button
                            type="button"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            className={modalStyle.modalcancelButton}
                            disabled={loading}
                            onClick={() => timeReset()}
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            className="commonButton"
                            disabled={loading}
                          >
                            {loading ? "Submitting..." : "Submit"}
                            <RightArrow />
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

      <button
        type="button"
        className="btn btn-primary d-none"
        ref={openTodoModal}
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
                ref={closeTdoModal}
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
                  <div className="d-flex justify-content-between">
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
  const { query } = context;
  const { page = 1 } = query;
  try {
    const [
      res,
      caseRes,
      notesRes,
      activityRes,
      todoRes,
      timesheetRes,
      expenseRes,
      teamMemberRes,
      caseDoumentsRes,
    ] = await Promise.all([
      await Axios.get(`/case/get-case/${query.id}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(`/case/get-all-cases?caseId=${query.id}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(`/notes/get-all?caseId=${query.id}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(`/activity/get-all?caseId=${query.id}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(`/to-dos/get-all-todos?caseId=${query.id}&page=${page}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(`/timesheet/get-all?caseId=${query.id}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(`/expenses/get-all?caseId=${query.id}&page=${page}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(`/user/get-all-team-members?caseId=${query.id}`, {
        authenticated: true,
        context,
      }),
      await Axios.get(
        `/case-documents/get-all-case-douments?caseId=${query.id}`,
        {
          authenticated: true,
          context,
        }
      ),
    ]);

    return {
      props: {
        data: res.data,
        allCases: caseRes.data.data,
        notes: notesRes.data.data,
        activities: activityRes.data.data,
        allTodos: todoRes.data.data,
        allTimeSheet: timesheetRes.data.data,
        expenses: expenseRes.data.data,
        allTeamMembers: teamMemberRes.data.data,
        allCaseDocuments: caseDoumentsRes.data.data,
      },
    }; // Pass data as props
  } catch (error) {
    return {
      props: {
        error: error.message || "Failed to fetch data",
        data: [],
        allCases: [],
        notes: [],
        activities: [],
        allTodos: [],
        allTimeSheet: [],
        expenses: [],
        allTeamMembers: [],
        allCaseDocuments: [],
      },
    };
  }
}

ViewCase.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default ViewCase;
