import React, { useEffect, useState, useRef, useMemo } from "react";
import ManagementLayout from "@/layouts/management";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import Axios from "@/config/axios";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Search from "@/components/search-input";
import { Commissionerate, appearingModal } from "@/utils/case-configurations";
import {
  AddIcon,
  Circlecheck,
  LeftArrow,
  RightArrow,
  TrashIcon,
} from "@/utils/icons";
import Breadcrumb from "@/components/breadcrumb";
import formstyle from "@/styles/authForm.module.css";
import { formatDateToReadableString, formatTimeToIST } from "@/utils/common";
import createExcerpt from "@/config/excerptDescription";

const UpdateCase = ({
  updateCase,
  courts,
  organizations,
  highCourts,
  states,
  districts,
  revenueCourts,
  tribunalAuthorities,
  departments,
  lokAdalats,
  clients,
  users,
  departmentAthority,
  commissionBenches,
  allTodos,
  allHighCourtBenches,
  commissionerateAuth,
}) => {
  const { caseData } = updateCase;
  const uniqueCourt =
    Array.isArray(courts?.docs) && courts.docs.length > 0
      ? courts.docs.find((item) => item.uniqueCourtId == caseData?.court)
          ?.uniqueCourtId || "" // Match `uniqueCourtId` with `caseData.court`
      : "";

  // default case values
  const defaultCaseInfo = {
    caseDes: caseData?.caseDes || "",
    caseNumber: caseData?.caseNumber || "",
    caseType: caseData?.caseType || "",
    caseDes: caseData?.caseType || "",
    caseYear: caseData?.caseYear || "",
    subDepartment: caseData?.subDepartment || "",
    courtHall: caseData?.courtHall || "",
    title: caseData?.title || "",
    description: caseData?.description || "",
    stateId: caseData?.stateId?._id || "",
    financialYear: caseData?.financialYear || "",
    floor: caseData?.floor || "",
    highCourtbencheId: caseData?.highCourtbencheId?._id || "",
    comissionerRateAuthorityId: caseData?.comissionerRateAuthorityId?._id || "",
    tribunalAuthorityId: caseData?.tribunalAuthorityId?._id || "",
    authority: caseData?.authority?._id
      ? caseData?.authority?._id
      : caseData?.authority
      ? caseData?.authority
      : "",
    revenueCourtId: caseData?.revenueCourtId?._id || "",
    lokAdalatId: caseData?.lokAdalatId?._id || "",
    departmentId: caseData?.departmentId?._id || "",
    districtId: caseData?.districtId?._id || "",
    highCourtId: caseData?.highCourtId?._id || "",
    organization: caseData?.organization?._id,
    dueDate: caseData?.dueDate
      ? new Date(caseData.dueDate).toISOString().split("T")[0] // Format to YYYY-MM-DD
      : "", // Ensure compatibility with input type="date"
    dateOfFilling: caseData?.dateOfFilling
      ? new Date(caseData.dateOfFilling).toISOString().split("T")[0] // Format to YYYY-MM-DD
      : "",
  };

  // default case priority values
  const defaultCasePriority = {
    appearingAs: caseData?.appearingAs || "",
    appearingPerson: caseData?.appearingPerson || "",
    beforeHonableJudge: caseData?.beforeHonableJudge || "",
    classification: caseData?.classification || "",
    firNumber: caseData?.firNumber || "",
    firPoliceStation: caseData?.firPoliceStation || "",
    firYear: caseData?.firYear || "",
    priority: caseData?.priority || "",
    referredBy: caseData?.referredBy || "",
    sectionCategory: caseData?.sectionCategory || "",
    affidavitStatus: caseData?.affidavitStatus || "",
    underActs: caseData?.underActs || "",
    appearingModel: caseData?.appearingModel
      ? JSON.stringify(caseData.appearingModel)
      : "",
    affidavitFillingDate: caseData?.affidavitFillingDate
      ? new Date(caseData.affidavitFillingDate).toISOString().split("T")[0] // Format to YYYY-MM-DD
      : "",
  };

  const {
    register: regOpponentInfo,
    handleSubmit: handleOpponentInfo,
    reset,
    control,
    watch,
    trigger,
    setValue: opponentSetValue,
    formState: { errors: opponentErrors },
  } = useForm({
    defaultValues: {
      opponents: [...caseData?.opponents],
      opponentAdvocates: [...caseData?.opponentAdvocates], // Default one address field
    },
  });
  const {
    register: regCaseInfo,
    handleSubmit: handleCaseInfo,
    watch: watchCaseInfo,
    setValue: setCaseValue,
    setError: setCaseError,
    trigger: caseTrigger,
    resetField: caseResetField,
    unregister: caseUnregister,
    formState: { errors: caseErrors },
  } = useForm({
    defaultValues: {
      ...defaultCaseInfo,
    },
  });

  const {
    register: regCasePriority,
    handleSubmit: handleCasePriority,
    watch: watchCasePriority,
    formState: { errors: priorityErrors },
  } = useForm({
    defaultValues: {
      ...defaultCasePriority,
    },
  });

  // const {
  //   register: regAdditionalInfo,
  //   handleSubmit: handleAdditionalInfo,
  //   control: controlAdditionalInfo,
  //   watch: watchAdditionalInfo,
  //   formState: { errors: additionalInfoError },
  // } = useForm({
  //   defaultValues: {
  //     additionalFields: { ...caseData?.additionalFields },
  //   },
  // });
  const { upcomingTodos } = allTodos;
  const openSuccessModal = useRef();
  const router = useRouter();
  const [step, setStep] = useState("1");
  const [currentCase, setCurrentCase] = useState();
  const [caseInformation, setCaseInformation] = useState();
  const [casePriorities, setCasePriorities] = useState();
  const [additionalInformation, setAdditionalInfromation] = useState();
  const [opponentInformation, setOpponentInformation] = useState();
  const [selectUserError, setSelectUserError] = useState();
  const [loading, setLoading] = useState(false);
  const [caseType, setCaseType] = useState();
  const [showCaseType, setShowCaseType] = useState(true);
  const [yearRange, setYearRange] = useState();

  //watch case info
  const currentCourt = watchCaseInfo("court");
  const currentCommissions = watchCaseInfo("consumer");
  const currentCaseType = watchCaseInfo("caseType");
  const currentHighCourt = watchCaseInfo("highCourtId");
  const currentState = watchCaseInfo("stateId");
  const currentDistrict = watchCaseInfo("districtId");
  const currentTribunalAuthority = watchCaseInfo("tribunalAuthorityId");
  const currentRevenueCourt = watchCaseInfo("revenueCourtId");
  const currentDepartment = watchCaseInfo("departmentId");
  const currentDepartmentAuthority = watchCaseInfo("authority");
  const currentLokAdalat = watchCaseInfo("lokAdalatId");
  const currentHighCourtBench = watchCaseInfo("highCourtbencheId");
  const currentCommissionerRate = watchCaseInfo("comissionerRate");
  const currentCommissionAuthority = watchCaseInfo(
    "comissionerRateAuthorityId"
  );
  const currentCommissionBench = watchCaseInfo("comissionBenchId");
  const currentIdentifier = watchCaseInfo("identifier");
  const currentCaseNumber = watchCaseInfo("caseNumber");

  const currentAffidavit = watchCasePriority("affidavitStatus");
  const currentAppearingAs = watchCasePriority("appearingAs");
  const currentAppearing =
    watchCasePriority("appearingModel") &&
    typeof watchCasePriority("appearingModel") === "string"
      ? JSON.parse(watchCasePriority("appearingModel")).title
      : undefined;

  const caseDataTitle = caseData?.appearingModel?.title || "";
  const [appearing, setAppearing] = useState(
    caseDataTitle.split(" - ").map((item) => item.trim()) || []
  );
  const [selectedUsers, setSelectedUsers] = useState(
    Array.isArray(caseData?.yourTeam)
      ? caseData.yourTeam.map((user) => user._id)
      : []
  );
  const [priorityError, setPriorityError] = useState("");
  const [selectedClients, setSelectedClients] = useState(() => {
    if (caseData?.yourClientId) {
      const nickName = caseData.yourClientId.nickName || "";
      const fullName = caseData.yourClientId.fullName || "";
      return [
        { label: `${nickName}, ${fullName}`, value: caseData.yourClientId._id },
      ]; // Use label and value format
    }
    return [];
  });
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  const session = useSession();
  const role = session?.data?.user?.role || null;
  for (let year = currentYear; year >= 1950; year--) {
    yearOptions.push(year);
  }

  useEffect(() => {
    generateYearRanges();
  }, []);

  const generateYearRanges = (startYear = 2000) => {
    const currentYear = new Date().getFullYear();
    const yearRanges = [];

    // Loop from startYear to the current year
    for (let year = Number(startYear); year <= currentYear; year++) {
      const nextYear = year + 1; // Get the next year
      const yearRange = `${year}-${nextYear.toString().slice(-2)}`; // Format the range as "YYYY-YY"
      yearRanges.push(yearRange);
    }

    // Assuming `setYearRange` is a state setter function (e.g., from `useState`)
    setYearRange([...yearRanges]);
  };

  useEffect(() => {
    caseUnregister("subDepartment");
  }, [currentDepartment]);

  const highCourtChange = (data) => {
    caseUnregister("consumer");
    caseUnregister("highCourtId");
    caseUnregister("stateId");
    caseUnregister("districtId");
    caseUnregister("tribunalAuthorityId");
    caseUnregister("revenueCourtId");
    caseUnregister("departmentId");
    caseUnregister("authority");
    caseUnregister("lokAdalatId");
    caseUnregister("highCourtbencheId");
    caseUnregister("comissionerRate");
    caseUnregister("comissionerRateAuthorityId");
    caseUnregister("comissionBenchId");
    caseUnregister("identifier");
    caseUnregister("caseType");
    caseUnregister("subDepartment");
    setCaseValue("court", data);
    setShowCaseType(false);
  };
  useEffect(() => {
    if (currentAppearing) {
      setAppearing(currentAppearing.split(" - "));
    }
  }, [currentAppearing]);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelectedUsers((prev) => {
      const updatedUsers = checked
        ? [...prev, value]
        : prev.filter((id) => id !== value);

      // Clear any error message on update
      setSelectUserError("");
      return updatedUsers;
    });
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "opponents",
  });
  // Opponent Advocates Field Array
  const {
    fields: opponentAdvocatesFields,
    append: opponentAdvocatesAppend,
    remove: opponentAdvocatesRemove,
  } = useFieldArray({
    control,
    name: "opponentAdvocates",
  });

  useEffect(() => {
    if (currentCaseType && currentCaseType !== "other") {
      caseResetField("caseDes");
    }
  }, [currentCaseType, caseResetField]);

  const caseInfo = (data) => {
    if (
      (data &&
        Number(data.superCritical) +
          Number(data.critical) +
          Number(data.normal) >
          100) ||
      (data &&
        Number(data.superCritical) +
          Number(data.critical) +
          Number(data.normal) <
          100)
    ) {
      setPriorityError("Total sum of the case handling priority must be 100");
      setTimeout(() => {
        setPriorityError("");
      }, 3000);

      return;
    }
    if (data && !data.caseDes) delete data.caseDes;
    if (data && data.caseDes && data.caseType && data.caseType == "other") {
      data.caseType = data.caseDes;
      delete data.caseDes;
    }
    setCaseInformation(data);
    setStep("2");
  };

  const casePriority = (data) => {
    setCasePriorities(data);
    setStep("3");
  };

  const additionalInfo = (data) => {
    const filteredAdditionalFields = Object.fromEntries(
      Object.entries(data.additionalFields).filter(
        ([_, value]) => value !== "" && value !== undefined && value !== null
      )
    );

    // Update the data with the filtered additionalFields
    const cleanedData = {
      ...data,
      additionalFields: filteredAdditionalFields,
    };

    // Set the cleaned data to additional information and proceed to the next step
    setAdditionalInfromation(cleanedData);
    setStep("4");
  };

  const OpponentInfo = async (data) => {
    setOpponentInformation(data);
    setStep("4");
  };

  const cleanObject = (obj) => {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
        .map(([key, value]) => {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            value = cleanObject(value); // Recursively clean nested objects
          }
          return [key, value]; // Return the cleaned key-value pair
        })
    );
  };

  const cleanArrayOfObjects = (arr) => {
    return arr.map((item) => cleanObject(item)); // Clean each object in the array
  };

  const SubmitHandler = async () => {
    try {
      setLoading(true);
      // Parse `court` and `appearingModel` if they are JSON strings
      const parsedCourt =
        typeof caseInformation?.court === "string"
          ? JSON.parse(caseInformation.court)
          : caseInformation.court;

      const parsedAppearingModel =
        typeof casePriorities?.appearingModel === "string"
          ? JSON.parse(casePriorities.appearingModel)
          : casePriorities.appearingModel;

      // Destructure caseInformation and casePriorities without court and appearingModel
      const { court: _, ...remainingCaseInformation } = caseInformation || {};
      const { appearingModel: __, ...remainingCasePriorities } =
        casePriorities || {};

      // Construct the payload
      const payload = {
        ...opponentInformation,
        ...remainingCaseInformation,
        court: parsedCourt, // Use parsed court value here
        appearingModel: parsedAppearingModel, // Use parsed appearingModel value here
        ...remainingCasePriorities,
        ...additionalInformation,
        ...(selectedUsers && { yourTeam: [...selectedUsers] }), // Only add yourTeam if selectedUsers is truthy
        caseId: caseData?._id,
      };

      delete payload.createdAt;
      delete payload.updatededAt;
      delete payload.isDeleted;
      delete payload._v;
      delete payload.caseDes;
      delete payload._id;
      if (payload.opponents && Array.isArray(payload.opponents)) {
        payload.opponents = cleanArrayOfObjects(payload.opponents);
      }

      if (payload.opponents && Array.isArray(payload.opponents)) {
        payload.opponents = payload.opponents.map((opponent) => {
          const { _id, ...rest } = opponent; // Destructure to exclude _id
          return rest; // Return the object without _id
        });
      }

      if (
        payload.opponentAdvocates &&
        Array.isArray(payload.opponentAdvocates)
      ) {
        payload.opponentAdvocates = cleanArrayOfObjects(
          payload.opponentAdvocates
        );
      }

      if (
        payload.opponentAdvocates &&
        Array.isArray(payload.opponentAdvocates)
      ) {
        payload.opponentAdvocates = payload.opponentAdvocates.map(
          (advocate) => {
            const { _id, ...rest } = advocate; // Destructure to exclude _id
            return rest; // Return the object without _id
          }
        );
      }

      // Filter out undefined, null, and empty string values
      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      );
      cleanObject;
      const res = await Axios.post("/case/update-case", filteredPayload, {
        authenticated: true,
      });
      setCurrentCase(res.data.data);
      toast.success("Case is updated successfully");
      openSuccessModal?.current?.click();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update case");
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const getUser = useMemo(() => {
    if (role && role === "super-admin" && caseInformation?.organization) {
      const filterUser = Array.isArray(users?.docs)
        ? users.docs.filter(
            (item) => item.organizationId === caseInformation.organization
          )
        : [];
      return filterUser;
    } else {
      return Array.isArray(users?.docs) ? users.docs : [];
    }
  }, [caseInformation]);

  useEffect(() => {
    if (caseData?.yourClientId) {
      const nickName = caseData.yourClientId.nickName || "";
      const fullName = caseData.yourClientId.fullName || "";
      const defaultClientId = [
        { label: `${nickName}, ${fullName}`, value: caseData.yourClientId._id },
      ];
      opponentSetValue(
        "yourClientId",
        defaultClientId.map((client) => client.value).join(",")
      );
      setSelectedClients(defaultClientId);
    }
  }, [caseData, opponentSetValue]);

  const handleClientChange = (selectedOptions, selectedLabelValue) => {
    setSelectedClients(selectedLabelValue);
    opponentSetValue("yourClientId", selectedOptions);
    trigger("yourClientId");
  };

  const clientOptions =
    clients?.docs?.map((item) => ({
      value: item?._id,
      label: `${item.nickName}, ${item?.fullName}`,
    })) || [];

  useEffect(() => {
    fetchData();
  }, [
    currentCourt,
    currentHighCourt,
    currentHighCourtBench,
    currentState,
    currentDistrict,
    currentIdentifier,
    currentTribunalAuthority,
    currentRevenueCourt,
    currentDepartment,
    currentDepartmentAuthority,
    currentLokAdalat,
    currentCommissionAuthority,
    currentCommissionBench,
  ]);

  const fetchData = async () => {
    try {
      if (currentCourt && currentHighCourt && currentHighCourtBench) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&highCourtId=${currentHighCourt}&highCourtBenchId=${currentHighCourtBench}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (currentCourt && currentState && currentDistrict) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&stateId=${currentState}&districtId=${currentDistrict}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (currentCourt && currentState && currentTribunalAuthority) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&stateId=${currentState}&tribunalAuthorityId=${currentTribunalAuthority}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (currentCourt && currentRevenueCourt) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&revenueCourtId=${currentRevenueCourt}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (
        currentCourt &&
        currentDepartment &&
        currentDepartmentAuthority
      ) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&departmentId=${currentDepartment}&departmentAuthorityId=${currentDepartmentAuthority}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (currentCourt && currentLokAdalat) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&lokAdalatId=${currentLokAdalat}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (
        currentCourt &&
        currentCommissionerRate &&
        currentCommissionAuthority
      ) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&comissionerRateAuthorityId=${currentCommissionAuthority}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (currentCourt && currentCommissions && currentCommissionBench) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&comissionBenchId=${currentCommissionBench}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (
        currentCourt &&
        (currentCommissionerRate || currentCommissions) &&
        currentState
      ) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}&stateId=${currentState}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      } else if (currentCourt && currentIdentifier) {
        const response = await Axios.get(
          `/case-type/get?uniqueCourtId=${currentCourt}`,
          {
            authenticated: true,
          }
        );
        setCaseType(response.data.data);
        setShowCaseType(true);
      }
    } catch (error) {
      setShowCaseType(false);
    }
  };

  const filterDepartmentAuthority = useMemo(() => {
    if (
      currentDepartment &&
      departmentAthority?.docs &&
      Array.isArray(departmentAthority.docs) &&
      departmentAthority?.docs.length > 0
    ) {
      return departmentAthority?.docs.filter(
        (item) => item.departmentId?._id == currentDepartment
      );
    }
  }, [currentDepartment]);

  const breadcrumbItems = [
    { label: "Cases", href: "/management/cases" }, // Last item (non-clickable)
    { label: "Edit" }, // Last item (non-clickable)
    { label: createExcerpt(caseData?.title, 40) }, // Last item (non-clickable)
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <section className="cases-main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <div>
                <h2 className={formstyle.companyName}>
                  Organization :{" "}
                  {createExcerpt(caseData?.organization?.companyName, 20)}
                </h2>
              </div>
              <div className="list-wrapper mt-2">
                <h1 className="add-case">Update Case</h1>
                <ol className="ps-3">
                  <li>
                    <div className={formstyle.formListleftside}>
                      <span
                        className={`ms-2 cases ${
                          step
                            ? step == "1"
                              ? "active"
                              : step > 1
                              ? "active completed"
                              : ""
                            : ""
                        }`}
                      >
                        Case Information
                      </span>
                      {step && step > 1 && (
                        <span>
                          <Circlecheck color="#1D0093" />
                        </span>
                      )}
                    </div>
                  </li>
                  <li>
                    <div className={formstyle.formListleftside}>
                      <span
                        className={`ms-2 cases ${
                          step
                            ? step == "2"
                              ? "active"
                              : step > 2
                              ? "active completed"
                              : ""
                            : ""
                        }`}
                      >
                        Case Priority
                      </span>
                      {step && step > 2 && (
                        <span>
                          <Circlecheck color="#1D0093" />
                        </span>
                      )}
                    </div>
                  </li>
                  {/* <li>
                    <div className={formstyle.formListleftside}>
                      <span
                        className={`ms-2 cases ${
                          step
                            ? step == "3"
                              ? "active"
                              : step > 3
                              ? "active completed"
                              : ""
                            : ""
                        }`}
                      >
                        Additional Information
                      </span>
                      {step && step > 3 && (
                        <span>
                          <Circlecheck color="#1D0093" />
                        </span>
                      )}
                    </div>
                  </li> */}
                  <li>
                    <div className={formstyle.formListleftside}>
                      <span
                        className={`ms-2 cases ${
                          step
                            ? step == "3"
                              ? "active"
                              : step > 3
                              ? "active completed"
                              : ""
                            : ""
                        }`}
                      >
                        Opponent Information
                      </span>
                      {step && step > 3 && (
                        <span>
                          <Circlecheck color="#1D0093" />
                        </span>
                      )}
                    </div>
                  </li>
                  <li>
                    <div className={formstyle.formListleftside}>
                      <span
                        className={`ms-2 cases ${
                          step
                            ? step == "4"
                              ? "active"
                              : step > 4
                              ? "active completed"
                              : ""
                            : ""
                        }`}
                      >
                        Assignee Information
                      </span>
                      {step && step > 4 && (
                        <span>
                          <Circlecheck color="#1D0093" />
                        </span>
                      )}
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="col-md-6">
              {step && step == "1" && (
                <div className="form-wrapper">
                  <h1 className="form-wrapper-heading">
                    Case Information{" "}
                    <hr className={formstyle.formHeadingline} />
                  </h1>
                  <form onSubmit={handleCaseInfo(caseInfo)}>
                    <div className="row">
                      {/* organizations */}
                      {role && role == "super-admin" && (
                        <div className="col-md-12 mb-3">
                          <label htmlFor="court" className="form-label">
                            Organizations *
                          </label>
                          <select
                            className="form-controle form-select"
                            {...regCaseInfo("organization", {
                              required: "This field is required",
                            })}
                          >
                            <option value="" hidden>
                              Please Select
                            </option>
                            {courts &&
                              Array.isArray(organizations?.docs) &&
                              organizations?.docs?.length > 0 &&
                              organizations?.docs?.map((item, index) => {
                                return (
                                  <option value={item._id} key={index}>
                                    {item?.companyName}
                                  </option>
                                );
                              })}
                          </select>
                          {caseErrors && caseErrors.organization && (
                            <span className="text-danger mt-1">
                              {caseErrors.organization?.message}
                            </span>
                          )}
                        </div>
                      )}

                      {/* courts */}
                      <div className="col-md-12 mb-3">
                        <label htmlFor="court" className="form-label">
                          Court *
                        </label>
                        <select
                          className="form-controle form-select"
                          {...regCaseInfo("court", {
                            required: "This field is required",
                            onChange: (e) => highCourtChange(e.target.value),
                          })}
                          defaultValue={uniqueCourt || ""}
                        >
                          <option value="" hidden>
                            Please Select
                          </option>
                          {courts?.docs &&
                            Array.isArray(courts.docs) &&
                            courts.docs.length > 0 &&
                            courts.docs.map((item, index) => {
                              return (
                                <option value={item?.uniqueCourtId} key={index}>
                                  {item.title}
                                </option>
                              );
                            })}
                        </select>
                        {caseErrors && caseErrors.court && (
                          <span className="text-danger mt-1">
                            {caseErrors.court.message}
                          </span>
                        )}
                      </div>
                      {currentCourt != 10 ? (
                        <>
                          {/* By */}
                          {currentCourt == 1 && (
                            <div className="col-md-12 mb-3">
                              <label htmlFor="by" className="form-label">
                                By
                              </label>
                              <select
                                className="form-controle form-select"
                                {...regCaseInfo("identifier")}
                                defaultValue={caseData?.identifier || ""}
                              >
                                <option value="">Please Select</option>
                                <option value="caseNumber">Case Number</option>
                                <option value="diaryNumber">
                                  Diary Number
                                </option>
                              </select>
                            </div>
                          )}

                          {/* high court */}
                          {currentCourt == 2 && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                High Courts *
                              </label>
                              <select
                                className="form-controle form-select"
                                {...regCaseInfo("highCourtId", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {highCourts?.docs &&
                                  Array.isArray(highCourts.docs) &&
                                  highCourts.docs.length > 0 &&
                                  highCourts.docs.map((item, index) => {
                                    return (
                                      <option value={item._id}>
                                        {item.title}
                                      </option>
                                    );
                                  })}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.highCourtId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.highCourtId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* commissionerate */}
                          {currentCourt == 7 && (
                            <div className="col-md-12 mb-3">
                              <label htmlFor="state" className="form-label">
                                Commissionerate *
                              </label>
                              <select
                                className="form-select"
                                {...regCaseInfo("comissionerRate", {
                                  required: "This field is required",
                                })}
                                value={caseData?.comissionerRate || ""}
                              >
                                <option value="" hidden>
                                  Please Select
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
                                  })}
                                <option value="other">Other</option>{" "}
                              </select>
                              {caseErrors && caseErrors.comissionerRate && (
                                <span className="text-danger mt-1">
                                  {caseErrors.comissionerRate.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* commissionr (consumer forum) */}
                          {currentCourt == 4 && (
                            <div className="col-md-6 mb-3">
                              <label htmlFor="state" className="form-label">
                                Commissions (Consumer Forum) *
                              </label>
                              <select
                                className="form-select"
                                id="commissions"
                                {...regCaseInfo("consumer", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                <option value="district-forum">
                                  District Forum
                                </option>
                                <option value="national-commission">
                                  National Commission - NCDRC
                                </option>
                                <option value="state-commission">
                                  State Commission
                                </option>
                              </select>
                              {caseErrors && caseErrors.consumer && (
                                <span className="text-danger mt-1">
                                  {caseErrors.consumer.message}
                                </span>
                              )}
                            </div>
                          )}

                          {currentCommissions &&
                            currentCommissions == "national-commission" && (
                              <div className="col-md-6 mb-3">
                                <label className="form-label">
                                  Commission Benches *
                                </label>
                                <select
                                  className="form-select"
                                  {...regCaseInfo("comissionBenchId", {
                                    required: "This field is required",
                                  })}
                                >
                                  <option value="" hidden>
                                    Please Select
                                  </option>
                                  {commissionBenches?.docs &&
                                    Array.isArray(commissionBenches.docs) &&
                                    commissionBenches.docs.length > 0 &&
                                    commissionBenches.docs.map(
                                      (item, index) => {
                                        return (
                                          <option value={item._id} key={index}>
                                            {item.title}
                                          </option>
                                        );
                                      }
                                    )}
                                  <option value="other">Other</option>
                                </select>
                                {caseErrors && caseErrors.comissionBenchId && (
                                  <span className="text-danger mt-1">
                                    {caseErrors.comissionBenchId.message}
                                  </span>
                                )}
                              </div>
                            )}

                          {/* Tribunals and authorities */}
                          {currentCourt == 4 && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Tribunal Authorities *
                              </label>
                              <select
                                className="form-select"
                                {...regCaseInfo("tribunalAuthorityId", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {tribunalAuthorities?.docs &&
                                  Array.isArray(tribunalAuthorities.docs) &&
                                  tribunalAuthorities.docs.length > 0 &&
                                  tribunalAuthorities.docs.map(
                                    (item, index) => {
                                      return (
                                        <option value={item._id} key={index}>
                                          {item.title}
                                        </option>
                                      );
                                    }
                                  )}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.tribunalAuthorityId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.tribunalAuthorityId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* state */}
                          {(currentCourt == 3 ||
                            currentCourt == 4 ||
                            currentCommissionerRate ==
                              "Charity Commissionerate" ||
                            currentCommissions == "district-forum" ||
                            currentCommissions == "state-commission") && (
                            <div className="col-md-6 mb-3">
                              <label htmlFor="state" className="form-label">
                                States *
                              </label>
                              <select
                                className="form-select"
                                id="state"
                                {...regCaseInfo("stateId", {
                                  required: "This field is required",
                                })}
                                // value={caseData?.stateId?._id || ""}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {states?.docs &&
                                  Array.isArray(states.docs) &&
                                  states.docs.length > 0 &&
                                  states.docs.map((item, index) => {
                                    return (
                                      <option value={item._id}>
                                        {item.title}
                                      </option>
                                    );
                                  })}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.stateId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.stateId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* district */}
                          {currentCourt == 3 && (
                            <div className="col-md-6 mb-3">
                              <label htmlFor="state" className="form-label">
                                Districts *
                              </label>
                              <select
                                className="form-select"
                                {...regCaseInfo("districtId", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {districts?.docs &&
                                  Array.isArray(districts.docs) &&
                                  districts.docs.length > 0 &&
                                  districts.docs.map((item, index) => {
                                    return (
                                      <option value={item._id}>
                                        {item.title}
                                      </option>
                                    );
                                  })}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.districtId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.districtId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* benches */}
                          {currentCourt == 2 && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Benches *</label>
                              <select
                                className="form-select"
                                {...regCaseInfo("highCourtbencheId", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {allHighCourtBenches?.docs &&
                                  Array.isArray(allHighCourtBenches.docs) &&
                                  allHighCourtBenches.docs.length > 0 &&
                                  allHighCourtBenches.docs.map(
                                    (item, index) => {
                                      return (
                                        <option value={item._id} key={index}>
                                          {item.title}
                                        </option>
                                      );
                                    }
                                  )}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.highCourtbencheId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.highCourtbencheId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Revenue Court */}
                          {currentCourt == 6 && (
                            <div className="col-md-6 mb-3">
                              <label htmlFor="state" className="form-label">
                                Revenue Courts *
                              </label>
                              <select
                                className="form-select"
                                id="revenue"
                                {...regCaseInfo("revenueCourtId", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {revenueCourts?.docs &&
                                  Array.isArray(revenueCourts.docs) &&
                                  revenueCourts.docs.length > 0 &&
                                  revenueCourts.docs.map((item, index) => {
                                    return (
                                      <option value={item._id} key={index}>
                                        {item.title}
                                      </option>
                                    );
                                  })}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.revenueCourtId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.revenueCourtId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Commissionerate Authority */}
                          {currentCommissionerRate &&
                            currentCommissionerRate ==
                              "Commissionerate of commercial Taxes" && (
                              <div className="col-md-6 mb-3">
                                <label className="form-label">
                                  Commissionerate Authorities *
                                </label>
                                <select
                                  className="form-select"
                                  {...regCaseInfo(
                                    "comissionerRateAuthorityId",
                                    {
                                      required: "This field is required",
                                    }
                                  )}
                                >
                                  <option value="" hidden>
                                    Please Select
                                  </option>
                                  {commissionerateAuth?.docs &&
                                    Array.isArray(commissionerateAuth.docs) &&
                                    commissionerateAuth.docs.length > 0 &&
                                    commissionerateAuth.docs.map(
                                      (item, index) => {
                                        return (
                                          <option value={item._id} key={index}>
                                            {item.title}
                                          </option>
                                        );
                                      }
                                    )}
                                  <option value="other">Other</option>
                                </select>
                                {caseErrors &&
                                  caseErrors.comissionerRateAuthorityId && (
                                    <span className="text-danger mt-1">
                                      {
                                        caseErrors.comissionerRateAuthorityId
                                          .message
                                      }
                                    </span>
                                  )}
                              </div>
                            )}

                          {currentCourt == 8 && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Departments *
                              </label>
                              <select
                                className="form-select"
                                id="department"
                                {...regCaseInfo("departmentId", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {departments?.docs &&
                                  Array.isArray(departments.docs) &&
                                  departments.docs.length > 0 &&
                                  departments.docs.map((item, index) => {
                                    return (
                                      <option value={item._id} key={index}>
                                        {item.title}
                                      </option>
                                    );
                                  })}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.departmentId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.departmentId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Sub Department */}
                          {currentDepartment &&
                          departments &&
                          Array.isArray(departments.docs) &&
                          departments.docs.length > 0 &&
                          departments.docs.find(
                            (item) =>
                              item?._id == currentDepartment &&
                              item.title === "GST Department"
                          ) ? (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Sub Departments *
                              </label>
                              <select
                                className="form-select"
                                id="subdepartment"
                                {...regCaseInfo("subDepartment", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                <option value="CGST">CGST</option>
                                <option value="SGST">SGST</option>
                              </select>
                              {caseErrors && caseErrors.subDepartment && (
                                <span className="text-danger mt-1">
                                  {caseErrors.subDepartment.message}
                                </span>
                              )}
                            </div>
                          ) : null}

                          {currentCourt == 9 && (
                            <div className="col-md-12 mb-3">
                              <label className="form-label">Lok Adalat *</label>
                              <select
                                className="form-select"
                                id="lokAdalat"
                                {...regCaseInfo("lokAdalatId", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {lokAdalats?.docs &&
                                  Array.isArray(lokAdalats.docs) &&
                                  lokAdalats.docs.length > 0 &&
                                  lokAdalats.docs.map((item, index) => {
                                    return (
                                      <option value={item._id} key={index}>
                                        {item.title}
                                      </option>
                                    );
                                  })}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.lokAdalatId && (
                                <span className="text-danger mt-1">
                                  {caseErrors.lokAdalatId.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Department Authorities */}
                          {currentCourt == 8 && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Authorities *
                              </label>
                              <select
                                className="form-select"
                                {...regCaseInfo("authority", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="">Please Select</option>
                                {filterDepartmentAuthority &&
                                  Array.isArray(filterDepartmentAuthority) &&
                                  filterDepartmentAuthority.length > 0 &&
                                  filterDepartmentAuthority.map(
                                    (item, index) => {
                                      return (
                                        <option value={item._id} key={index}>
                                          {item.title}
                                        </option>
                                      );
                                    }
                                  )}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.authority && (
                                <span className="text-danger mt-1">
                                  {caseErrors.authority.message}
                                </span>
                              )}
                            </div>
                          )}

                          {/* case type */}
                          {showCaseType && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Case Type *</label>
                              <select
                                className="form-select"
                                {...regCaseInfo("caseType", {
                                  required: "This field is required",
                                })}
                              >
                                <option value="" hidden>
                                  Please Select
                                </option>
                                {caseType?.docs &&
                                  Array.isArray(caseType.docs) &&
                                  caseType.docs.length > 0 &&
                                  caseType.docs.map((item, index) => {
                                    return (
                                      <option value={item.title}>
                                        {item.title}
                                      </option>
                                    );
                                  })}{" "}
                                <option value="other">Other</option>
                              </select>
                              {caseErrors && caseErrors.caseType && (
                                <span className="text-danger">
                                  {caseErrors?.caseType?.message}
                                </span>
                              )}
                              {currentCaseType &&
                                currentCaseType == "other" && (
                                  <>
                                    <input
                                      type="text"
                                      className={`form-control mt-4 ${formstyle.commonFormInput}`}
                                      {...regCaseInfo("caseDes", {
                                        required: "This field is required",
                                      })}
                                      defaultValue={caseData?.caseType || ""}
                                    />
                                    {caseErrors && caseErrors.caseDes && (
                                      <span className="text-danger mt-1">
                                        {caseErrors.caseDes.message}
                                      </span>
                                    )}
                                  </>
                                )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* case type */}
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Case Type *</label>
                            <select
                              className="form-select"
                              {...regCaseInfo("caseType", {
                                required: "This field is required",
                              })}
                            >
                              <option value="" hidden>
                                Please Select
                              </option>
                              {caseType?.docs &&
                                Array.isArray(caseType.docs) &&
                                caseType.docs.length > 0 &&
                                caseType.docs.map((item, index) => {
                                  return (
                                    <option value={item.title}>
                                      {item.title}
                                    </option>
                                  );
                                })}{" "}
                              <option value="other">Other</option>
                            </select>
                            {caseErrors && caseErrors?.caseType && (
                              <span className="text-danger">
                                {caseErrors?.caseType?.message}
                              </span>
                            )}
                            {currentCaseType && currentCaseType == "other" && (
                              <>
                                <input
                                  type="text"
                                  className={`form-control ${formstyle.commonFormInput}`}
                                  {...regCaseInfo("caseDes", {
                                    required: "This field is required",
                                  })}
                                  placeholder="Enter Case Number"
                                />
                                {caseErrors && caseErrors.caseDes && (
                                  <span className="text-danger mt-1">
                                    {caseErrors.caseDes.message}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {/* Case Number */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="caseNumber" className="form-label">
                          {currentIdentifier == "diaryNumber"
                            ? "Diary Number"
                            : "Case Number"}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formstyle.commonFormInput}`}
                          id="caseNumber"
                          {...regCaseInfo("caseNumber", {
                            maxLength: {
                              value: 20,
                              message: "Case number should be 20 digits",
                            },
                          })}
                          placeholder={
                            currentIdentifier == "diaryNumber"
                              ? "Enter Diary Number"
                              : "Enter Case Number"
                          }
                        />
                        {caseErrors.caseNumber && (
                          <span className="text-danger">
                            {caseErrors.caseNumber.message}
                          </span>
                        )}
                      </div>

                      {/* title */}
                      <div className="col-md-12 mb-3">
                        <label htmlFor="title" className="form-label">
                          Title *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formstyle.commonFormInput}`}
                          id="title"
                          {...regCaseInfo("title", {
                            required: "This field is required",
                          })}
                          placeholder="Enter Title"
                        />
                        {caseErrors && caseErrors.title && (
                          <span className="text-danger">
                            {caseErrors.title.message}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <div className="mb-3 col-md-12">
                        <label className="form-label d-block">
                          Description *
                        </label>
                        <textarea
                          className={`form-control ${formstyle.commonFormInput}`}
                          placeholder="Enter Description"
                          {...regCaseInfo("description", {
                            required: "This field is required",
                          })}
                        />
                        {caseErrors && caseErrors.description && (
                          <span className="text-danger mt-1">
                            {caseErrors.description.message}
                          </span>
                        )}
                      </div>

                      {/* court hall */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="courtHall" className="form-label">
                          Court Hall
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formstyle.commonFormInput}`}
                          id="courtHall"
                          {...regCaseInfo("courtHall")}
                          defaultValue={caseData?.caseHall || ""}
                          placeholder="Enter Counter Hall"
                        />
                      </div>
                      {/* floor */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="floor" className="form-label">
                          Floor
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formstyle.commonFormInput}`}
                          id="floor"
                          {...regCaseInfo("floor")}
                          placeholder="Enetr Floor"
                          defaultValue={caseData?.Floor || ""}
                        />
                      </div>
                      {/* Year */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="caseYear" className="form-label">
                          Case Year *
                        </label>
                        <select
                          className="form-control form-select"
                          id="caseYear"
                          {...regCaseInfo("caseYear", {
                            required: "This field is required",
                          })}
                        >
                          <option value="">Please Select</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                        {caseErrors && caseErrors.caseYear && (
                          <span className="text-danger mt-1">
                            {caseErrors.caseYear.message}
                          </span>
                        )}
                      </div>

                      {/* financial year */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="financialYear" className="form-label">
                          Financial Year *
                        </label>
                        <div className="accordion" id="accordionFinancialYear">
                          <div
                            className={`accordion-item ${formstyle.financialAccordion}`}
                          >
                            <h2 className="accordion-header" id="headingOne">
                              <button
                                className={`accordion-button ${formstyle.financialAccordionButton}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseOne"
                                aria-expanded="false"
                                aria-controls="collapseOne"
                              >
                                Select Financial Year(s)
                              </button>
                            </h2>
                            <div
                              id="collapseOne"
                              className="accordion-collapse collapse"
                              aria-labelledby="headingOne"
                              data-bs-parent="#accordionFinancialYear"
                            >
                              <div className="accordion-body">
                                <div className="d-flex flex-column">
                                  {yearRange &&
                                    Array.isArray(yearRange) &&
                                    yearRange?.map((year) => (
                                      <div key={year} className="form-check">
                                        <input
                                          type="checkbox"
                                          className="form-check-input"
                                          id={`financialYear-${year}`}
                                          value={year}
                                          {...regCaseInfo("financialYear", {
                                            required:
                                              "At least one year must be selected",
                                          })}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor={`financialYear-${year}`}
                                        >
                                          {year}
                                        </label>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {caseErrors && caseErrors.financialYear && (
                          <span className="text-danger mt-1">
                            {caseErrors.financialYear.message}
                          </span>
                        )}
                      </div>

                      {/* Date of filling */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="dateOfFilling" className="form-label">
                          Date Of Issuance *
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="dateOfFilling"
                          {...regCaseInfo("dateOfFilling", {
                            required: "This field is required",
                          })}
                        />
                        {caseErrors && caseErrors.dateOfFilling && (
                          <span className="text-danger mt-1">
                            {caseErrors.dateOfFilling.message}
                          </span>
                        )}
                      </div>
                      {/* Due Date */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Due Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          {...regCaseInfo("dueDate", {
                            required: "This field is required",
                          })}
                          defaultValue={
                            caseData?.dueDate
                              ? new Date(caseData.dueDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                        />
                        {caseErrors && caseErrors.dueDate && (
                          <span className="text-danger mt-1">
                            {caseErrors.dueDate.message}
                          </span>
                        )}
                      </div>

                      {/* Case Handling Priority */}
                      <div className="col-md-12 mb-3 mt-3">
                        <h2 className={formstyle.caseHandlingheading}>
                          Case handling priority
                        </h2>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          className={`d-flex align-items-center ${formstyle.superCriticalsection}`}
                        >
                          <div className={formstyle.superCriticalbox}></div>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput} ${formstyle.inputBorder}`}
                            {...regCaseInfo("superCritical", {
                              required: "This field is required",
                            })}
                            placeholder="Enter Percentage"
                            min={0} // Optional: Prevents negative values
                            max={100} // Ensures value doesn't exceed 100
                            defaultValue={33}
                            onInput={(e) => {
                              // Remove non-numeric characters
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (value > 100) {
                                e.target.value = 100; // Ensure value doesn't exceed 100
                              }
                              caseTrigger("superCritical");
                            }}
                          />
                          <div className={formstyle.casePercenticon}>%</div>
                        </div>
                        {caseErrors && caseErrors.superCritical && (
                          <span className="text-danger mt-1">
                            {caseErrors.superCritical.message}
                          </span>
                        )}
                      </div>

                      <div className="col-md-4 mb-3">
                        <div
                          className={`d-flex align-items-center ${formstyle.superCriticalsection}`}
                        >
                          <div className={formstyle.Criticalbox}></div>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}  ${formstyle.inputBorder}`}
                            {...regCaseInfo("critical", {
                              required: "This field is required",
                            })}
                            placeholder="Enter Percentage"
                            min={0} // Optional: Prevents negative values
                            max={100} // Ensures value doesn't exceed 100
                            defaultValue={33}
                            onInput={(e) => {
                              // Remove non-numeric characters
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (value > 100) {
                                e.target.value = 100; // Ensure value doesn't exceed 100
                              }
                              caseTrigger("critical");
                            }}
                          />
                          <div className={formstyle.casePercenticon}>%</div>
                        </div>

                        {caseErrors && caseErrors.critical && (
                          <span className="text-danger mt-1">
                            {caseErrors.critical.message}
                          </span>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <div
                          className={`d-flex align-items-center ${formstyle.superCriticalsection}`}
                        >
                          <div className={formstyle.normalCriticalbox}></div>

                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput} ${formstyle.inputBorder}`}
                            {...regCaseInfo("normal", {
                              required: "This field is required",
                            })}
                            placeholder="Enter Percentage"
                            min={0} // Optional: Prevents negative values
                            max={100} // Ensures value doesn't exceed 100
                            defaultValue={34}
                            onInput={(e) => {
                              // Remove non-numeric characters
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (value > 100) {
                                e.target.value = 100; // Ensure value doesn't exceed 100
                              }
                              caseTrigger("normal");
                            }}
                          />
                          <div className={formstyle.casePercenticon}>%</div>
                        </div>
                        {caseErrors && caseErrors.normal && (
                          <span className="text-danger mt-1">
                            {caseErrors.normal.message}
                          </span>
                        )}
                      </div>

                      {priorityError && (
                        <span className="text-danger">{priorityError}</span>
                      )}
                      <div className="col-md-12 mb-3 text-end d-flex justify-content-end ">
                        <button
                          type="submit"
                          className={`commonButton mb-2 mt-2 ps-4 pe-4ps-4 pe-4 ${formstyle.formarrowButtons} `}
                        >
                          Continue to the Next Step
                          <RightArrow />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              <div>
                {/* case priority */}
                {step && step == "2" && (
                  <div className="form-wrapper">
                    <h1 className="form-wrapper-heading">
                      Case Type and Priority
                      <hr className={formstyle.formHeadingline} />
                    </h1>
                    <form onSubmit={handleCasePriority(casePriority)}>
                      <div className="row">
                        {/* Apearing Modal */}
                        <div className="col-md-12 mb-3">
                          <label className="form-label">
                            Appearing Model *
                          </label>
                          <select
                            className="form-controle form-select"
                            {...regCasePriority("appearingModel", {
                              required: "This filed is required",
                            })}
                          >
                            <option value="" hidden>
                              Please Select
                            </option>
                            {appearingModal &&
                              Array.isArray(appearingModal) &&
                              appearingModal.length > 0 &&
                              appearingModal.map((item, index) => {
                                return (
                                  <option
                                    value={JSON.stringify(item)}
                                    key={index}
                                    selected={index === 0}
                                  >
                                    {item.title}
                                  </option>
                                );
                              })}
                          </select>
                          {priorityErrors && priorityErrors.appearingModel && (
                            <span className="text-danger">
                              {priorityErrors.appearingModel.message}
                            </span>
                          )}
                        </div>
                        {/* are you appearing as */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Are you appearing as? *
                          </label>
                          <div>
                            {appearing &&
                            Array.isArray(appearing) &&
                            appearing.length > 0 ? (
                              appearing.map((item, index) => {
                                return (
                                  <div className="form-check" key={index}>
                                    <input
                                      type="radio"
                                      className="form-check-input"
                                      id={`appearing-${index}`}
                                      value={item}
                                      defaultChecked={
                                        caseData?.appearingAs === item
                                      }
                                      {...regCasePriority("appearingAs", {
                                        required: "This field is required",
                                      })}
                                    />
                                    <label
                                      htmlFor={`appearing-${index}`}
                                      className="form-check-label"
                                    >
                                      {item}
                                    </label>
                                  </div>
                                );
                              })
                            ) : (
                              <>
                                <div className="form-check">
                                  <input
                                    type="radio"
                                    className="form-check-input"
                                    id="petitioner"
                                    value="petitioner"
                                    {...regCasePriority("appearingAs", {
                                      required: "This field is required",
                                    })}
                                  />
                                  <label
                                    htmlFor="petitioner"
                                    className="form-check-label"
                                  >
                                    Petitioner
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    type="radio"
                                    className="form-check-input"
                                    id="respondent"
                                    value="respondent"
                                    {...regCasePriority("appearingAs", {
                                      required: "This field is required",
                                    })}
                                  />
                                  <label
                                    htmlFor="respondent"
                                    className="form-check-label"
                                  >
                                    Respondent
                                  </label>
                                </div>
                              </>
                            )}

                            {/* Display error message only once */}
                            {priorityErrors?.appearingAs && (
                              <span className="text-danger">
                                {priorityErrors.appearingAs.message}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* appearing person */}
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="appearingPerson"
                            className="form-label"
                          >
                            {currentAppearingAs
                              ? currentAppearingAs
                              : "Petitioner"}{" "}
                          </label>
                          <input
                            className="form-control"
                            id="appearingPerson"
                            {...regCasePriority("appearingPerson")}
                          />
                        </div>
                        {/* classification */}
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="classification"
                            className="form-label"
                          >
                            Classification
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            id="classification"
                            placeholder="Enter Classification"
                            {...regCasePriority("classification")}
                          />
                        </div>

                        {/* Refered by */}
                        <div className="col-md-6 mb-3">
                          <label htmlFor="referredBy" className="form-label">
                            Referred By
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            id="referredBy"
                            {...regCasePriority("referredBy")}
                            placeholder="Enter Referred"
                          />
                        </div>

                        {/* Priority */}
                        <div className="col-md-6 mb-3">
                          <label htmlFor="priority" className="form-label">
                            Priority
                          </label>
                          <select
                            type="text"
                            className="form-control form-select"
                            id="priority"
                            defaultValue="routine"
                            {...regCasePriority("priority")}
                          >
                            <option value="">Please Select</option>
                            <option value="superCritical">
                              Super Critical
                            </option>
                            <option value="critical">Critical</option>
                            <option value="important">Important</option>
                            <option value="routine">Routine</option>
                            <option value="normal">normal</option>
                            <option value="others">Others</option>
                          </select>
                        </div>
                        {/* Under acts */}
                        <div className="col-md-6 mb-3">
                          <label htmlFor="underActs" className="form-label">
                            Case Under Act(s)
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            id="underActs"
                            {...regCasePriority("underActs")}
                            placeholder=" Case Act"
                            defaultValue={
                              currentDepartment &&
                              departments &&
                              Array.isArray(departments.docs) &&
                              departments.docs.length > 0 &&
                              departments.docs.find(
                                (item) => item.title === "GST Department"
                              )
                                ? "CGST Act"
                                : ""
                            }
                          />
                        </div>
                        {/* Before honable judges */}
                        <div className="col-md-4 mb-3">
                          <label htmlFor="judge" className="form-label">
                            Before Hon'ble Judge(s)
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            id="judge"
                            {...regCasePriority("beforeHonableJudge")}
                            placeholder=" Before Hon'ble judge(s)"
                          />
                        </div>

                        {/* Section Category */}
                        <div className="col-md-4 mb-3">
                          <label
                            htmlFor="sectionCategory"
                            className="form-label"
                          >
                            Section/Category
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            id="sectionCategory"
                            {...regCasePriority("sectionCategory")}
                            placeholder="Section/Category"
                          />
                        </div>
                        {/* Fire police station */}
                        <div className="col-md-4 mb-3">
                          <label
                            htmlFor="firPoliceStation"
                            className="form-label"
                          >
                            FIR Police Station
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            id="firPoliceStation"
                            {...regCasePriority("firPoliceStation")}
                            placeholder="FIR Police Station"
                          />
                        </div>
                        {/* Fir Number*/}
                        <div className="col-md-4 mb-3">
                          <label htmlFor="firNumber" className="form-label">
                            FIR Number
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            id="firNumber"
                            {...regCasePriority("firNumber")}
                            placeholder="FIR Number"
                          />
                        </div>
                        {/* Fir year */}
                        <div className="col-md-4 mb-3">
                          <label htmlFor="caseYear" className="form-label">
                            FIR Year
                          </label>
                          <select
                            className="form-control form-select"
                            id="firYear"
                            {...regCasePriority("firYear")}
                          >
                            <option value="">Please Select</option>
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Affidevit */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Is the affidavit/vakalath filed?
                          </label>
                          <div className="d-flex align-items-center flex-wrap">
                            <div className="form-check">
                              <input
                                type="radio"
                                className="form-check-input"
                                id="affidavitYes"
                                value="Yes"
                                {...regCasePriority("affidavitStatus")}
                              />
                              <label
                                htmlFor="affidavitYes"
                                className="form-check-label"
                              >
                                Yes
                              </label>
                            </div>
                            <div className="form-check ms-3">
                              <input
                                type="radio"
                                className="form-check-input"
                                id="affidavitNo"
                                value="No"
                                {...regCasePriority("affidavitStatus")}
                              />
                              <label
                                htmlFor="affidavitNo"
                                className="form-check-label"
                              >
                                No
                              </label>
                            </div>
                            <div className="form-check ms-3">
                              <input
                                type="radio"
                                className="form-check-input"
                                id="affidavitNA"
                                value="Not Applicable"
                                {...regCasePriority("affidavitStatus")}
                              />
                              <label
                                htmlFor="affidavitNA"
                                className="form-check-label"
                              >
                                Not Applicable
                              </label>
                            </div>
                          </div>
                        </div>
                        {/* Affidavit filling data */}
                        {currentAffidavit && currentAffidavit == "Yes" && (
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="affidavitFillingDate"
                              className="form-label"
                            >
                              Affidavit Filing Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="affidavitFillingDate"
                              {...regCasePriority("affidavitFillingDate")}
                            />
                          </div>
                        )}
                      </div>
                      <div className="col-md-12 mb-3 d-flex justify-content-between">
                        <div>
                          <button
                            type="button"
                            className={`commonButtonBack mb-2 mt-2 ps-4 pe-4 ${formstyle.continueBackButton} ${formstyle.formarrowButtons}`}
                            onClick={() =>
                              setStep(step && step != "1" ? step - 1 : "")
                            }
                          >
                            <LeftArrow />
                            Continue to the Back Step
                          </button>
                        </div>
                        <div>
                          <button
                            type="submit"
                            className={`commonButton mb-2 mt-2 ps-4 pe-4 ${formstyle.formarrowButtons}`}
                          >
                            Continue to the next Step
                            <RightArrow />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Additional Infromation */}
                {/* {step && step == "3" && (
                  <div className="form-wrapper">
                    <h1 className="form-wrapper-heading">
                      Additional Infromation *
                      <hr className={formstyle.formHeadingline} />
                    </h1>
                    <form onSubmit={handleAdditionalInfo(additionalInfo)}>
                      <div className="row">

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="auditProceedings"
                            className="form-label"
                          >
                            Audit Proceedings
                          </label>
                          <select
                            className="form-control form-select"
                            id="auditProceedings"
                            {...regAdditionalInfo(
                              "additionalFields.auditProceedings"
                            )}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST ADT-01 - Initiation of audit">
                              FORM GST ADT-01 - Initiation of audit
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="inspectionProceedings"
                            className="form-label"
                          >
                            Inspection Proceedings
                          </label>
                          <select
                            className="form-control form-select"
                            id="inspectionProceedings"
                            {...regAdditionalInfo(
                              "additionalFields.inspectionProceedings"
                            )}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST INS-01 - Search/inspection authorizationt">
                              FORM GST INS-01 - Search/inspection authorizationt
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="sucurityAssessmentProceedings"
                            className="form-label"
                          >
                            Security Assessment Proceedings
                          </label>
                          <select
                            className="form-control form-select"
                            id="sucurityAssessmentProceedings"
                            {...regAdditionalInfo(
                              "additionalFields.securityAssesmentProceedings"
                            )}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM ASMT-10 - Scrutiny Assessment Notice">
                              FORM ASMT-10 - Scrutiny Assessment Notice
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="preShowCauseProceedings"
                            className="form-label"
                          >
                            Pre-show cause notice Proceedings
                          </label>
                          <select
                            className="form-control form-select"
                            id="preShowCauseProceedings"
                            {...regAdditionalInfo(
                              "additionalFields.preShowCauseProceedings"
                            )}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST DRC-01A - Intimation Notice">
                              FORM GST DRC-01A - Intimation Notice
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="showCauseProceedings"
                            className="form-label"
                          >
                            Show cause notice Proceedings
                          </label>
                          <select
                            className="form-control form-select"
                            id="showCauseProceedings"
                            {...regAdditionalInfo(
                              "additionalFields.showCauseProceedings"
                            )}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST DRC-01 - Show Cause Notice">
                              FORM GST DRC-01 - Show Cause Notice
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="order" className="form-label">
                            Order
                          </label>
                          <select
                            className="form-control form-select"
                            id="order"
                            {...regAdditionalInfo("additionalFields.order")}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST DRC-07 - Adjudication Order">
                              FORM GST DRC-07 - Adjudication Order
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="appeal" className="form-label">
                            Appeal
                          </label>
                          <select
                            className="form-control form-select"
                            id="appeal"
                            {...regAdditionalInfo("additionalFields.appeal")}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST APL-01 - Appeal Order">
                              FORM GST APL-01 - Appeal Order
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="reconciliationNotice"
                            className="form-label"
                          >
                            Reconciliation Notices
                          </label>
                          <select
                            className="form-control form-select"
                            id="reconciliationNotice"
                            {...regAdditionalInfo(
                              "additionalFields.reconciliationNotice"
                            )}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST DRC-01B">
                              FORM GST DRC-01B
                            </option>
                            <option value="FORM GST DRC-01C">
                              FORM GST DRC-01C
                            </option>
                            <option value="FORM GST DRC-01D">
                              FORM GST DRC-01D
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="refund" className="form-label">
                            Refund
                          </label>
                          <select
                            className="form-control form-select"
                            id="refund"
                            {...regAdditionalInfo("additionalFields.refund")}
                          >
                            <option value="">Please Select</option>
                            <option value="FORM GST RFD-08 - Show Cause Notice">
                              FORM GST RFD-08 - Show Cause Notice
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="summonProceedings"
                            className="form-label"
                          >
                            Summon Proceedings
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="summonProceedings"
                            {...regAdditionalInfo(
                              "additionalFields.summonProceedings"
                            )}
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="others" className="form-label">
                            Others
                          </label>
                          <input
                            type="text"
                            className={`form-control ${formstyle.commonFormInput}`}
                            placeholder="Others"
                            id="others"
                            {...regAdditionalInfo("additionalFields.others")}
                          />
                        </div>
                        <div
                          className={`col-md-12 mb-3 d-flex justify-content-between `}
                        >
                          <div>
                            <button
                              type="button"
                              className={`commonButtonBack mb-2 mt-2 ps-4 pe-4 ${formstyle.continueBackButton}  ${formstyle.formarrowButtons}`}
                              onClick={() =>
                                setStep(step && step != "1" ? step - 1 : "")
                              }
                            >
                              <LeftArrow />
                              Continue to the Back Step
                            </button>
                          </div>
                          <div>
                            <button
                              type="submit"
                              className={`commonButton mb-2 mt-2 ps-4 pe-4  ${formstyle.formarrowButtons}`}
                            >
                              Continue to the next Step
                              <RightArrow />
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )} */}

                {/* Opponents Information */}
                {step && step == "3" && (
                  <div className="form-wrapper">
                    <h1 className="form-wrapper-heading">
                      Opponent Information
                      <hr className={formstyle.formHeadingline} />
                    </h1>
                    <form onSubmit={handleOpponentInfo(OpponentInfo)}>
                      <div className="row">
                        {/* your clients */}
                        <div>
                          <h5 className="text-capitalize">
                            Your Clients (
                            {watchCasePriority("appearingAs")
                              ? watchCasePriority("appearingAs")
                              : "Petitioner"}
                            ) *
                          </h5>
                        </div>
                        <div className="col-md-12 mb-3">
                          <Search
                            className="custom-select-search"
                            options={clientOptions} // Pass client options
                            value={selectedClients} // Pass the selected clients as an array of objects
                            placeholder="Select your clients"
                            onChange={handleClientChange} // Handle client selection change
                            id="yourClient"
                          />
                          <input
                            type="hidden"
                            {...regOpponentInfo("yourClientId", {
                              required: "This field is required",
                            })}
                          />
                          {/* Show error message if validation fails */}
                          {opponentErrors.yourClientId && (
                            <span className="text-danger">
                              {opponentErrors.yourClientId.message}
                            </span>
                          )}
                        </div>

                        <div className="col-md-12 mb-3">
                          <h5>
                            Opponents
                            {appearing &&
                              Array.isArray(appearing) &&
                              appearing
                                .filter(
                                  (item) =>
                                    item !== watchCasePriority("appearingAs")
                                ) // Filter items that do not match
                                .map((item, index) => (
                                  <span key={index}> ({item}) </span> // Display the unmatched items
                                ))}{" "}
                          </h5>
                          <div className="mb-3">
                            {fields.map((item, index) => (
                              <div
                                key={item.id}
                                className="border p-3 mb-2 rounded"
                              >
                                <div className="row">
                                  {/* Full Name */}
                                  <div className="col-md-4 mb-3">
                                    <label className="form-label">
                                      Full Name
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      {...regOpponentInfo(
                                        `opponents.${index}.fullName`
                                      )}
                                    />
                                  </div>

                                  {/* Email Address */}
                                  <div className="col-md-4 mb-3">
                                    <label className="form-label">
                                      Email Address
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      {...regOpponentInfo(
                                        `opponents.${index}.email`,
                                        {
                                          pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Invalid email address",
                                          },
                                        }
                                      )}
                                    />
                                    {opponentErrors.opponents?.[index]
                                      ?.email && (
                                      <span className="text-danger">
                                        {
                                          opponentErrors.opponents[index].email
                                            .message
                                        }
                                      </span>
                                    )}
                                  </div>

                                  {/* Phone Number */}
                                  <div className="col-md-4 mb-3">
                                    <label className="form-label">
                                      Phone Number
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      {...regOpponentInfo(
                                        `opponents.${index}.phoneNumber`,
                                        {
                                          minLength: {
                                            value: 10,
                                            message:
                                              "Phone number must be 10 digits",
                                          },
                                          maxLength: {
                                            value: 10,
                                            message:
                                              "Phone number must be 10 digits",
                                          },
                                          pattern: {
                                            value: /^[0-9]*$/,
                                            message: "Only numbers are allowed",
                                          },
                                        }
                                      )}
                                      maxLength={10}
                                      onInput={(e) => {
                                        e.target.value = e.target.value.replace(
                                          /[^0-9]/g,
                                          ""
                                        );
                                      }}
                                    />
                                    {opponentErrors.opponents?.[index]
                                      ?.phoneNumber && (
                                      <span className="text-danger">
                                        {
                                          opponentErrors.opponents[index]
                                            .phoneNumber.message
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {fields.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-danger mt-2"
                                    onClick={() => remove(index)}
                                  >
                                    <TrashIcon />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              className={`btn  mt-3 ${formstyle.addressButton}`}
                              onClick={() =>
                                append({
                                  fullName: "",
                                  email: "",
                                  phoneNumber: "",
                                })
                              }
                            >
                              Add
                              <AddIcon />
                            </button>
                          </div>
                        </div>

                        {/* Opponent Advocates */}
                        <div>
                          <h5>
                            Opponent Advocates
                            {appearing &&
                              Array.isArray(appearing) &&
                              appearing
                                .filter(
                                  (item) =>
                                    item !== watchCasePriority("appearingAs")
                                ) // Filter items that do not match
                                .map((item, index) => (
                                  <span key={index}> ({item}) </span> // Display the unmatched items
                                ))}{" "}
                          </h5>{" "}
                        </div>
                        <div className="col-md-12 mb-3">
                          {opponentAdvocatesFields.map((item, index) => (
                            <div
                              key={item.id}
                              className="border p-3 mb-2 rounded"
                            >
                              <div className="row">
                                {/* Full Name */}
                                <div className="col-md-4 mb-3">
                                  <label className="form-label">
                                    Full Name
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    {...regOpponentInfo(
                                      `opponentAdvocates.${index}.fullName`
                                    )}
                                  />
                                </div>

                                {/* Email Address */}
                                <div className="col-md-4 mb-3">
                                  <label className="form-label">
                                    Email Address
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    {...regOpponentInfo(
                                      `opponentAdvocates.${index}.email`,
                                      {
                                        pattern: {
                                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                          message: "Invalid email address",
                                        },
                                      }
                                    )}
                                  />
                                  {opponentErrors.opponentAdvocates?.[index]
                                    ?.email && (
                                    <span className="text-danger">
                                      {
                                        opponentErrors.opponentAdvocates[index]
                                          .email.message
                                      }
                                    </span>
                                  )}
                                </div>

                                {/* Phone Number */}
                                <div className="col-md-4 mb-3">
                                  <label className="form-label">
                                    Phone Number
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    {...regOpponentInfo(
                                      `opponentAdvocates.${index}.phoneNumber`,
                                      {
                                        minLength: {
                                          value: 10,
                                          message:
                                            "Phone number must be 10 digits",
                                        },
                                        maxLength: {
                                          value: 10,
                                          message:
                                            "Phone number must be 10 digits",
                                        },
                                        pattern: {
                                          value: /^[0-9]*$/,
                                          message: "Only numbers are allowed",
                                        },
                                      }
                                    )}
                                    maxLength={10}
                                    onInput={(e) => {
                                      e.target.value = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                      );
                                    }}
                                  />
                                  {opponentErrors.opponentAdvocates?.[index]
                                    ?.phoneNumber && (
                                    <span className="text-danger">
                                      {
                                        opponentErrors.opponentAdvocates[index]
                                          .phoneNumber.message
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                              {opponentAdvocatesFields.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger mt-2"
                                  onClick={() => opponentAdvocatesRemove(index)}
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            className={`btn  mt-3 ${formstyle.addressButton}`}
                            onClick={() =>
                              opponentAdvocatesAppend({
                                fullName: "",
                                email: "",
                                phoneNumber: "",
                              })
                            }
                          >
                            Add
                            <AddIcon />
                          </button>
                        </div>

                        <div className="col-md-12 mb-3 d-flex justify-content-between">
                          <button
                            type="button"
                            className={`commonButtonBack mb-2 mt-2 ps-4 pe-4 ${formstyle.continueBackButton} ${formstyle.formarrowButtons}`}
                            onClick={() =>
                              setStep(step && step !== "1" ? step - 1 : "")
                            }
                          >
                            <LeftArrow />
                            Continue to the Back Step
                          </button>
                          <button
                            type="submit"
                            className={`commonButton mb-2 mt-2 ps-4 pe-4 ${formstyle.formarrowButtons}`}
                          >
                            Continue to the Next Step
                            <RightArrow />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Assignee information */}
                {step && step === "4" && (
                  <div className="form-wrapper">
                    <h1 className="form-wrapper-heading">
                      Assignee Information
                      <hr className={formstyle.formHeadingline} />
                    </h1>
                    <div className="col-md-12 mb-3">
                      <div className="btn-group w-100">
                        <button
                          className={`btn btn-secondary form-select text-start ${formstyle.addCasedropdown}`}
                          type="button"
                          data-bs-toggle="dropdown"
                          data-bs-auto-close="outside"
                          aria-expanded="false"
                        >
                          Select Team Members
                        </button>
                        <div className="dropdown-menu p-4 w-100">
                          {Array.isArray(getUser) &&
                            getUser.map((item) => {
                              const isChecked =
                                selectedUsers.includes(item._id) ||
                                item.role === "admin";

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
                    <div className="col-md-12 mb-3 d-flex justify-content-between">
                      <div>
                        <button
                          type="button"
                          className={`commonButtonBack mb-2 mt-2 ps-4 pe-4 ${formstyle.continueBackButton} ${formstyle.formarrowButtons}`}
                          onClick={() =>
                            setStep((prev) => (prev !== "1" ? prev - 1 : prev))
                          }
                          disabled={loading}
                        >
                          <LeftArrow />
                          Continue to the Back Step
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          className={`commonButton mb-2 mt-2 ps-4 pe-4 ${formstyle.formarrowButtons}y`}
                          disabled={loading}
                          onClick={SubmitHandler}
                        >
                          {loading ? "Submitting" : "Submit"}
                          <RightArrow />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div className="to-do-detail">
                <h1 className="to-do-heading">Upcoming To-Dos</h1>
                {upcomingTodos &&
                  Array.isArray(upcomingTodos) &&
                  upcomingTodos.length > 0 &&
                  upcomingTodos.map((item, index) => {
                    if (index > 2) return;
                    return (
                      <>
                        <p className="to-do-date-para">{`${formatDateToReadableString(
                          item?.startDateTime
                        )} ${formatTimeToIST(item?.startDateTime)}`}</p>
                        <p>
                          <span className="fw-bold">Client Name : </span>
                          {item?.relatedToCaseId[0]?.yourClientId?.fullName ||
                            ""}
                        </p>
                        <p
                          className="to-do-para-proceedings"
                          dangerouslySetInnerHTML={{
                            __html: item?.description || "",
                          }}
                        ></p>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        {/* Button trigger modal */}
        <button
          type="button"
          ref={openSuccessModal}
          className="btn  d-none"
          data-bs-toggle="modal"
          data-bs-target="#successModal"
        ></button>

        {/* Modal */}
        <div
          className="modal fade"
          id="successModal"
          tabindex="-1"
          aria-labelledby="successModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content ${formstyle.modalContent} `}>
              <div className="modal-body text-center">
                <span>
                  <Circlecheck color="#1D0093" height="110px" width="110px" />
                </span>
                <div>
                  <h2 className={formstyle.modalHeading}>Success</h2>
                </div>
                <div>
                  <span className={formstyle.modalCasedeatils}>
                    {`Your Case ${
                      currentCase && currentCase?.title
                    } has been successfully updated`}{" "}
                  </span>
                </div>
              </div>
              <div className={`modal-footer ${formstyle.modalFooter}`}>
                <button
                  type="button"
                  className={formstyle.continueBackButton}
                  data-bs-dismiss="modal"
                  onClick={() => router.push("/management/cases")}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="commonButton"
                  data-bs-dismiss="modal"
                  onClick={() =>
                    router.push(
                      `/management/cases/${
                        currentCase && currentCase ? currentCase._id : ""
                      }`
                    )
                  }
                >
                  View Case
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export async function getServerSideProps(context) {
  const { query } = context;
  try {
    const [
      caseRes,
      courtRes,
      organizationRes,
      highCourtRes,
      stateRes,
      districtRes,
      revenueCourtRes,
      tribunalAuthorityRes,
      departmentRes,
      lokAdalatRes,
      clientRes,
      userRes,
      departmentAuthorityRes,
      benchesRes,
      todosRes,
      highCourtBenchesRes,
      commissionerateAuthRes,
    ] = await Promise.all([
      Axios.get(`/case/get-case/${query.id}`, {
        authenticated: true,
        context,
      }),
      Axios.get("/court/get-all-courts?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/organization/get-all-organizations?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/high-court/get-all-high_courts?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/state/get-all-states?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/district/get-all-districts?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-revenue_court?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-tribunal_authority?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-departments?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-lok_adalat?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/client/get-all-clients?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/user/get-all-team-members?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-department_authority?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/comission/get-all-benches?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get("/to-dos/get-all-todos?limit=100", {
        authenticated: true,
        context,
      }),
      Axios.get(`/high-court-benches/get-all?limit=100`, {
        authenticated: true,
        context,
      }),
      Axios.get(`/comission/get-all-comission_rate_authority?limit=100`, {
        authenticated: true,
        context,
      }),
    ]);

    return {
      props: {
        updateCase: caseRes.data.data,
        courts: courtRes.data.data,
        organizations: organizationRes.data.data,
        highCourts: highCourtRes.data.data, // Adjust based on your API response
        states: stateRes.data.data,
        districts: districtRes.data.data,
        revenueCourts: revenueCourtRes.data.data,
        tribunalAuthorities: tribunalAuthorityRes.data.data,
        departments: departmentRes.data.data,
        lokAdalats: lokAdalatRes.data.data,
        clients: clientRes.data.data,
        users: userRes.data.data,
        departmentAthority: departmentAuthorityRes.data.data,
        commissionBenches: benchesRes.data.data,
        allTodos: todosRes.data.data,
        allHighCourtBenches: highCourtBenchesRes.data.data,
        commissionerateAuth: commissionerateAuthRes.data.data,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.message || "Failed to fetch data",
        updateCase: [],
        courts: [],
        organizations: [],
        highCourts: [],
        states: [],
        districts: [],
        revenueCourts: [],
        tribunalAuthorities: [],
        departments: [],
        lokAdalats: [],
        clients: [],
        users: [],
        departmentAthority: [],
        commissionBenches: [],
        allTodos: [],
        allHighCourtBenches: [],
        commissionerateAuth: [],
      },
    };
  }
}

UpdateCase.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default UpdateCase;
