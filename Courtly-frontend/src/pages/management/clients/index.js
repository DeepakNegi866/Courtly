import React, { useCallback, useState, useMemo } from "react";
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
import createExcerpt from "@/config/excerptDescription";
import { render } from "@fullcalendar/core/preact";

const Clients = ({ data }) => {
  const { docs: clients, page, totalPages, limit, totalDocs = 0 } = data;
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const { query } = router;

  if (totalPages < page && totalPages > 0) {
    router.push({
      pathname: router.pathname,
      query: { ...query, page: totalPages },
    });
  }

  const session = useSession();
  const role = session?.data?.user?.role || null;
  const columns = [
    {
      title: "Client Name",
      key: "fullName",
      render: (value) => {
        return <span>{createExcerpt(value, 20)}</span>;
      },
    },
    {
      title: "Nick Name",
      key: "nickName",
      render: (value) => {
        return <span>{createExcerpt(value, 20)}</span>;
      },
    },
    {
      title: "Company Name",
      key: "companyName",
      render: (value) => {
        return <span>{createExcerpt(value, 20)}</span>;
      },
    },
    {
      title: "Company Email",
      key: "email",
      render: (value) => {
        return <span>{createExcerpt(value, 50)}</span>;
      },
    },
    {
      title: "GSTN",
      key: "GSTN",
    },
    {
      title: "Company Website",
      key: "website",
    },
    ...(role != "team-member"
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
        ]
      : []), // If status is not "team-member", the Actions column is not included
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Clients", href: "/management/clients" }, // Last item (non-clickable)
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

  const filteredClient = useMemo(() => {
    if (!searchQuery) return clients; // If no search query, return all cases

    return clients.filter(
      (client) =>
        client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.nickName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, clients]);

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
                    All Clients-({totalDocs})
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
                  {role && role != "team-member" && (
                    <Link
                      href="/management/clients/add-new"
                      className={`${tableStyle.tableButton} btn`}
                    >
                      <span className="me-2">
                        <Add />
                      </span>
                      <span>Add New</span>
                    </Link>
                  )}
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
                      data={filteredClient}
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
    const { page = 1 } = query;
    const res = await Axios.get(`/client/get-all-clients?page=${page}`, {
      authenticated: true,
      context,
    });

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

Clients.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default Clients;
