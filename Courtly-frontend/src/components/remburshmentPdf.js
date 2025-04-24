import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const RemburshmentPdf = async (data,adminUser,accountantUser) => {
    const employeeSignature = process.env.NEXT_PUBLIC_IMAGE_URL + "/" + data[0]?.addedBy?.signature || ""
    const adminSignature = process.env.NEXT_PUBLIC_IMAGE_URL + "/" + adminUser[0]?.signature || ""
    const accountantSignature = process.env.NEXT_PUBLIC_IMAGE_URL + "/" + accountantUser[0]?.signature || ""

    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.height;
    const headerImage = "/assets/images/pdfHeader.png";
    const footerImage = "/assets/images/pdfFooter.png";

    // Create a temporary container to hold the content
    const tempDiv = document.createElement("div");
    tempDiv.style.width = "800px";
    tempDiv.style.padding = "10px 100px 10px 100px";
    tempDiv.style.backgroundColor = "#fff";
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px"; // Hide the element
    tempDiv.innerHTML = `
        <div style="">
            <img src="${headerImage}" alt="Company Header" style="width: 100%; max-height: 80px;" />
        </div>
        <h2 style="text-align: center; margin-top: 10px; font-size: 18px;">Expense Reimbursement</h2>
        <table border="1" width="100%" style="margin-top: 10px; border-collapse: collapse; font-size: 10px;">
            <tr>
                <th style="text-align: left; padding: 5px; vertical-align: top;">Employee Name:</th>
                <td style="padding: 5px; vertical-align: top;">${data[0]?.addedBy?.firstName+" "+data[0]?.addedBy?.lastName}</td>
                <th style="text-align: left; padding: 5px; vertical-align: top;">Expense Period</th>
                <td style="padding: 5px; vertical-align: top;">
                    ${data && Array.isArray(data) && data.length > 0 
                        ? data.map((item) => `
                            From: ${item?.startDate ? new Date(item.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""} 
                            To: ${item?.endDate ? new Date(item.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
                        `).join("<br>")
                        : "No data available"}
                </td>
            </tr>
            <tr>
                <th style="text-align: left; padding: 5px;">Manager Name:</th>
                <td style="padding: 5px;">${data[0]?.addedBy?.manager ?? "Ashwarya Sharma"}</td>
                <th style="text-align: left; padding: 5px;">Department:</th>
                <td style="padding: 5px;">Indirect Tax</td>
            </tr>
            <tr>
                <th colspan="4" style="text-align: left; padding: 5px;">
                    Category (Internal/External - If External, mention client name):
                </th>
            </tr>
            <tr>
                <td colspan="4" style="padding: 5px;">
                    ${data[0]?.caseId?.title || ""}
                </td>
            </tr>
        </table>
        <table border="1" width="100%" style="margin-top: 10px; border-collapse: collapse; font-size: 10px;">
            <tr style="background-color: #cfd8dc;">
                <th style="padding: 5px;">DATE</th>
                <th style="padding: 5px;">DESCRIPTION</th>
                <th style="padding: 5px;">CATEGORY</th>
                <th style="padding: 5px;">AMOUNT</th>
            </tr>
            <tr>
            ${data && Array.isArray(data) && data.length > 0 
                ? data.map((item) => `
                    <tr>
                        <td style="padding: 5px; display: table-cell;top: 5px; vertical-align: top;">
                            ${item?.startDate ? new Date(item.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Invalid Date"}
                        </td>
                        <td style="padding: 5px; display: table-cell; vertical-align: middle;">
                            ${item?.description || ""}
                        </td>
                        <td style="padding: 5px; display: table-cell; top: 5px; vertical-align: top;">${item?.type || ""}</td>
                        <td style="padding: 5px; display: table-cell; top: 5px; vertical-align: top;">${item?.amount || 0}</td>
                    </tr>
                `).join("")
                : `
                    <tr>
                        <td colspan="4" style="padding: 5px; text-align: center;">No data available</td>
                    </tr>
                `
            }            
            </tr>
            <tr style="background-color: #e0e0e0; font-weight: bold;">
                <td colspan="3" style="text-align: right; padding: 5px;">SUBTOTAL</td>
                <td style="padding: 5px;">
                    ${data && Array.isArray(data) ? data.reduce((sum, item) => sum + (item.amount || 0), 0) : 0}
                </td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right; padding: 5px;">Less Cash Advance</td>
                <td style="padding: 5px;">0.00</td>
            </tr>
            <tr style="background-color: #c8e6c9; font-weight: bold;">
                <td colspan="3" style="text-align: right; padding: 5px;">TOTAL REIMBURSEMENT</td>
                <td style="padding: 5px;">${data && Array.isArray(data) ? data.reduce((sum, item) => sum + (item.amount || 0), 0) : 0}</td>
            </tr>
        </table>
            <table border="1" width="100%" style="margin-top: 10px; border-collapse: collapse; font-size: 10px;">
                <tr>
                    <th style="padding: 5px; vertical-align: top;">Employee Signature</th>
                    <td style="padding: 5px; vertical-align: top;">
                        <img src="${employeeSignature}" alt="Employee Signature" width="100">
                    </td>
                </tr>
                <tr>
                    <th style="padding: 5px; vertical-align: top;">Approval Signature - Admin</th>
                    <td style="padding: 5px; vertical-align: top;">
                        <img src="${adminSignature}" alt="Admin Signature" width="100">
                    </td>
                </tr>
                <tr>
                    <th style="padding: 5px; vertical-align: top;">Approval Signature - Accounts</th>
                    <td style="padding: 5px; vertical-align: top;">
                        <img src="${accountantSignature}" alt="Accountant Signature" width="100">
                    </td>
                </tr>
            </table>
    `;


    document.body.appendChild(tempDiv);

    // Ensure images are loaded before rendering
    await Promise.all([
        new Promise((resolve) => {
            const img = new Image();
            img.src = headerImage;
            img.onload = resolve;
        }),
        new Promise((resolve) => {
            const img = new Image();
            img.src = footerImage;
            img.onload = resolve;
        }),
    ]);

    const canvas = await html2canvas(tempDiv, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    document.body.removeChild(tempDiv);

    const imgWidth = 210; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 5, imgWidth, imgHeight);

    const footerHeight = 15;
    const footerYPosition = pageHeight - footerHeight;
    pdf.addImage(footerImage, "PNG", 0, footerYPosition, imgWidth, footerHeight);

    // Convert PDF to Blob and return it
    const pdfBlob = pdf.output("blob");
    return pdfBlob;
};

export default RemburshmentPdf;
