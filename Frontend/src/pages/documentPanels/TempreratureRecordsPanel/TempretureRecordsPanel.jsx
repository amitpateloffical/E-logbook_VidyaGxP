import { useEffect, useState } from "react";
import HeaderTop from "../../../components/Header/HeaderTop";
import "../docPanel.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NoteAdd } from "@mui/icons-material";
import axios from "axios";
import UserVerificationPopUp from "../../../components/UserVerificationPopUp/UserVerificationPopUp";

export default function TempretureRecordsPanel() {
  const [isSelectedGeneral, setIsSelectedGeneral] = useState(true);
  const [isSelectedDetails, setIsSelectedDetails] = useState(false);
  const [initiatorRemarks, setInitiatorRemarks] = useState(false);
  const [reviewerRemarks, setReviewerRemarks] = useState(false);
  const [approverRemarks, setApproverRemarks] = useState(false);
  const location = useLocation();
  const userDetails = JSON.parse(localStorage.getItem("user-details"));
  const [editData, setEditData] = useState({
    initiator_name: "",
    status: "",
    description: "",
    department: "",
    compression_area: "",
    limit: "",
  });
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupAction, setPopupAction] = useState(null);

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setPopupAction(null);
  };

  const handlePopupSubmit = (credentials) => {
    const data = {
      site_id: location.state?.site_id,
      form_id: location.state?.form_id,
      email: credentials?.email,
      password: credentials?.password,
      reviewComment: editData.reviewComment,
      approverComment: editData.approverComment,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user-token")}`,
        "Content-Type": "multipart/form-data",
      },
    };

    if (popupAction === "sendFromOpenToReview") {
      data.initiatorDeclaration = credentials?.declaration;
      data.initiatorAttachment = editData?.initiatorAttachment;
      axios
        .put(
          "http://localhost:1000/temprature-record/send-TR-elog-for-review",
          data,
          config
        )
        .then(() => {
          toast.success("Elog successfully sent for review");
          navigate(-1);
        })
        .catch((error) => {
          toast.error(
            error?.response?.data?.message || "Couldn't send elog for review!!"
          );
        });
    } else if (popupAction === "sendFromReviewToApproval") {
      data.reviewerDeclaration = credentials?.declaration;
      data.reviewerAttachment = editData.reviewerAttachment;
      axios
        .put(
          "http://localhost:1000/temprature-record/send-TR-from-review-to-approval",
          data,
          config
        )
        .then(() => {
          toast.success("Elog successfully sent for approval");
          navigate(-1);
        })
        .catch((error) => {
          toast.error(
            error?.response?.data?.message ||
              "Couldn't send elog for approval!!"
          );
        });
    } else if (popupAction === "sendFromReviewToOpen") {
      data.reviewerDeclaration = credentials?.declaration;
      data.reviewerAttachment = editData.reviewerAttachment;

      axios
        .put(
          "http://localhost:1000/temprature-record/send-TR-elog-from-review-to-open",
          data,
          config
        )
        .then(() => {
          toast.success("Elog successfully opened");
          navigate(-1);
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message || "Couldn't open elog!!");
        });
    } else if (popupAction === "sendFromApprovalToApproved") {
      data.approverDeclaration = credentials?.declaration;
      data.approverAttachment = editData.approverAttachment;
      axios
        .put(
          "http://localhost:1000/temprature-record/approve-TR-elog",
          data,
          config
        )
        .then(() => {
          toast.success("Elog successfully approved");
          navigate(-1);
        })
        .catch((error) => {
          toast.error(
            error?.response?.data?.message || "Couldn't approve elog!!"
          );
        });
    } else if (popupAction === "sendFromApprovalToOpen") {
      data.approverAttachment = editData.approverAttachment;
      data.approverDeclaration = credentials?.declaration;
      axios
        .put(
          "http://localhost:1000/temprature-record/send-TR-elog-from-approval-to-open",
          data,
          config
        )
        .then(() => {
          toast.success("Elog successfully opened");
          navigate(-1);
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message || "Couldn't open elog!!");
        });
    } else if (popupAction === "updateElog") {
      data.initiatorDeclaration = credentials?.declaration;
      // if (
      //   parseFloat(editData.limit) < 0.6 ||
      //   parseFloat(editData.limit) > 2.6
      // ) {
      //   toast.error("The limit value must be between 0.6 and 2.6.");
      //   return;
      // }

      if (editData.description === "") {
        toast.error("description is required");
        return;
      }
      if (editData?.TempratureRecords?.some(record => record.temprature_record === "" || record.remarks === "")) {
        toast.error("Please provide grid details!");
        return;
      }

      editData.email = credentials.email;
      editData.password = credentials.password;
      editData.initiatorDeclaration = credentials?.declaration;

      const myHeaders = {
        Authorization: `Bearer ${localStorage.getItem("user-token")}`,
        "Content-Type": "multipart/form-data",
      };

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        data: editData,
        url: "http://localhost:1000/temprature-record/update-temprature-record",
      };

      axios(requestOptions)
        .then(() => {
          toast.success("Data saved successfully!");
          navigate("/dashboard");
        })
        .catch((error) => {
          console.error(error);
        });
    }

    setIsPopupOpen(false);
    setPopupAction(null);
  };

  useEffect(() => {
    setEditData(location.state);
  }, [location.state]);

  const addRow = () => {
    if (
      location.state?.stage === 1 &&
      location.state?.initiator_id === userDetails.userId
    ) {
      const currentTime = new Date().toLocaleTimeString("en-GB", {
        hour12: false,
      });
      const newRow = {
        unique_id: generateUniqueId(),
        time: currentTime,
        temprature_record: "",
        remarks: "",
        checked_by: location?.state?.initiator_name,
        supporting_docs: null,
      };
      setEditData((prevState) => ({
        ...prevState,

        TempratureRecords: [...prevState.TempratureRecords, newRow],
      }));
    }
  };

  const deleteRow = (index) => {
    if (
      location.state?.stage === 1 &&
      location.state?.initiator_id === userDetails.userId
    ) {
      const updatedGridData = [...editData.TempratureRecords];
      updatedGridData.splice(index, 1);
      setEditData((prevState) => ({
        ...prevState,
        TempratureRecords: updatedGridData,
      }));
    }
  };

  const handleInputChange1 = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const reportData = {
    site:
      location.state.site_id === 1
        ? "India"
        : location.state.site_id === 2
        ? "Malaysia"
        : location.state.site_id === 3
        ? "EMEA"
        : "EU",
    status: location.state.status,
    initiator_name: location.state.initiator_name,
    ...editData,
  };

  async function generateReport() {
    // Create the confirmation popup container
    const confirmationContainer = document.createElement("div");
    confirmationContainer.style.position = "fixed";
    confirmationContainer.style.top = "20px"; // Adjusted top position
    confirmationContainer.style.left = "50%";
    confirmationContainer.style.transform = "translate(-50%, 0)";
    confirmationContainer.style.backgroundColor = "#ffffff";
    confirmationContainer.style.border = "1px solid #ccc";
    confirmationContainer.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    confirmationContainer.style.padding = "20px";
    confirmationContainer.style.borderRadius = "5px";
    confirmationContainer.style.zIndex = "1000";
    confirmationContainer.style.width = "300px";

    // Create the confirmation message
    const confirmationMessage = document.createElement("div");
    confirmationMessage.textContent =
      "Are you sure you want to generate the PDF?";
    confirmationMessage.style.fontSize = "16px";
    confirmationMessage.style.marginBottom = "15px";

    // Create the buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.textAlign = "center";

    // Create the confirm button
    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    confirmButton.style.padding = "10px 20px";
    confirmButton.style.margin = "0 10px";
    confirmButton.style.cursor = "pointer";
    confirmButton.style.border = "none";
    confirmButton.style.borderRadius = "5px";
    confirmButton.style.backgroundColor = "#4CAF50";
    confirmButton.style.color = "white";
    confirmButton.style.fontSize = "14px";

    // Create the cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.padding = "10px 20px";
    cancelButton.style.margin = "0 10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "5px";
    cancelButton.style.backgroundColor = "#f44336";
    cancelButton.style.color = "white";
    cancelButton.style.fontSize = "14px";

    // Append buttons to the buttons container
    buttonsContainer.appendChild(confirmButton);
    buttonsContainer.appendChild(cancelButton);

    // Append message and buttons to the confirmation container
    confirmationContainer.appendChild(confirmationMessage);
    confirmationContainer.appendChild(buttonsContainer);

    // Append the confirmation container to the document body
    document.body.appendChild(confirmationContainer);

    // Add event listener to the confirm button
    confirmButton.addEventListener("click", async () => {
      try {
        // Close the confirmation popup
        confirmationContainer.remove();

        console.log(reportData);

        // Make API request to generate PDF
        const response = await axios({
          url: "http://localhost:1000/temprature-record/generate-pdf",
          method: "POST",
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
            "Content-Type": "application/json",
          },
          data: {
            reportData: reportData,
          },
        });

        // Create a blob URL for the PDF content
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Create an anchor element to trigger the download
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `TR${reportData.form_id}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Clean up the blob URL
        window.URL.revokeObjectURL(url);

        // Display success message as styled popup
        const successMessage = document.createElement("div");
        successMessage.textContent = "PDF generated successfully!";
        successMessage.style.position = "fixed";
        successMessage.style.top = "20px";
        successMessage.style.left = "50%";
        successMessage.style.transform = "translateX(-50%)";
        successMessage.style.backgroundColor =
          "rgba(76, 175, 80, 0.8)"; /* Green for success */
        successMessage.style.color = "white";
        successMessage.style.padding = "15px";
        successMessage.style.borderRadius = "5px";
        successMessage.style.zIndex = "1000";
        successMessage.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
        successMessage.style.fontSize = "14px";
        document.body.appendChild(successMessage);

        // Remove the success message after 3 seconds
        setTimeout(() => {
          successMessage.remove();
        }, 3000);
      } catch (error) {
        console.error("Error:", error);
        // Display error message as styled popup
        const errorMessage = document.createElement("div");
        errorMessage.textContent =
          "Failed to generate PDF. Please try again later.";
        errorMessage.style.position = "fixed";
        errorMessage.style.top = "20px";
        errorMessage.style.left = "50%";
        errorMessage.style.transform = "translateX(-50%)";
        errorMessage.style.backgroundColor =
          "rgba(244, 67, 54, 0.8)"; /* Red for error */
        errorMessage.style.color = "white";
        errorMessage.style.padding = "15px";
        errorMessage.style.borderRadius = "5px";
        errorMessage.style.zIndex = "1000";
        errorMessage.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
        errorMessage.style.fontSize = "14px";
        document.body.appendChild(errorMessage);

        // Remove the error message after 3 seconds
        setTimeout(() => {
          errorMessage.remove();
        }, 3000);
      }
    });

    // Add event listener to the cancel button
    cancelButton.addEventListener("click", () => {
      // Close the confirmation popup
      confirmationContainer.remove();

      // Display cancel message as styled popup
      const cancelMessage = document.createElement("div");
      cancelMessage.textContent = "PDF generation canceled.";
      cancelMessage.style.position = "fixed";
      cancelMessage.style.top = "20px";
      cancelMessage.style.left = "50%";
      cancelMessage.style.transform = "translateX(-50%)";
      cancelMessage.style.backgroundColor =
        "rgba(183, 28, 28, 0.8)"; /* Dark red for cancel */
      cancelMessage.style.color = "white";
      cancelMessage.style.padding = "15px";
      cancelMessage.style.borderRadius = "5px";
      cancelMessage.style.zIndex = "1000";
      cancelMessage.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
      cancelMessage.style.fontSize = "14px";
      document.body.appendChild(cancelMessage);

      // Remove the cancel message after 3 seconds
      setTimeout(() => {
        cancelMessage.remove();
      }, 3000);
    });
  }

  function deepEqual(object1, object2) {
    // First, check if they are the same object (reference equality)
    if (object1 === object2) {
      return true;
    }

    // Ensure both are objects and neither is null
    if (
      typeof object1 !== "object" ||
      object1 === null ||
      typeof object2 !== "object" ||
      object2 === null
    ) {
      return false;
    }

    // Compare their own properties
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    // Check if they have the same number of properties
    if (keys1.length !== keys2.length) {
      return false;
    }

    // Check each property in object1 to see if it exists and equals the one in object2
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject(val1) && isObject(val2);

      // Recursively evaluate objects, or check primitive values for equality
      if (
        (areObjects && !deepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }

    return true;
  }

  function isObject(object) {
    return object != null && typeof object === "object";
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""; // Return empty if the input is falsy

    const utcDate = new Date(dateString);
    // Check if the date is valid
    if (isNaN(utcDate.getTime())) {
      return "";
    }

    return utcDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleFileChange = (index, file) => {
    const updatedGridData = [...editData.TempratureRecords];
    updatedGridData[index].supporting_docs = file;
    setEditData((prevState) => ({
      ...prevState,
      TempratureRecords: updatedGridData,
    }));
  };

  const handleInitiatorFileChange = (e) => {
    setEditData({ ...editData, initiatorAttachment: e.target.files[0] });
  };
  const handleReviewerFileChange = (e) => {
    setEditData({ ...editData, reviewerAttachment: e.target.files[0] });
  };
  const handleApproverFileChange = (e) => {
    setEditData({ ...editData, approverAttachment: e.target.files[0] });
  };

  const generateUniqueId = () => {
    return `UU0${new Date().getTime()}${Math.floor(Math.random() * 100)}`;
  };

  return (
    <>
      <HeaderTop />
      <div id="main-form-container">
        <div id="config-form-document-page">
          <div className="top-block">
            <div>
              <strong> Record Name:&nbsp;</strong>Temperature Record
            </div>
            <div>
              <strong> Site:&nbsp;</strong>
              {location.state?.site_id === 1
                ? "India"
                : location.state?.site_id === 2
                ? "Malaysia"
                : location.state?.site_id === 3
                ? "EMEA"
                : "EU"}
            </div>
            <div>
              <strong> Current Status:&nbsp;</strong>
              {location.state?.status}
            </div>
            <div>
              <strong> Initiated By:&nbsp;</strong>
              {location.state?.initiator_name}
            </div>
          </div>

          <div className="document-form">
            <div className="details-form-data">
              <div className="sop-type-header">
                <div className="logo">
                  <img src="/vidyalogo2.png" alt="..." />
                </div>
                <div className="main-head">
                  <div>VidyaGxP Private Limited</div>
                </div>
              </div>
              <div className="sub-head-2">Temperature Record</div>
              <div className="outerDiv4">
                <div className="btn-forms">
                  <div
                    className={`${
                      location.state?.stage === 1
                        ? "btn-forms-isSelecteds"
                        : "btn-forms-selects"
                    }`}
                  >
                    INITIATION
                  </div>
                  <div
                    className={`${
                      location.state?.stage === 2
                        ? "btn-forms-isSelecteds"
                        : "btn-forms-selects"
                    }`}
                  >
                    UNDER REVIEW
                  </div>
                  <div
                    className={`${
                      location.state?.stage === 3
                        ? "btn-forms-isSelecteds"
                        : "btn-forms-selects"
                    }`}
                  >
                    UNDER APPROVAL
                  </div>
                  <div
                    className={`${
                      location.state?.stage === 4
                        ? "btn-forms-isSelecteds"
                        : "btn-forms-selects"
                    }`}
                  >
                    APPROVED
                  </div>
                </div>
              </div>
              <div className="outerDiv4">
                <div className="btn-forms">
                  <div
                    className={`${
                      isSelectedGeneral === true
                        ? "btn-forms-isSelected"
                        : "btn-forms-select"
                    }`}
                    onClick={() => {
                      setIsSelectedDetails(false),
                        setIsSelectedGeneral(true),
                        setInitiatorRemarks(false),
                        setReviewerRemarks(false),
                        setApproverRemarks(false);
                    }}
                  >
                    General Information
                  </div>
                  <div
                    className={`${
                      isSelectedDetails === true
                        ? "btn-forms-isSelected"
                        : "btn-forms-select"
                    }`}
                    onClick={() => {
                      setIsSelectedDetails(true),
                        setIsSelectedGeneral(false),
                        setInitiatorRemarks(false),
                        setReviewerRemarks(false),
                        setApproverRemarks(false);
                    }}
                  >
                    Details
                  </div>
                  <div
                    className={`${
                      initiatorRemarks === true
                        ? "btn-forms-isSelected"
                        : "btn-forms-select"
                    }`}
                    onClick={() => {
                      setIsSelectedDetails(false),
                        setIsSelectedGeneral(false),
                        setInitiatorRemarks(true),
                        setReviewerRemarks(false),
                        setApproverRemarks(false);
                    }}
                  >
                    Initiator Remarks
                  </div>
                  <div
                    className={`${
                      reviewerRemarks === true
                        ? "btn-forms-isSelected"
                        : "btn-forms-select"
                    }`}
                    onClick={() => {
                      setIsSelectedDetails(false),
                        setIsSelectedGeneral(false),
                        setInitiatorRemarks(false),
                        setReviewerRemarks(true),
                        setApproverRemarks(false);
                    }}
                  >
                    Reviewer Remarks
                  </div>
                  <div
                    className={`${
                      approverRemarks === true
                        ? "btn-forms-isSelected"
                        : "btn-forms-select"
                    }`}
                    onClick={() => {
                      setIsSelectedDetails(false),
                        setIsSelectedGeneral(false),
                        setInitiatorRemarks(false),
                        setReviewerRemarks(false),
                        setApproverRemarks(true);
                    }}
                  >
                    Approver Remarks
                  </div>
                  <div
                    className="btn-forms-select"
                    onClick={() =>
                      navigate("/audit-trail", {
                        state: {
                          formId: location.state?.form_id,
                          process: "Temperature Records",
                        },
                      })
                    }
                  >
                    Audit Trail
                  </div>
                </div>
                <button className="btn-forms-select" onClick={generateReport}>
                  Generate Report
                </button>
                <div className="analytics-btn">
                  <button
                    className="btn-print"
                    onClick={() =>
                      navigate("/analytics", {
                        state: { records: location.state, processId: 4 },
                      })
                    }
                  >
                    Analytics
                  </button>
                  {/* <PDFDownloadLink
                    document={<DynamicPdf elog={editData} />}
                    fileName="VidyaGxP.pdf"
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? (
                        <button className="btn-print">Wait</button>
                      ) : (
                        <button className="btn-print">Print</button>
                      )
                    }
                  </PDFDownloadLink> */}
                </div>
              </div>

              {isSelectedGeneral === true ? (
                <>
                  <div className="group-input">
                    <label className="color-label">Initiator </label>
                    <div>
                      <input
                        type="text"
                        name="initiator"
                        value={editData.initiator_name}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="group-input">
                    <label className="color-label">Date of Initiation</label>
                    <div>
                      <input
                        type="text"
                        value={formatDate(editData.date_of_initiation)}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="group-input">
                    <label className="color-label">
                      Description{" "}
                      <span className="required-asterisk text-red-500">*</span>
                    </label>
                    <div>
                      <input
                        name="description"
                        type="text"
                        value={editData.description}
                        onChange={handleInputChange1}
                        readOnly={
                          location.state?.stage !== 1 ||
                          location.state?.initiator_id !== userDetails.userId
                        }
                      />
                    </div>
                  </div>

                  <div className="group-input">
                    <label className="color-label">Status</label>
                    <div>
                      <input
                        name="status"
                        type="text"
                        value={editData?.status}
                        readOnly
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {isSelectedDetails === true ? (
                <>
                  <div className="group-input">
                    <label className="color-label">Department</label>

                    <div className="instruction">&nbsp;</div>
                    <select
                      className="form-control"
                      name="department"
                      value={editData?.department}
                      onChange={handleInputChange1}
                      disabled={
                        location.state?.stage !== 1 ||
                        location.state?.initiator_id !== userDetails.userId
                      }
                    >
                      <option value="">-- Select --</option>
                      <option value="Corporate Quality Assurance">
                        Corporate Quality Assurance
                      </option>
                      <option value="Quality Assurance Bio-Pharma">
                        Quality Assurance Bio-Pharma
                      </option>
                      <option value="Central Quality Control">
                        Central Quality Control
                      </option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Plasma Sourcing Grou">
                        Plasma Sourcing Group
                      </option>
                      <option value="Central Stores">Central Stores</option>
                      <option value="Information Technology Group">
                        Information Technology Group
                      </option>
                      <option value="Molecular Medicine">
                        Molecular Medicine
                      </option>
                      <option value="Central Laboratory">
                        Central Laboratory
                      </option>
                      <option value="Tech team">Tech team</option>
                    </select>
                  </div>

                  <div className="group-input">
                    <label className="color-label">
                      Compression Area with respect to Corridor
                    </label>

                    <div className="instruction">&nbsp;</div>
                    <select
                      className="form-control"
                      name="compression_area"
                      value={editData?.compression_area}
                      onChange={handleInputChange1}
                      disabled={
                        location.state?.stage !== 1 ||
                        location.state?.initiator_id !== userDetails.userId
                      }
                    >
                      <option value="Select a value">Select a value</option>
                      <option value="Area 1">Area 1</option>
                      <option value="Area 2">Area 2</option>
                      <option value="Area 3">Area 3</option>
                      <option value="Area 4">Area 4</option>
                      <option value="Area 5">Area 5</option>
                      <option value="Area 6">Area 6</option>
                    </select>
                  </div>

                  <div className="group-input">
                    <label className="color-label">Limit</label>
                    <div className="instruction"></div>
                    <input
                      name="limit"
                      type="number"
                      className={`${
                        editData?.limit < 0.6
                          ? "limit"
                          : editData?.limit > 2.6
                          ? "limit"
                          : ""
                      }`}
                      value={editData?.limit}
                      onChange={handleInputChange1}
                      readOnly={
                        location.state?.stage !== 1 ||
                        location.state?.initiator_id !== userDetails.userId
                      }
                    />
                  </div>

                  <div>
                    <div className="AddRows d-flex">
                      <NoteAdd onClick={addRow} />
                      <div className="addrowinstruction"></div>
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>S no.</th>
                        <th>Unique Id</th>
                        <th>Time</th>
                        <th>temperature Record</th>
                        <th>Remark</th>
                        <th>Checked By</th>
                        <th>Supporting Documents</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editData?.TempratureRecords.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.unique_id}</td>
                          <td>
                            <input value={item.time} readOnly />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.temprature_record}
                              className={`${
                                item.temprature_record < 0.6
                                  ? "limit"
                                  : item.temprature_record > 2.6
                                  ? "limit"
                                  : ""
                              }`}
                              onChange={(e) => {
                                const newData = [...editData.TempratureRecords];
                                newData[index].temprature_record =
                                  e.target.value;
                                setEditData({
                                  ...editData,
                                  TempratureRecords: newData,
                                });
                              }}
                              readOnly={
                                location.state?.stage !== 1 ||
                                location.state?.initiator_id !==
                                  userDetails.userId
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={item.remarks}
                              onChange={(e) => {
                                const newData = [...editData.TempratureRecords];
                                newData[index].remarks = e.target.value;
                                setEditData({
                                  ...editData,
                                  TempratureRecords: newData,
                                });
                              }}
                              readOnly={
                                location.state?.stage !== 1 ||
                                location.state?.initiator_id !==
                                  userDetails.userId
                              }
                            />
                          </td>
                          <td>
                            <input
                              value={item.checked_by}
                              onChange={(e) => {
                                const newData = [...editData.TempratureRecords];
                                newData[index].checked_by = e.target.value;
                                setEditData({
                                  ...editData,
                                  TempratureRecords: newData,
                                });
                              }}
                              readOnly
                            />
                          </td>
                          <td style={{ width: "250px" }}>
                            <div className="d-flex align-items-center">
                              <button
                                type="button"
                                className="btn-upload"
                                onClick={() =>
                                  document
                                    .getElementsByName("supporting_docs")
                                    [index].click()
                                }
                                style={{ marginRight: "10px" }}
                                disabled={
                                  location.state?.stage !== 1 ||
                                  location.state?.initiator_id !==
                                    userDetails.userId
                                }
                              >
                                {item.supporting_docs
                                  ? "Change File"
                                  : "Select File"}
                              </button>
                              {item.supporting_docs && (
                                <div>
                                  <h3>
                                    Selected File:{" "}
                                    <a
                                      href={item.supporting_docs}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View File
                                    </a>
                                  </h3>
                                </div>
                              )}
                              <input
                                type="file"
                                name="supporting_docs"
                                style={{ display: "none" }}
                                onChange={(e) =>
                                  handleFileChange(index, e.target.files[0])
                                }
                                disabled={
                                  location.state?.stage !== 1 ||
                                  location.state?.initiator_id !==
                                    userDetails.userId
                                }
                              />
                            </div>
                          </td>

                          <td>
                            <DeleteIcon onClick={() => deleteRow(index)} />
                            {item.limit !== "" &&
                              (item.limit < 0.6 || item.limit > 2.6) && (
                                <button
                                  className="deviation-btn"
                                  onClick={() => {
                                    navigate("/chart");
                                  }}
                                >
                                  Launch Deviation
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : null}

              {initiatorRemarks === true ? (
                <>
                  <div className="form-flex">
                    <div className="group-input">
                      <label className="color-label">
                        Initiator Comment
                        {location.state?.stage === 1 &&
                          location.state?.initiator_id ===
                            userDetails.userId && (
                            <span style={{ color: "red", marginLeft: "2px" }}>
                              *
                            </span>
                          )}
                      </label>
                      <div className="instruction"></div>
                      <input
                        name="initiatorComment"
                        value={editData?.initiatorComment}
                        onChange={handleInputChange1}
                        readOnly={
                          location.state?.stage !== 1 ||
                          location.state?.initiator_id !== userDetails.userId
                        }
                      />
                    </div>
                    <div className="group-input">
                      <label
                        htmlFor="initiatorAttachment"
                        className="color-label"
                      >
                        Initiator Attachment
                      </label>
                      <div>
                        <button
                          type="button"
                          className="btn-upload"
                          onClick={() =>
                            document
                              .getElementById("initiatorAttachment")
                              .click()
                          }
                          disabled={
                            location.state?.stage !== 1 ||
                            location.state?.initiator_id !== userDetails.userId
                          }
                        >
                          {editData.initiatorAttachment
                            ? "Change File"
                            : "Select File"}
                        </button>
                        {editData.initiatorAttachment && (
                          <div>
                            <h3>
                              Selected File:{" "}
                              <a
                                href={editData.initiatorAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View File
                              </a>
                            </h3>
                          </div>
                        )}
                        <input
                          type="file"
                          name="initiatorAttachment"
                          id="initiatorAttachment"
                          onChange={handleInitiatorFileChange}
                          style={{ display: "none" }}
                          disabled={
                            location.state?.stage !== 1 ||
                            location.state?.initiator_id !== userDetails.userId
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-flex">
                    <div className="group-input">
                      <label className="color-label">Initiator </label>
                      <div>
                        <input
                          type="text"
                          name="initiator"
                          value={editData.initiator_name}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="group-input">
                      <label className="color-label">Date of Initiation</label>
                      <div>
                        <input
                          type="text"
                          value={formatDate(editData.date_of_initiation)}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {reviewerRemarks === true ? (
                <>
                  <div className="form-flex">
                    <div className="group-input">
                      <label className="color-label" htmlFor="reviewComment">
                        Review Comment
                        {location.state?.stage === 2 &&
                          location.state?.initiator_id ===
                            userDetails.userId && (
                            <span style={{ color: "red", marginLeft: "2px" }}>
                              *
                            </span>
                          )}
                      </label>
                      <input
                        id="reviewComment"
                        name="reviewComment"
                        value={editData.reviewComment || ""}
                        onChange={handleInputChange1}
                        readOnly={
                          location.state?.stage !== 2 ||
                          location.state?.reviewer_id !== userDetails.userId
                        }
                      />
                    </div>
                    <div className="group-input">
                      <label
                        htmlFor="reviewerAttachment"
                        className="color-label"
                      >
                        Reviewer Attachment
                      </label>
                      <div>
                        <button
                          type="button"
                          className="btn-upload"
                          onClick={() =>
                            document
                              .getElementById("reviewerAttachment")
                              .click()
                          }
                          disabled={
                            location.state?.stage !== 2 ||
                            location.state?.reviewer_id !== userDetails.userId
                          }
                        >
                          {editData.reviewerAttachment
                            ? "Change File"
                            : "Select File"}
                        </button>
                        {editData.reviewerAttachment && (
                          <div>
                            <h3>
                              Selected File:{" "}
                              <a
                                href={editData.reviewerAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View File
                              </a>
                            </h3>
                          </div>
                        )}
                        <input
                          type="file"
                          name="reviewerAttachment"
                          id="reviewerAttachment"
                          onChange={handleReviewerFileChange}
                          style={{ display: "none" }}
                          disabled={
                            location.state?.stage !== 2 ||
                            location.state?.reviewer_id !== userDetails.userId
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-flex">
                    <div className="group-input">
                      <label className="color-label">Reviewer </label>
                      <div>
                        <input
                          type="text"
                          name="reviewer"
                          value={editData?.tpreviewer?.name}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="group-input">
                      <label className="color-label">Date of Review</label>
                      <div>
                        <input
                          type="text"
                          value={formatDate(editData.date_of_review)}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {approverRemarks === true ? (
                <>
                  <div className="form-flex">
                    <div className="group-input">
                      <label className="color-label" htmlFor="approverComment">
                        Approver Comment
                        {location.state?.stage === 3 &&
                          location.state?.approver_id ===
                            userDetails.userId && (
                            <span style={{ color: "red", marginLeft: "2px" }}>
                              *
                            </span>
                          )}
                      </label>
                      <input
                        id="approverComment"
                        name="approverComment"
                        value={editData.approverComment || ""}
                        onChange={handleInputChange1}
                        disabled={
                          location.state?.stage !== 3 ||
                          location.state?.approver_id !== userDetails.userId
                        }
                      />
                    </div>
                    <div className="group-input">
                      <label
                        htmlFor="approverAttachment"
                        className="color-label"
                      >
                        Approver Attachment
                      </label>
                      <div>
                        <button
                          type="button"
                          className="btn-upload"
                          onClick={() =>
                            document
                              .getElementById("approverAttachment")
                              .click()
                          }
                          disabled={
                            location.state?.stage !== 3 ||
                            location.state?.approver_id !== userDetails.userId
                          }
                        >
                          {editData.approverAttachment
                            ? "Change File"
                            : "Select File"}
                        </button>
                        {editData.approverAttachment && (
                          <div>
                            <h3>
                              Selected File:{" "}
                              <a
                                href={editData.approverAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View File
                              </a>
                            </h3>
                          </div>
                        )}
                        <input
                          type="file"
                          name="approverAttachment"
                          id="approverAttachment"
                          onChange={handleApproverFileChange}
                          style={{ display: "none" }}
                          disabled={
                            location.state?.stage !== 3 ||
                            location.state?.approver_id !== userDetails.userId
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-flex">
                    <div className="group-input">
                      <label className="color-label">Approver </label>
                      <div>
                        <input
                          type="text"
                          name="approver"
                          value={editData?.tpapprover?.name}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="group-input">
                      <label className="color-label">Date of Approval</label>
                      <div>
                        <input
                          type="text"
                          value={formatDate(editData.date_of_approval)}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <div className="button-block" style={{ width: "100%" }}>
              {location.state?.stage === 1
                ? location.state?.initiator_id === userDetails.userId && (
                    <button
                      className="themeBtn"
                      onClick={() => {
                        setIsPopupOpen(true);
                        setPopupAction("sendFromOpenToReview"); // Set the action when opening the popup
                      }}
                    >
                      Send for Review
                    </button>
                  )
                : location.state?.stage === 2
                ? location.state?.reviewer_id === userDetails.userId && (
                    <>
                      <button
                        className="themeBtn"
                        onClick={() => {
                          setIsPopupOpen(true);
                          setPopupAction("sendFromReviewToApproval"); // Set the action when opening the popup
                        }}
                      >
                        Send for Approval
                      </button>
                      <button
                        className="themeBtn"
                        onClick={() => {
                          setIsPopupOpen(true);
                          setPopupAction("sendFromReviewToOpen"); // Set the action when opening the popup
                        }}
                      >
                        Open Elog
                      </button>
                    </>
                  )
                : location.state?.stage === 3
                ? location.state?.approver_id === userDetails.userId && (
                    <>
                      <button
                        className="themeBtn"
                        onClick={() => {
                          setIsPopupOpen(true);
                          setPopupAction("sendFromApprovalToApproved"); // Set the action when opening the popup
                        }}
                      >
                        Approve elog
                      </button>
                      <button
                        className="themeBtn"
                        onClick={() => {
                          setIsPopupOpen(true);
                          setPopupAction("sendFromApprovalToOpen"); // Set the action when opening the popup
                        }}
                      >
                        Open Elog
                      </button>
                    </>
                  )
                : null}
              {location.state?.stage === 1
                ? userDetails.userId === location.state?.initiator_id && (
                    <button
                      className="themeBtn"
                      onClick={() => {
                        setIsPopupOpen(true);
                        setPopupAction("updateElog");
                      }}
                    >
                      Save
                    </button>
                  )
                : null}
              <button
                className="themeBtn"
                onClick={() => {
                  if (!deepEqual(location.state, editData)) {
                    alert("Please save data before exiting");
                  } else {
                    navigate(-1);
                  }
                }}
              >
                Exit
              </button>
            </div>
            {isPopupOpen && (
              <UserVerificationPopUp
                onClose={handlePopupClose}
                onSubmit={handlePopupSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
