import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import ManagementLayout from "@/layouts/management";
import ReactResponsiveTable from "@/components/super-responsive-table";
import { useRouter } from "next/router";
import Axios from "@/config/axios";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import tableStyle from "@/styles/table-nav.module.css";
import {
  Add,
  Export,
  Filter,
  Eyeicon,
  Edit,
  Action,
  Grow,
  Trash,
} from "@/utils/icons";
import Breadcrumb from "@/components/breadcrumb";
import { render } from "@fullcalendar/core/preact";
import { formatDateToReadableString } from "@/utils/common";
import { useSession } from "next-auth/react";
import createExcerpt from "@/config/excerptDescription";
import { useParams } from "next/navigation";

const Cases = ({ data }) => {
  const { docs: Cases, page, totalPages, limit, totalDocs = 0 } = data;
  const router = useRouter();
  const { query } = router;
  const { progress } = query;
  const allCases = useMemo(
    () =>
      !progress && Cases && Array.isArray(Cases) && Cases.length > 0
        ? Cases.filter((item) => item.status != "close")
        : [...Cases],
    [data]
  );

  const [loading, setLoading] = useState(false);
  if (totalPages < page && totalPages > 0) {
    router.push({
      pathname: router.pathname,
      query: { ...query, page: totalPages },
    });
  }
  const [searchQuery, setSearchQuery] = useState("");
  const session = useSession();
  const role = session?.data?.user?.role || null;

  const columns = [
    {
      title: "Title",
      key: "title",
      render: (value, record) => (
        <Link
          className="text-body text-decoration-none"
          href={`${router.pathname}/${record?._id}`}
          passHref
        >
          <span>{createExcerpt(value, 20)}</span>
        </Link>
      ),
    },
    {
      title: "Client Name",
      key: "yourClient",
      render: (value, row) => {
        return <span>{row?.yourClient?.fullName}</span>;
      },
    },
    {
      title: "Client Nick Name",
      key: "yourClient",
      render: (value, row) => {
        return <span>{row?.yourClient?.nickName}</span>;
      },
    },
    {
      title: "Created By",
      key: "addedByUser",
      render: (value, row) => {
        return (
          <span>{`${
            row?.addedByUser?.firstName ? row?.addedByUser?.firstName : ""
          } ${
            row?.addedByUser?.lastName ? row?.addedByUser?.lastName : ""
          }`}</span>
        );
      },
    },
    {
      title: "Date Of Hearing",
      key: "hearingDate",

      render: (value, row) => {
        if (!value) return;
        return <span>{formatDateToReadableString(value)}</span>;
      },
    },
    {
      title: "Case Description",
      key: "description",
      render: (value, row) => {
        return <span>{createExcerpt(value, 20)}</span>;
      },
    },
    {
      title: "CGST/SGST",
      key: "subDepartment",
    },
    {
      title: "Financial Year",
      key: "financialYear",
      render: (value, row) => {
        return (
          <span className="ms-1">
            {Array.isArray(value)
              ? value.map((year, index) => <div key={index}>{year}</div>)
              : value}
          </span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (value, row) => {
        return (
          <select
            onChange={(e) => caseStatusHandler(e, row?._id)}
            className="form-select"
          >
            <option value="" hidden>
              {value === "open"
                ? "Pending"
                : value === "archive"
                ? "Archive"
                : value === "close"
                ? "Close"
                : "Close"}
            </option>
            <option
              value="open"
              selected={value === "open"}
              disabled={role === "accountant"}
            >
              Pending
            </option>
            <option
              value="archive"
              selected={value === "archive"}
              disabled={role === "accountant"}
            >
              Archive
            </option>
            <option
              value="close"
              selected={value === "close"}
              disabled={role === "accountant"}
            >
              Close
            </option>
          </select>
        );
      },
    },
    // Conditionally include the "Actions" column
    ...(progress && progress == "archive"
      ? [
          {
            title: "Actions",
            key: "_id",
            render: (value, row, index) => {
              return (
                <>
                  <Link
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="View"
                    className="btn ps-0"
                    href={`${router.pathname}/${value}`}
                  >
                    <Eyeicon />
                  </Link>
                  {role && role !== "accountant" && (
                    <Link
                      className="btn ps-0"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Edit"
                      href={`${router.pathname}/update_cases/${value}`}
                    >
                      <span>
                        <Edit />
                      </span>
                    </Link>
                  )}
                  {role && role !== "accountant" && (
                    <button
                      className="btn"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Delete"
                      hidden={role && role === "team-member"}
                      onClick={() => handleDeleteAction(value)}
                    >
                      <span>
                        <Trash />
                      </span>
                    </button>
                  )}
                </>
              );
            },
          },
        ]
      : progress && progress == "close"
      ? []
      : [
          {
            title: "Actions",
            key: "_id",
            render: (value, row, index) => {
              return (
                <>
                  <Link
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="View"
                    className="btn ps-0"
                    href={`${router.pathname}/${value}`}
                  >
                    <Eyeicon />
                  </Link>
                  {role && role !== "accountant" && (
                    <Link
                      className="btn ps-0"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Edit"
                      href={`${router.pathname}/update_cases/${value}`}
                    >
                      <span>
                        <Edit />
                      </span>
                    </Link>
                  )}
                  {role && role !== "accountant" && (
                    <button
                      className="btn ps-0"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Delete"
                      hidden={role && role === "team-member"}
                      onClick={() => handleDeleteAction(value)}
                    >
                      <span>
                        <Trash />
                      </span>
                    </button>
                  )}
                </>
              );
            },
          },
        ]),
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cases", href: "/management/cases" }, // Last item (non-clickable)
  ];

  const handleDeleteAction = async (caseId) => {
    try {
      await Axios.delete(`/case/delete-case/${caseId}`, {
        authenticated: true,
      });
      toast.success("Case is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete case"
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update search query as user types
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

  const progressFilter = useMemo(() => {
    return progress && progress !== "all"
      ? progress == "normal"
        ? "normal"
        : progress == "critical"
        ? "critical"
        : progress == "super-critical"
        ? "super-critical"
        : progress == "archive"
        ? "archive"
        : progress == "close"
        ? "close"
        : "all"
      : "all";
  }, [query]);

  const handleFilterChange = (e) => {
    const filterValue = e.target.value;

    if (progressFilter == filterValue) return null;
    return router.push({
      pathname: router.pathname,
      query: { ...query, page: 1, progress: filterValue },
    });
  };

  const handleDownloadExcel = async () => {
    try {
      if (loading) return null;
      setLoading(true);
      const response = await Axios.get(
        `/case/download-excel?progress=${progressFilter}`,
        { authenticated: true, responseType: "blob" }
      );

      // Create a blob from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "case-data.xlsx"); // Filename for the downloaded file
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    } finally {
      setLoading(false);
    }
  };

  const caseStatusHandler = async (e, caseId) => {
    const status = e.target.value;
    try {
      const payLoad = {
        caseId: caseId,
        status: status,
      };
      const res = await Axios.post("/case/update-case", payLoad, {
        authenticated: true,
      });
      toast.success("Case Status is updated successfully");
      return router.push({ pathname: router.pathname });
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCases = useMemo(() => {
    if (!searchQuery) return allCases; // If no search query, return all cases

    return allCases.filter(
      (caseItem) =>
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem?.yourClient?.fullName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        caseItem?.yourClient?.nickName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allCases]);

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
                    All{" "}
                    {progress && progress !== "all"
                      ? progress == "normal"
                        ? "Normal"
                        : progress == "critical"
                        ? "Critical"
                        : progress == "super-critical"
                        ? "Super Critical"
                        : ""
                      : ""}{" "}
                    Cases-({totalDocs})
                  </h1>
                </div>
                <div className={tableStyle.tableNavButtonWrapper}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {role && role != "accountant" && (
                    <Link
                      href="/management/cases/add-new"
                      className={`${tableStyle.tableButton} btn text-nowrap`}
                    >
                      <span className="me-2">
                        <Add />
                      </span>
                      <span>Add New</span>
                    </Link>
                  )}
                  <select
                    className="form-select form-area w-100"
                    aria-label="Default select example"
                    value={progressFilter}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Cases</option>
                    <option value="super-critical">Super Critical</option>
                    <option value="critical">critical</option>
                    <option value="normal">Normal</option>
                    <option value="archive">Archived</option>
                    <option value="close">Closed</option>
                  </select>

                  <button
                    type="button"
                    className={`${tableStyle.tableButton} btn`}
                    onClick={handleDownloadExcel}
                  >
                    <span className="me-2">
                      <Export />
                    </span>
                    Export
                  </button>
                  {/* <button className={`${tableStyle.tableButton} btn`}>
                                  <span className="me-2">
                                    <Filter />
                                  </span>
                                  Filter
                                </button> */}
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
                      data={filteredCases}
                      serialize={true}
                      initialCount={limit * (page - 1)}
                      className={progressFilter == "all" ? "" : progressFilter}
                    />
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
    const { page = 1, progress = "all" } = query;
    const res = await Axios.get(
      `/case/get-all-cases?page=${page}&progress=${progress}`,
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

Cases.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default Cases;
