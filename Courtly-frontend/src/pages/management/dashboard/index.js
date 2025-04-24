import React, { useState, useRef } from "react";
import Breadcrumb from "@/components/breadcrumb";
import ManagementLayout from "@/layouts/management";
import style from "@/styles/admindashboard.module.css";
import { useRouter } from "next/router";
import {
  Circlecheck,
  Documentfill,
  Groupimage,
  InvoiceImage,
  LawImage,
  Recentcases,
  Shiftpending,
  TeamMember,
  Userimage,
  Vector,
} from "@/utils/icons";
import FullCalendar from "@fullcalendar/react";
import Axios from "@/config/axios";
import createExcerpt from "@/config/excerptDescription";
import { formatDateToReadableString, formatTimeToIST } from "@/utils/common";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Link from "next/link";
import { useSession } from "next-auth/react";

function renderEventContent(eventInfo) {
  return (
    <div
      className="px-2 text-white rounded "
      style={{
        backgroundColor: eventInfo.backgroundColor ?? "blue",
        textTransform: "lowercase",
        fontSize: "12px",
        cursor: "pointer",
      }}
    >
      <i>{createExcerpt(eventInfo.event.title, 10)}</i>
    </div>
  );
}

const Admindashboard = ({ data }) => {
  const router = useRouter();
  const session = useSession();
  const role = session?.data?.user?.role || null;
  const {
    latestCase,
    activities,
    calenderData,
    nearestHearing,
    todosCounts,
    totalCaseDocumentsUpload = 0,
    totalClients = 0,
    totalUsers = 0,
    case: caseData,
    upcomingTodos,
  } = data;

  const {
    totalCases,
    status: caseStatus,
    criticalCases,
    normalCases,
    supercriticalCases,
  } = caseData;
  const {
    open: openCases,
    closed: closedCases,
    archived: archivedCases,
    dueDate: pendingCases,
  } = caseStatus;

  const supercriticalCasesCount =
    supercriticalCases && Array.isArray(supercriticalCases)
      ? supercriticalCases.length
      : 0;
  const criticalCasesCount =
    criticalCases && Array.isArray(criticalCases) ? criticalCases.length : 0;
  const normalCasesCount =
    normalCases && Array.isArray(normalCases) ? normalCases.length : 0;

  const criticalPercentage =
    totalCases === 0 ? 0 : (criticalCasesCount / totalCases) * 100;
  const superCriticalPercentage =
    totalCases === 0 ? 0 : (supercriticalCasesCount / totalCases) * 100;
  const normalPercentage =
    totalCases === 0 ? 0 : (normalCasesCount / totalCases) * 100;
  const [hearings, setHearings] = useState(calenderData?.hearings || []);
  const [todo, setTodo] = useState(
    calenderData?.todos &&
      Array.isArray(calenderData?.todos) &&
      calenderData?.todos.length > 0
      ? calenderData?.todos.filter((item) => item.status == !"close")
      : []
  );
  const [currentHearing, setCurrentHearing] = useState();

  const openModal = useRef(null);
  const closeModal = useRef(null);

  const calendarEvents =
    hearings && hearings && Array.isArray(hearings)
      ? hearings.map((item) => ({
          title: item?.caseId?.title,
          start: new Date(item?.hearingDate),
          backgroundColor:
            item.session === "morning"
              ? "#E0BF00"
              : item.session === "evening"
              ? "#9C00C3"
              : "#AAAAAA", // Default to grey for other sessions
          borderColor:
            item.session === "morning"
              ? "#E0BF00"
              : item.session === "evening"
              ? "#9C00C3"
              : "#AAAAAA",
          eventType: "hearingDate",
          item: { ...item },
        }))
      : [];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "" },
  ];

  const handleDatesSet = async (info) => {
    try {
      if (!info) return;
      const date = info?.startStr.split("T")[0];
      const res = await Axios.get(`/calender/get?date=${date}`, {
        authenticated: true,
      });
      if (res.data.data.hearings) {
        setHearings([...res.data.data.hearings]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateClick = () => {
    router.replace("/management/calendar");
  };

  const handleEventClick = (info) => {
    const { extendedProps } = info.event._def;

    const eventTitle = extendedProps.eventType;
    if (eventTitle == "hearingDate") {
      setCurrentHearing({ ...extendedProps.item });
      openModal.current.click();
    }
  };

  return (
    <>
      <section className={style.dashBoardpanelmainesection}>
        <Breadcrumb items={breadcrumbItems} />
        <div className={style.dashboardPanel}>
          <div className="row">
            <div className="col-md-9">
              <div className={`row ${style.admindashboradTopsection}`}>
                <div className="col-md-6 mb-3">
                  <Link
                    href={`${
                      role && role != "super-admin"
                        ? "/management/dashboard/user"
                        : "/management/cases"
                    }`}
                    className="text-decoration-none"
                  >
                    <div className={` ${style.progressBarsection}`}>
                      <div className={style.totalCasebarsection}>
                        <p className={style.totelCaseheading}>
                          Total <br /> Active cases
                        </p>
                        <p className={style.commonNumber}>{totalCases}</p>
                      </div>

                      <div className={style.progrssBar}>
                        <div
                          className={style.progrssbarSupercritical}
                          style={{ width: superCriticalPercentage + "%" }}
                        ></div>
                        <div
                          className={style.progrssbarCritical}
                          style={{ width: criticalPercentage + "%" }}
                        ></div>
                        <div
                          className={style.progrssbarImportantcasesgreen}
                          style={{ width: normalPercentage + "%" }}
                        ></div>
                      </div>

                      <div className={style.progressbarDatasection}>
                        <div className="row">
                          <div className="col-md-4">
                            <div className={style.commonprogressbarSection}>
                              <div className={style.supercriticalRedbox}></div>
                              <p className={style.commonprogressbarlData}>
                                <span>
                                  {supercriticalCases &&
                                  Array.isArray(supercriticalCases)
                                    ? supercriticalCases.length
                                    : 0}
                                </span>{" "}
                                Super Critical
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className={style.commonprogressbarSection}>
                              <div
                                className={style.importantCasesyellowBox}
                              ></div>
                              <p className={style.commonprogressbarlData}>
                                <span>
                                  {criticalCases && Array.isArray(criticalCases)
                                    ? criticalCases.length
                                    : 0}
                                </span>{" "}
                                Critical Cases
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className={style.commonprogressbarSection}>
                              <div
                                className={style.importantCasesgreenBox}
                              ></div>
                              <p className={style.commonprogressbarlData}>
                                <span>
                                  {normalCases && Array.isArray(normalCases)
                                    ? normalCases.length
                                    : 0}
                                </span>{" "}
                                Normal Cases
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`d-flex ${style.progressBardata} pt-4`}>
                        <p className={style.progressBarfield}>
                          Archived case{" "}
                          <span className={style.progresslivecaseNumber}>
                            : {archivedCases}
                          </span>
                        </p>
                        <p className={style.progressBarfield}>
                          Closed Cases{" "}
                          <span className={style.progresslivecaseNumber}>
                            : {closedCases}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="col-md-3 p-lg-0 mb-3">
                  <div className={style.hearingDatesection}>
                    <div className={style.hearingHeadingsection}>
                      <h2 className={style.hearingHeading}>
                        Upcoming <br /> Hearing Date{" "}
                      </h2>
                      <LawImage />
                    </div>
                    {nearestHearing &&
                      Array.isArray(nearestHearing) &&
                      nearestHearing.length > 0 &&
                      nearestHearing[0].hearingDate && (
                        <>
                          <p className={style.hearingDate}>
                            {formatDateToReadableString(
                              nearestHearing[0]?.hearingDate
                            )}
                          </p>
                          <p className={style.dashboardCommonpara}>
                            {" "}
                            {nearestHearing[0]?.caseId?.title}
                          </p>
                        </>
                      )}

                    {/* <button
                      className={`commonButton ${style.admincommonButton}`}
                    >
                      View All
                    </button> */}
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className={style.documentSection}>
                    <h2 className={style.documentHeading}>Documents</h2>
                    <div className={style.totaldocumentNumbers}>
                      <Documentfill />

                      <p className={` mt-0 ${style.commonNumber}`}>
                        {totalCaseDocumentsUpload}
                      </p>
                    </div>
                    {/* <button
                      className={`commonButton ${style.admincommonButton}`}
                    >
                      View All
                    </button> */}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className={` ${style.recentCaseactivities} h-100`}>
                    <div className={`d-flex ${style.recentCasedata}`}>
                      <div>
                        <p className={style.recentCaseheading}>
                          Recent Case Activities
                        </p>
                        {activities &&
                          Array.isArray(activities) &&
                          activities.length > 0 && (
                            <div className={style.recentinfouppersection}>
                              <p className={style.recentCaseactivitiesdate}>
                                {formatDateToReadableString(
                                  activities[0].createdAt
                                )}{" "}
                                {formatTimeToIST(activities[0].createdAt)}
                              </p>
                              {activities[0].addedBy?.firstName && (
                                <p className={style.recentCaseactivitiesonwer}>
                                  By:
                                  <span
                                    className={`text-capitalize ${style.recentCasesecondsectiondata}`}
                                  >
                                    {" "}
                                    {activities[0].addedBy?.firstName}{" "}
                                    {activities[0].addedBy?.lastName}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                      <div>
                        <Recentcases />
                      </div>
                    </div>
                    {activities &&
                      Array.isArray(activities) &&
                      activities.length > 0 &&
                      activities[0].caseId &&
                      activities[0].caseId.title && (
                        <>
                          <span className={style.caseactivitiesHeading}>
                            Case
                          </span>

                          <p
                            className={`text-uppercase ${style.dashboardRecentcasepara}`}
                          >
                            {activities[0].caseId.title}
                          </p>
                          <div className={style.recentCaseactivitiesinfo}>
                            <p
                              className={
                                style.recentCaseactivitiessecondsection
                              }
                            >
                              Due Date:{" "}
                              <span
                                className={style.recentCasesecondsectiondata}
                              >
                                {activities[0].caseId.dueDate &&
                                  formatDateToReadableString(
                                    activities[0].caseId.dueDate
                                  )}
                              </span>
                            </p>
                            <p
                              className={
                                style.recentCaseactivitiessecondsection
                              }
                            >
                              Status:
                              <span
                                className={`text-capitalize ${style.recentCasesecondsectiondata}`}
                              >
                                {" "}
                                {activities[0]?.caseId?.status || ""}
                              </span>
                            </p>
                            {/* <p className={style.recentCaseactivitiessecondsection}>
                        Added Comment:{" "}
                        <span className={style.recentCasesecondsectiondata}>
                          Comment
                        </span>
                      </p> */}
                          </div>
                        </>
                      )}
                    {/* <button className="commonButton">View All</button> */}
                  </div>
                </div>
                <div className="col-md-3 p-lg-0 mb-3">
                  <div className={style.clientSection}>
                    <h2 className={style.documentHeading}>Clients</h2>
                    <div className={style.totalClientdocumentNumbers}>
                      <Userimage />
                      <p className={` mt-0 ${style.commonNumber}`}>
                        {totalClients}
                      </p>
                    </div>
                    {/* <button
                      className={`commonButton ${style.admincommonButton}`}
                    >
                      View All
                    </button> */}
                    <Link
                      href="/management/clients"
                      className={`commonButton pt-2 ps-4 ${style.admincommonButton}`}
                      type="button"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className={style.todoSection}>
                    <div className={style.todoHeadingsection}>
                      <h2 className={style.hearingHeading}>To-Dos</h2>
                      <Vector />
                    </div>

                    <div className={style.todosinnerData}>
                      <div className={style.todoPendingsection}>
                        <Shiftpending />
                        <p className={style.todoparaSection}>
                          Pending <span> {todosCounts?.pending || 0}</span>
                        </p>
                      </div>
                      <div className={style.todoUpcomingsection}>
                        <Groupimage />

                        <p className={style.todoUpcomingPara}>
                          Upcoming<span> {todosCounts?.upcoming || 0}</span>
                        </p>
                      </div>
                      <div className={style.todoCompleteSection}>
                        <Circlecheck />
                        <p className={style.todoCompletedpara}>
                          Completed<span> {todosCounts?.completed || 0}</span>
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/management/todos"
                      className={`commonButton pt-2 ps-4 ${style.admintodosButton}`}
                      type="button"
                    >
                      View All
                    </Link>
                    {/* <button
                      className={`commonButton ${style.admintodosButton}`}
                    >
                      View All
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className={style.teamMemberinvocesection}>
                <div className={style.teamMembersection}>
                  <p className={style.teamMemberheading}>All Users</p>
                  <div className={style.teamMemberinnersection}>
                    <TeamMember />
                    <p className={style.teamMembernumber}>{totalUsers}</p>
                  </div>
                  <Link
                    href="/management/team_members"
                    className="commonButton pt-2"
                    type="button"
                  >
                    View All
                  </Link>
                </div>
                <hr className={style.teamMemberinnerlLine} />
                <div className={style.invoiceSection}>
                  <p className={style.teamMemberheading}>Invoices</p>
                  <div className={style.invoiceinnerSection}>
                    <InvoiceImage />
                    <p className={style.teamMembernumber}>00</p>
                  </div>
                  {/* <button className="commonButton">View All</button> */}
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className={`col-md-9 ${style.calendarView}`}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                events={calendarEvents}
                dayMaxEvents={1}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                height={450}
                className="main-calender"
                headerToolbar={{
                  left: "prev",
                  center: "title",
                  right: "next",
                }}
                dateClick={handleDateClick}
                datesSet={handleDatesSet}
              />
            </div>
            <div className={`col-md-3 ${style.todoouterSection} `}>
              <div className={style.upcomingTodosSection}>
                <div className={style.TodosinnerSection}>
                  <p className={style.upcomingtodoHeading}>
                    Upcoming <br />
                    To-Dos
                  </p>
                  <Vector />
                </div>
                <div className={style.upcomingtodoData}>
                  {upcomingTodos &&
                    Array.isArray(upcomingTodos) &&
                    upcomingTodos.map((item, ind) => {
                      if (ind > 2) return;
                      return (
                        <>
                          <p key={ind} className={style.upcomingtodoDate}>
                            {formatDateToReadableString(item.endDateTime)}
                          </p>
                          <span className={style.upcomingtodoTime}>
                            {formatTimeToIST(item.endDateTime)}
                          </span>
                          <p
                            className={style.upcomingtodoAddress}
                            dangerouslySetInnerHTML={{
                              __html: item?.description || "",
                            }}
                          ></p>
                        </>
                      );
                    })}
                  <Link
                    href="/management/todos?filter=upcoming"
                    className={`commonButton pt-2 ps-4`}
                    type="button"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/*  */}

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
                <div className={style.modalHeader}>
                  <h1
                    className={`modal-title ${style.modalTitle}`}
                    id="staticBackdropLabel"
                  >
                    Hearing Data
                  </h1>
                  <button
                    type="button"
                    className={`btn ${style.modalButtn}`}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    ref={closeModal}
                  >
                    X
                  </button>
                </div>
                <hr />

                <div className={`p-4 ${style.tabsWrapper}`}>
                  <div>
                    <div className="row mb-2">
                      <div className="col-md-6">Title</div>
                      <div className="col-md-6">
                        {currentHearing?.caseId?.title}
                      </div>
                    </div>

                    <div className="row mb-2">
                      <div className="col-md-6">Hearing Date</div>
                      <div className="col-md-6">
                        {formatDateToReadableString(
                          currentHearing?.hearingDate
                        )}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-6">Session</div>
                      <div className="col-md-6">{currentHearing?.session}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-6">Status</div>
                      <div className="col-md-6">
                        {currentHearing?.caseId?.status &&
                        currentHearing?.caseId?.status == "open"
                          ? "Pending"
                          : currentHearing?.caseId?.status}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-6">Description</div>
                      <div
                        className="col-md-6"
                        dangerouslySetInnerHTML={{
                          __html: currentHearing?.description,
                        }}
                      ></div>
                    </div>
                    <div className="row">
                      <div className="d-flex justify-content-end gap-3 mt-3">
                        <div>
                          {" "}
                          <button
                            type="submit"
                            className="commonButton"
                            onClick={() => {
                              router.push(
                                `/management/cases/${currentHearing?.caseId?._id}`
                              );
                              closeModal.current.click();
                            }}
                          >
                            view
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*  */}
        </div>
      </section>
      {/* {latestCase && Array.isArray(latestCase) && latestCase.length > 0 && (
        <section className={style.DashboardtableSection}>
          <div className="row">
            <div className="col-md-12">
              <table
                className={`table table-bordered ${style.dashboradTabledata}`}
              >
                <thead className={style.tableTheadsection}>
                  <tr>
                    <th className={style.tableHeading}>#File</th>
                    <th className={style.tableHeading}>Title</th>
                    <th className={style.tableHeading}>Case Type </th>
                    <th className={style.tableHeading}>Case Description </th>
                    <th className={style.tableHeading}>Case Number </th>
                  </tr>
                </thead>
                <tbody>
                  {latestCase.map((item, index) => {
                    return (
                      <>
                        <tr className={style.tableinnerData} key={index}>
                          <td
                            className={`justify-content-center ${style.tableUsersection}`}
                          >
                            {index + 1}
                          </td>
                          <td className={style.tableuserinnerData}>
                            <p>{item?.title}</p>
                          </td>
                          <td className={style.tableuserinnerData}>
                            {item?.caseType}
                          </td>
                          <td className={style.tableuserinnerData}>
                            {item?.description}
                          </td>
                          <td className={style.tableuserinnerData}>
                            {item?.caseNumber}
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )} */}
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const response = await Axios.get(`/dashboard/dashboard-data`, {
      authenticated: true,
      context,
    });

    return { props: { data: response.data.data } };
  } catch (error) {
    return {
      redirect: {
        destination: "/403",
        permanent: false,
      },
    };
  }
}

Admindashboard.getLayout = (page) => (
  <ManagementLayout>{page}</ManagementLayout>
);

export default Admindashboard;
