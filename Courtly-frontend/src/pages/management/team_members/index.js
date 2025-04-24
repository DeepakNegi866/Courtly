import React, { useCallback, useState, useMemo } from "react";
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
  Action,
  Eyeicon,
  Edit,
  Grow,
  Trash,
  Dropdown,
} from "@/utils/icons";
import Breadcrumb from "@/components/breadcrumb";
import { useSession } from "next-auth/react";
import { render } from "@fullcalendar/core/preact";
import createExcerpt from "@/config/excerptDescription";

const Users = ({ data }) => {
  const { docs: users, page, totalPages, totalDocs, limit } = data;
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
      title: "Name",
      key: "firstName",
      render: (value, row) => {
        return (
          <span>{createExcerpt(`${row.firstName} ${row.lastName}`, 20)}</span>
        );
      },
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
      title: "Role",
      key: "role",
    },
    ...(role && role != "team-member"
      ? [
          {
            title: "Status",
            key: "status",
            render: (value, row) => (
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  defaultChecked={row?.isActive}
                  onClick={(e) => switchClick(e.target.checked, row?._id)}
                />
              </div>
            ),
          },
        ]
      : []),
    ...(role && role != "team-member"
      ? [
          {
            title: "Actions",
            key: "_id",
            render: (value, row, index) => {
              return (
                <>
                  {role &&
                    (role == "admin" ||
                      role == "super-admin" ||
                      role == "accountant") && (
                      <Link
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="view"
                        className="btn ps-0"
                        href={`/management/team_members/profile/${value}`}
                      >
                        <Eyeicon />
                      </Link>
                    )}
                  {role &&
                    (role == "admin" ||
                      role == "super-admin" ||
                      role == "accountant") && (
                      <Link
                        className="btn ps-0"
                        data-bs-placement="top"
                        title="Edit"
                        href={`${router.pathname}/${value}`}
                      >
                        <span>
                          <Edit />
                        </span>
                      </Link>
                    )}
                  {/* <Link className="btn ps-0" href="/">
              <Grow />
            </Link> */}
                  {role &&
                    (role == "admin" ||
                      role == "super-admin" ||
                      role == "accountant") && (
                      <button
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Delete"
                        className="btn ps-0"
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
      : []),
  ];

  const switchClick = async (value, id) => {
    try {
      if (!id) return;
      const payLoad = {
        memberId: id,
        isActive: value,
      };
      await Axios.post("user/status", payLoad, {
        authenticated: true,
      });

      toast.success("User status is updated successfully");
    } catch (error) {
      toast.error("An error occured while updating user");
    }
  };

  const handleDeleteAction = async (userId) => {
    try {
      await Axios.delete(`/user/delete-user/${userId}`, {
        authenticated: true,
      });
      toast.success("User is deleted successfully.");
      router.replace(router.asPath);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error ocured while trying to delete user"
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
    { label: "Team_members" }, // Last item (non-clickable)
  ];

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users; // If no search query, return all cases

    return users.filter(
      (users) =>
        users.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        users.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

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
                    {`All Team_members-(${totalDocs})`}
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
                      href="/management/team_members/add-new"
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
                  </select> */}

                  {/* <button className={`${tableStyle.tableButton} btn`}>
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
          <div className="row">
            <div className="col-md-12">
              <div className="card table-card">
                <div className="card-body pt-4 p-0 super-responsive-table">
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
        </section>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const { page = 1 } = query;
    const res = await Axios.get(`/user/get-all-team-members?page=${page}`, {
      authenticated: true,
      context,
    });
    return { props: { data: res.data.data } };
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

Users.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default Users;
