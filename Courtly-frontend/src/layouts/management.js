import Axios from "@/config/axios";
import managementStyle from "@/styles/management.module.css";
import { formatDateToReadableString } from "@/utils/common";
import {
  Calendar,
  Cases,
  Consultant,
  Dashboard,
  Dropdown,
  Expenses,
  Law,
  NotificationIcon,
  ProfileIcon,
  Search,
  Setting,
  Team,
  Timesheet,
  ToDo,
} from "@/utils/icons";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState, useContext } from "react";
import Marquee from "react-fast-marquee";
import { AppContext } from "@/components/AppContext/provider";

const ManagementLayout = ({ children }) => {
  const session = useSession();
  const role = session?.data?.user?.role || null;
  const userEmail = session?.data?.user?.email || null;
  const [showAll, setShowALl] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const { allNotification, setAllNotification } = useContext(AppContext);
  const router = useRouter();
  const [hearingData, setHearingData] = useState();
 
  useEffect(() => {
    getAllNotification();
  }, []);
  const getAllNotification = async () => {
    try {
      const res = await Axios.get(`/notification/all`, {
        authenticated: true,
      });
      setAllNotification(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const checkActive = (path) => {
    return router.pathname.startsWith(path);
  };

  useEffect(() => {
    getHearingData();
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [router.pathname]);

  const getHearingData = async () => {
    try {
      const response = await Axios.get(`/dashboard/latest-hearing`, {
        authenticated: true,
      });
      const { data } = response.data;
      if (data) {
        const { hearingData: allhearingData } = data;
        setHearingData(
          allhearingData &&
            Array.isArray(allhearingData) &&
            allhearingData.length > 0
            ? [...allhearingData]
            : null
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  const messageHnadler = () => {
    if (showAll) {
      setShowALl(false);
    } else {
      setShowALl(true);
    }
  };

  const handleCheckboxChange = (e) => {
    const notificationId = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      // Add the notificationId to selectedNotifications when checked
      setSelectedNotifications((prev) => [...prev, notificationId]);
    } else {
      // Remove the notificationId from selectedNotifications when unchecked
      setSelectedNotifications((prev) =>
        prev.filter((id) => id !== notificationId)
      );
    }
  };

  const notificationChangeHandler = async (e) => {
    const notificationId = e.target.value;
    const payLoad = {
      notificationId,
    };

    try {
      // Send API request to mark the notification as read
      const res = await Axios.post("/notification/mark-read", payLoad, {
        authenticated: true,
      });

      // Filter out the notification from the list
      const updatedNotifications = allNotification.filter(
        (item) => item._id !== notificationId
      );

      // Update the notifications state with the filtered list
      setAllNotification([...updatedNotifications]);

      // Optionally uncheck the notification if needed
      setSelectedNotifications((prev) =>
        prev.filter((id) => id !== notificationId)
      );
    } catch (error) {
      console.error(error);
    }
  };
  const markedAll = async (e) => {
    const value = e.target.value;
    if (
      !value ||
      (allNotification &&
        Array.isArray(allNotification) &&
        allNotification.length == 0)
    )
      return;
    const notificationId =
      allNotification &&
      Array.isArray(allNotification) &&
      allNotification.map((item) => item._id);
    const payLoad = { notificationId };
    const res = await Axios.post(`/notification/mark-read`, payLoad, {
      authenticated: true,
    });
    setAllNotification([]);
  };

  return (
    <>
      <header>
        <nav
          className={` ${managementStyle.managemnetNavbarMain} navbar navbar-expand-lg bg-body-tertiary`}
        >
          <div className="container-fluid">
            <Link
              className={` ${managementStyle.managementNavLogo} navbar-brand`}
              href="/management/dashboard"
            >
              <img
                src="/assets/images/digicaseLogo.jpeg"
                className="img-fluid"
                alt="DigiKase logo"
              />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="true"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className={` ${managementStyle.managementNavCollap} collapse navbar-collapse`}
              id="navbarNav"
            >
              <ul
                className={` ${managementStyle.managementNavbarListWrapper} navbar-nav`}
              >
                <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Dashboard />
                    </span>
                    Dashboard
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu dropdown-menu-hover `}
                  >
                    {role && role != "super-admin" && (
                      <li>
                        <Link
                          className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                          href="/management/dashboard/user"
                        >
                          Dashboard
                        </Link>
                      </li>
                    )}
                    {role && role == "super-admin" && (
                      <>
                        <li>
                          <Link
                            className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                            href="/management/case-configurations/high_courts"
                          >
                            Configuration
                          </Link>
                        </li>
                      </>
                    )}
                    {role && role == "super-admin" && (
                      <>
                        <hr className="dropdown-divider" />
                        <li>
                          <Link
                            className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                            href="/management/organizations"
                          >
                            Organizations
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Cases />
                    </span>
                    Cases
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu`}
                  >
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/management/cases"
                      >
                        All Cases
                      </Link>
                    </li>
                    <hr className="dropdown-divider" />
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/management/cases/add-new"
                      >
                        Add New Case
                      </Link>
                    </li>
                  </ul>
                </li>
                {/* <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Consultant />
                    </span>
                    Consultant
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu`}
                  >
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/"
                      >
                        Add External Consultant
                      </Link>
                    </li>
                  </ul>
                </li> */}
                <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Consultant />
                    </span>
                    Client
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu`}
                  >
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/management/clients"
                      >
                        All Clients
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/management/clients/add-new"
                      >
                        Add Client
                      </Link>
                    </li>
                  </ul>
                </li>
                {/* <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Advocate />
                    </span>
                    Advocate
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu`}
                  >
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/"
                      >
                        Add Advocate
                      </Link>
                    </li>
                  </ul>
                </li> */}
                <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Team />
                    </span>
                    Team
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu`}
                  >
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/management/team_members"
                      >
                        All Members
                      </Link>
                    </li>
                    {role && role != "team-member" && (
                      <li>
                        <Link
                          className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                          href="/management/team_members/add-new"
                        >
                          Add Member
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Calendar />
                    </span>
                    Calendar
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu`}
                  >
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/management/calendar"
                      >
                        Full Calendar
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-current="page"
                    href="/management/dashboard"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <ToDo />
                    </span>
                    To Dos
                    <span
                      className={managementStyle.managementNavIconsDropdown}
                    >
                      <Dropdown />
                    </span>
                  </Link>
                  <ul
                    className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu`}
                  >
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/management/todos"
                      >
                        All To-Dos
                      </Link>
                    </li>

                    {/* <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/"
                      >
                        Upcoming To-Dos
                      </Link>
                    </li>
                    <hr className="dropdown-divider" />
                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/"
                      >
                        Pending To-Dos
                      </Link>
                    </li>

                    <hr className="dropdown-divider" />

                    <li>
                      <Link
                        className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        href="/"
                      >
                        Completed To-Dos
                      </Link>
                    </li> */}
                  </ul>
                </li>
                <li className="nav-item">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link`}
                    href="/management/expenses"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Expenses />
                    </span>
                    Expenses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={` ${managementStyle.managementHeaderLinks} nav-link`}
                    href="/management/timesheet"
                  >
                    <span className={managementStyle.managementNavIcons}>
                      <Timesheet />
                    </span>
                    Timesheet
                  </Link>
                </li>
              </ul>
              <div className="d-flex" role="search">
                {/* <form
                  className={` ${managementStyle.managementNavSearch} d-flex`}
                  role="search"
                >
                  <input
                    className={` ${managementStyle.managementSearchInput} form-control me-2`}
                    placeholder="Search here"
                    aria-label="Search"
                  />
                  <span className={managementStyle.managementSearch}>
                    <Search />
                  </span>
                </form> */}
                <ul
                  className={`d-flex p-0 mt-3 ${managementStyle.managementProfileDropdown}`}
                >
                  <li
                    className={` ${managementStyle.managementList} ${managementStyle.managementProfileList} nav-item dropdown`}
                  >
                    <Link
                      className={` ${managementStyle.managementHeaderLinks} nav-link dropdown-toggle`}
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      aria-current="page"
                      href="/management/dashboard"
                    >
                      <ProfileIcon />
                      <span>
                        {" "}
                        <Dropdown />
                      </span>
                    </Link>
                    <ul
                      className={` ${managementStyle.managementNavDropdownMenu} dropdown-menu dropdown-menu-end`}
                    >
                      <li className="nav-item">
                        <span
                          className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        >
                          {userEmail || ""}{" "}
                        </span>
                      </li>
                      <li className="nav-item">
                        <Link
                          className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                          href="/management/team_members/profile"
                        >
                          Profile
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                          href="/management/team_members/change-password"
                        >
                          Change Password
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                          href="/management/timesheet"
                        >
                          Time Sheet
                        </Link>
                      </li>
                      <li className="nav-item" onClick={() => signOut()}>
                        <button
                          className={` ${managementStyle.managementNavDropdown} dropdown-item`}
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </li>
                  <li
                    className={managementStyle.managementList}
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasRight"
                    aria-controls="offcanvasRight"
                  >
                    <NotificationIcon />
                    <span
                      style={{
                        
                        position: "absolute",
                        top: "-5px",
                       
                      }}
                    >
                      {allNotification &&
                        allNotification.length > 0 &&
                        allNotification.length}
                    </span>
                  </li>
                  {/* <li className={managementStyle.managementList}>
                    <Setting />
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <div className="container-fluid mt-2">
        <div className="row common-dark-bg align-items-center">
          <div className={managementStyle.managementHearingDate}>
            <Law width="30" height="30" />
            <span className={managementStyle.managemnetNextText}>
              Next Hearing Date
            </span>
          </div>
          <div className={managementStyle.managementMarqueee}>
            <Marquee>
              {hearingData &&
                Array.isArray(hearingData) &&
                hearingData.length > 0 &&
                hearingData.map((item, index) => {
                  if (index > 2) return;
                  return (
                    <>
                      <span
                        className={`${managementStyle.managementDateText} ms-5`}
                      >
                        | {formatDateToReadableString(item.hearingDate)}:
                      </span>
                      <span className={managementStyle.managementAssistantPara}>
                        {" "}
                        {item.caseId.title}
                      </span>
                      <span
                        className={`${managementStyle.managementDateText} ms-3`}
                        key={index}
                      >
                        Client Name :
                      </span>
                      <span className={managementStyle.managementAssistantPara}>
                        {" "}
                        {item?.caseId?.yourClientId?.fullName} |
                      </span>
                    </>
                  );
                })}
            </Marquee>
          </div>
        </div>
      </div>
      <div className={`${managementStyle.layoutWrapper} container-fluid`}>
        {children}
      </div>
      {/* Off canvas for notification */}
      {/* <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">Toggle right offcanvas</button> */}

      <div
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div
          class="offcanvas-header"
          style={{ background: "#1d0093", color: "#fff" }}
        >
          <h5 class="offcanvas-title" id="offcanvasRightLabel">
            Notifications
          </h5>
          <button
            type="button"
            style={{ color: "#ffff" }}
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        {/* <hr></hr> */}
        <div
          className="d-flex justify-content-between p-3"
          style={{ fontSize: "12px" }}
        >
          <div>
            <span type="button" style={{ color: "#1d0093", fontWeight: "600" }}>
              All Notifications
            </span>
          </div>
          <div className="d-flex justify-content-center">
            <span type="button" style={{ color: "#1d0093", fontWeight: "600" }}>
              Mark all read
            </span>
            <input
              type="checkbox"
              value="all"
              className="ms-2"
              onChange={(e) => markedAll(e)}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Mark all read"
            />
          </div>
        </div>
        <hr className="mt-0"></hr>
        <div className="offcanvas-body pt-1 p-4">
          {allNotification &&
            Array.isArray(allNotification) &&
            allNotification.length > 0 &&
            allNotification.map((item) => {
              return (
                <div key={item._id}>
                  <label>{item.description}</label>
                  <label
                    className="mt-2"
                    style={{ color: "#1d0093", fontWeight: "600" }}
                  >
                    Mark as read
                  </label>
                  <input
                    type="checkbox"
                    className="ms-2"
                    value={item._id}
                    checked={selectedNotifications.includes(item._id)} // Check if the notification is selected
                    onChange={(e) => {
                      handleCheckboxChange(e); // Update the checkbox state
                      notificationChangeHandler(e); // Mark the notification as read
                    }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Mark as read"
                  />
                  <hr />
                </div>
              );
            })}
        </div>
      </div>
      <footer className={managementStyle.managementFooterHead}>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className={managementStyle.managementFooterWrapper}>
                <ul className={managementStyle.managementFooterListWrapper}>
                  <li className={managementStyle.managementFooterListFirst}>
                    <Link href={"dashboard"}> Dashboard </Link>
                    <span className="ms-2">|</span>
                  </li>
                  <li className={managementStyle.managementFooterListFirst}>
                    {" "}
                    <Link href={"/management/cases"}>Cases </Link>{" "}
                    <span className="ms-2">|</span>
                  </li>
                  <li className={managementStyle.managementFooterListFirst}>
                    <Link href={"/management/team_members"}>Team </Link>{" "}
                    <span className="ms-2">|</span>
                  </li>
                  {/* <li className={managementStyle.managementFooterListFirst}>
                    {" "}
                    <Link href={"/management/"}>Groups </Link>{" "}
                    <span className="ms-2">|</span>
                  </li> */}
                  <li className={managementStyle.managementFooterListFirst}>
                    <Link href={"/management/clients"}>Clients </Link>{" "}
                    <span className="ms-2">|</span>
                  </li>
                  <li className={managementStyle.managementFooterListFirst}>
                    {" "}
                    <Link href={"/management/calendar"}>Calender</Link>{" "}
                    <span className="ms-2"> |</span>
                  </li>
                  <li className={managementStyle.managementFooterListFirst}>
                    {" "}
                    <Link href={"/management/todos"}>To-Dos </Link>{" "}
                    <span className="ms-2">|</span>
                  </li>
                  {/* <li className={managementStyle.managementFooterListFirst}>
                    Documents <span className="ms-2">|</span>
                  </li> */}
                  <li className={managementStyle.managementFooterListFirst}>
                    <Link href={'/faq'}>FAQs</Link>
                    <span className="ms-2">|</span>
                  </li>
                  {/* <li className={managementStyle.managementFooterListFirst}>
                    Contact Us
                  </li> */}
                </ul>
              </div>
            </div>
            <div className="col-md-12">
              <div className={managementStyle.managementFooterWrapper}>
                <ul className={managementStyle.managementFooterListWrapper}>
                  {/* <li>
                    Disclaimer <span className="ms-2">|</span>
                  </li> */}
                  <li className={managementStyle.managementFooterListFirst}>
                    <Link href={"/privacy-policy"}>Privacy Policy </Link><span className="ms-2">|</span>
                  </li>
                  <li className={managementStyle.managementFooterListFirst}>
                    <Link href={"/terms-condition"}>Terms & Conditions</Link> <span className="ms-2">|</span>
                  </li>
                </ul>
                <span className={managementStyle.managementFooterCopyright}>
                  © Copyright Digicase, 2024. All Rights Reserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ManagementLayout;
