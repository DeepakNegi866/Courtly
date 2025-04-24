import React, { useCallback, useState, useContext, useEffect } from "react";
import Link from "next/link";
import ManagementLayout from "@/layouts/management";
import ReactResponsiveTable from "@/components/super-responsive-table";
import { useRouter } from "next/router";
import Axios from "@/config/axios";
import debounce from "lodash.debounce";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import tableStyle from "@/styles/table-nav.module.css";
import { Add, Export, Filter, Action, Edit, Grow, Trash } from "@/utils/icons";
import Breadcrumb from "@/components/breadcrumb";
import { useSession } from "next-auth/react";
import { render } from "@fullcalendar/core/preact";
import ConvertToAMPM from "@/config/getTimeFormat";
import createExcerpt from "@/config/excerptDescription";
import { AppContext } from "@/components/AppContext/provider";
import { formatDateToReadableString } from "@/utils/common";
import Description from "@/components/readMoreDescription";

const TimeSheet = ({ data }) => {
  const { docs: timeSheet, page, totalPages, limit, totalDocs = 0 } = data;

  const { getAllNotification } = useContext(AppContext);

  // const [timeSheet, setTimeSheet] = useState(timeSheets || []);
  const [timeSheetStatus, setTimeSheetStatus] = useState();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { query } = router;

  if (totalPages < page && totalPages > 0) {
    router.push({
      pathname: router.pathname,
      query: { ...query, page: totalPages },
    });
  }

  // const session = useSession();
  // const role = session?.data?.user?.role || null;
  const columns = [
    {
      title: "Case title",
      key: "caseId",
      render: (value, row) => {
        return <span>{createExcerpt(row?.caseId?.title, 20)}</span>;
      },
    },
    {
      title: "Date",
      key: "date",
      render: (value, row) => {
        return <span>{formatDateToReadableString(value)}</span>;
      },
    },
    {
      title: "Start Time",
      key: "startTime",
      render: (value, row) => {
        return <span>{ConvertToAMPM(value)}</span>;
      },
    },
    {
      title: "End Time",
      key: "endTime",
      render: (value, row) => {
        return <span>{ConvertToAMPM(value)}</span>;
      },
    },
    {
      title: "Description",
      key: "description",
      render: (value, row) => {
        // Check if value is null or undefined before proceeding
        if (!value) {
          return <div className="mb-0">No description available</div>;
        }
        return (
          <div className="mb-0">
            <Description text={value} maxLength={20} />
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
    },
    {
      title: "Actions",
      key: "_id",
      render: (value, row, index) => {
        return (
          <>
            <button
              className="commonButton"
              onClick={() => approvedRejectHnadler(value, "approved")}
              disabled={row.status == "approved" || row.status == "rejected"}
              style={
                row.status === "approved" || row.status === "rejected"
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : { cursor: "pointer" }
              }
            >
              Approve
            </button>
            <button
              className="commonRejectButton btn-secondary m-2"
              onClick={() => approvedRejectHnadler(value, "rejected")}
              disabled={row.status == "rejected" || row.status == "approved"}
              style={
                row.status === "rejected" || row.status === "approved"
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : { cursor: "pointer" }
              }
            >
              Reject
            </button>
          </>
        );
      },
    },
  ];

  const approvedRejectHnadler = async (id, value) => {
    try {
      const payLoad = {
        timesheetId: id,
        status: value,
      };
      setLoading(true);
      await Axios.post("/timesheet/update", payLoad, {
        authenticated: true,
      });
      const newData = [...timeSheet];
      const index =
        timeSheet &&
        Array.isArray(timeSheet) &&
        timeSheet.length > 0 &&
        timeSheet.findIndex((item) => item._id == id);
      newData[index].status = value;
      toast.success("TimeSheet is updated successfully");
      getAllNotification();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // toast.error(error.response.data.message,"An error occured while update TimeSheet")
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Time Sheet", href: "/management/timeSheets" }, // Last item (non-clickable)
  ];

  const handleDeleteAction = async (clientId) => {
    try {
      await Axios.delete(`/client/delete-client/${clientId}`, {
        authenticated: true,
      });
      toast.success("Client is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete client"
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

  // useEffect(() => {
  //   if (timeSheetStatus) {
  //     filterHandler(timeSheetStatus);
  //   } else {
  //     return;
  //   }
  // }, [timeSheetStatus]);

  const filterHandler = async (status) => {
    // try {
    // const res = await Axios.get(`/timesheet/get-all?status=${status}`, {
    //   authenticated: true,
    // });
    router.push({
      pathname: router.pathname,
      query: { ...query, page: 1, status: status },
    });
    // setTimeSheet([...res?.data?.data?.docs]);
    // } catch (error) {
    //   console.error(error);
    // }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container-fluid mt-4">
        <section>
          <div className="row">
            <div className="col-md-12">
              <div className={tableStyle.tableNavHead}>
                <div className={tableStyle.tableNavHeadingWrraper}>
                  <h1 className={tableStyle.tableRunningHeading}>
                    All Time Sheet-({totalDocs})
                  </h1>
                </div>
                <div className={tableStyle.tableNavButtonWrapper}>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    onChange={(e) => filterHandler(e.target.value)}
                    value={timeSheetStatus}
                  >
                    <option value="" hidden>
                      All
                    </option>
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {totalDocs > 0 ? (
            <div className="row mt-4">
              <div className="col-md-12">
                <div className="card table-card">
                  <div className="card-body  p-0 super-responsive-table">
                    <ReactResponsiveTable
                      columns={columns}
                      data={timeSheet}
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
        </section>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const { page = 1, status = null } = query;
    const res = await Axios.get(
      `/timesheet/get-all?page=${page}${status ? `&status=${status}` : ""}`,
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

TimeSheet.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default TimeSheet;
