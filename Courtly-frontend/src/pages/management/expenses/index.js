import Breadcrumb from "@/components/breadcrumb";
import Axios from "@/config/axios";
import ManagementLayout from "@/layouts/management";
import { formatDateToReadableString } from "@/utils/common";
import { Download, Expenses } from "@/utils/icons";
import debounce from "lodash.debounce";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import tableStyle from "@/styles/table-nav.module.css";
import ReactResponsiveTable from "@/components/super-responsive-table";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import RemburshmentPdf from "@/components/remburshmentPdf";

const downloadUrl = process.env.NEXT_PUBLIC_DOWNLOAD_URL;

const ExpensesPage = ({ data }) => {
  const { docs, totalDocs, limit, totalPages, page, admins : adminUser, accountants : accountantUser } = data;
  const [allExpenses, setAllExpenses] = useState([]);
  const [remburshmentData,setRemburshmentData] = useState([]);


  useEffect(() => {
    setAllExpenses(docs ? [...docs] : []);
  }, [docs]);

  const [loading, setLoading] = useState({
    Aloading: false,
    Rloading: false,
  });
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

  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const allRequestedExpenses = useMemo(
    () => allExpenses.filter((el) => el.reimbursement == "requested"),
    [allExpenses]
  );

  const handleToggleSelectAllExpenses = (e) => {
    let value = e.target.checked;
    if (value) {
      if (allRequestedExpenses.length > 0) {
        let allExpensesData = allRequestedExpenses.map((item) => item._id);
        setSelectedExpenses(allExpensesData);
      }
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleExpenseSelect = (e, data) => {
    const isChecked = e.target.checked;
    const expenseId = e.target.value;
    const currentCaseId = data?.caseId?._id || data?.caseId; // Handles both populated and plain ID
  
    if (isChecked) {
      if (
        selectedExpenses.length === 0 || 
        remburshmentData.length === 0 ||
        remburshmentData[0]?.caseId?._id === currentCaseId || 
        remburshmentData[0]?.caseId === currentCaseId
      ) {
        // Either first selection or same caseId, add to selection
        setSelectedExpenses((prev) => [...prev, expenseId]);
        setRemburshmentData((prev) => [...prev, data]);
      } else {
        // Different caseId, reset selection to only the current one
        setSelectedExpenses([expenseId]);
        setRemburshmentData([data]);
      }
    } else {
      // Remove the unchecked item from state
      setSelectedExpenses((prev) => prev.filter((id) => id !== expenseId));
      setRemburshmentData((prev) => prev.filter((item) => item._id !== data._id));
    }
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

  const expenseColumns = [
    {
      // title: "Type",
      key: "_id",
      render: (value, item, index) => {
        return role == "admin" ||
          role == "accountant" ||
          role == "super-admin" ? (
          <input
            type="checkbox"
            name={`expense${index}`}
            id={`expense${index}`}
            onChange={(e)=>handleExpenseSelect(e,item)}
            value={value}
            checked={selectedExpenses.includes(value)}
            disabled={item.reimbursement == "requested" ? false : true}
          />
        ) : (
          (page - 1) * limit + index + 1
        );
      },
    },
    {
      title: "Case",
      key:"caseId",
      render:(value)=>(<>{value?.title}</>)
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
        return <div dangerouslySetInnerHTML={{ __html: value }}></div>;
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
          </>
        );
      },
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Accounts", href: "/management/accounts" }, // Last item (non-clickable)
  ];

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

  const handleResetExpenses = async () => {
    try {
      const res = await Axios.get(`/expenses/get-all?page=${page}`, {
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

  const handleVerify = async (status) => {
    try {
      if (loading?.Aloading || loading?.Rloading) return;
  
      if (status === "approved") {
        setLoading((prev) => ({ ...prev, Aloading: true }));
      } else {
        setLoading((prev) => ({ ...prev, Rloading: true }));
      }
  
      if (selectedExpenses.length === 0) {
        throw new Error("Please select at least one expense.");
      }
  
      // Check if all selected reimbursements belong to the same case
      const caseIds = new Set(
        remburshmentData.map((item) => item.caseId?._id || item.caseId)
      );
  
      if (caseIds.size > 1) {
        throw new Error("Selected expenses must be from the same case.");
      }
  
      // Generate PDF Blob with all selected reimbursements
      const pdfBlob = await RemburshmentPdf(remburshmentData, adminUser, accountantUser);
  
      if (!(pdfBlob instanceof Blob) || pdfBlob.size < 10) {
        throw new Error("Generated PDF is empty or invalid.");
      }
  
      // Convert Blob to File
      const pdfFile = new File([pdfBlob], "Reimbursement.pdf", {
        type: "application/pdf",
      });
  

      // Prepare FormData
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("status", status);
      
      // Append each expense ID as an array-like input
      selectedExpenses.forEach((id) => {
        formData.append("expenses[]", id); // <-- important: use "expenses[]" as key
      });
      // ✅ send as array of strings

      // Send request
      const res = await Axios.post(`/expenses/verify-reimbursement-request`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        authenticated: true,
      });
  
      toast.success(`Reimbursement ${status} successfully.`);
  
      // Reset states
      setRemburshmentData([]);
      setSelectedExpenses([]);
      handleResetExpenses();
  
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        `An error occurred while trying to ${status} reimbursement`
      );
    } finally {
      setLoading((prev) => ({ ...prev, Aloading: false, Rloading: false }));
    }
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
                  <h1 className={`${tableStyle.tableRunningHeading} my-2`}>
                    All Expenses-({totalDocs})
                  </h1>
                </div>
                <div className={tableStyle.tableNavButtonWrapper}>
                  {selectedExpenses && Array.isArray(selectedExpenses) && selectedExpenses.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="btn btn-success text-nowrap"
                        onClick={() => handleVerify("approved")}
                        disabled={loading?.Aloading || loading?.Rloading} // Disable if any loading is active
                      >
                        {loading?.Aloading ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        ) : (
                          <span>Approve</span>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger text-nowrap"
                        onClick={() => handleVerify("rejected")}
                        disabled={loading?.Rloading || loading?.Aloading} // Disable if any loading is active
                      >
                        {loading?.Rloading ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        ) : (
                          <span>Reject</span>
                        )}
                      </button>
                    </>
                  )}
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
                      columns={expenseColumns}
                      data={allExpenses}
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
    const res = await Axios.get(`/expenses/get-all?page=${page}`, {
      authenticated: true,
      context,
    });
    return { props: { data: res.data.data } }; // Pass data as props
  } catch (error) {
    return {
      props: {
        error: error.message || "Failed to fetch data",
        data: {},
      },
    };
  }
}

ExpensesPage.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default ExpensesPage;
