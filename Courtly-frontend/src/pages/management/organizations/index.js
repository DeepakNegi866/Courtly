import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import ManagementLayout from "@/layouts/management";
import ReactResponsiveTable from "@/components/super-responsive-table";
import { useRouter } from "next/router";
import Axios from "@/config/axios";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import tableStyle from "@/styles/table-nav.module.css";
import {
  Add,
  Export,
  Filter,
  Action,
  Edit,
  Grow,
  Trash,
  Dropdown,
  Eyeicon,
} from "@/utils/icons";
import Breadcrumb from "@/components/breadcrumb";
import createExcerpt from "@/config/excerptDescription";

const Organizations = ({ data }) => {
  const { docs: organizations, page, totalPages, limit, totalDocs = 0 } = data;
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const { query } = router;

  if (totalPages < page && totalPages > 0) {
    router.push({
      pathname: router.pathname,
      query: { ...query, page: totalPages },
    });
  }

  const columns = [
    {
      title: "Company Name",
      key: "companyName",
      render: (value) => {
        return <span>{createExcerpt(value, 30)}</span>;
      },
    },
    {
      title: "Company Email",
      key: "companyEmail",
    },
    {
      title: "GSTN",
      key: "GSTN",
    },
    {
      title: "Company Website",
      key: "website",
      render: (value) => {
        return <span>{createExcerpt(value, 30)}</span>;
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
            <Link
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="View"
              className="btn ps-0"
              href={`${router.pathname}/${value}/view`}
            >
              <Eyeicon />
            </Link>
            <Link
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Edit"
              className="btn ps-0"
              href={`${router.pathname}/${value}`}
            >
              <span>
                <Edit />
              </span>
            </Link>
            <button
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Delete"
              className="btn"
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

  const handleDeleteAction = async (organizationId) => {
    try {
      await Axios.delete(
        `/organization/delete-organization/${organizationId}`,
        { authenticated: true }
      );
      toast.success("Organization is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete organization"
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

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Organizations" }, // Last item (non-clickable)
  ];

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return organizations; // If no search query, return all cases

    return organizations.filter((organizations) =>
      organizations.companyName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, organizations]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update search query as user types
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
                    All Organizations-({totalDocs})
                  </h1>
                </div>
                <div className={tableStyle.tableNavButtonWrapper}>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <Link
                    href="/management/organizations/add-new"
                    className={`${tableStyle.tableButton} btn`}
                  >
                    <span className="me-2">
                      <Add />
                    </span>
                    <span>Add New</span>
                  </Link>
                  {/* <select
                    className="form-select form-area"
                    aria-label="Default select example"
                  >
                    <option selected>Open this select menu</option>

                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </select>

                  <button className={`${tableStyle.tableButton} btn`}>
                    <span className="me-2">
                      <Export />
                    </span>
                    Export
                  </button>
                  <button className={`${tableStyle.tableButton} btn`}>
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
                      data={filteredUsers}
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
    const res = await Axios.get("/organization/get-all-organizations", {
      authenticated: true,
      context,
    });

    return { props: { data: res.data.data } }; // Pass data as props
  } catch (error) {
    console.warn(error.message || "Unable to reach server. || Organizations");

    return {
      props: {
        error: error.message || "Failed to fetch data",
        data: [],
      },
    };
  }
}

Organizations.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default Organizations;
