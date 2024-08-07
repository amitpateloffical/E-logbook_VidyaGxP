import { useEffect, useState } from "react";
import HeaderTop from "../../components/Header/HeaderTop";
import HeaderBottom from "../../components/Header/HeaderBottom";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { hasAccess } from "../../components/userAuth/userAuth";

function Dashboard() {
  const navigate = useNavigate();
  const [eLogSelect, setELogSelect] = useState("All_Records");
  
  const [differentialPressureElogs, setDifferentialPressureElogs] = useState(
    []
  );
  const [tempratureRecordElogs, setTempratureRecordElogs] = useState([]);
  const [areaAndERecordElogs, setAreaAndERecordElogs] = useState([]);
  const [equipmentCRecordElogs, setEquipmentCRecordElogs] = useState([]);
  const userDetails = JSON.parse(localStorage.getItem("user-details"));

  useEffect(() => {
    const newConfig = {
      method: "get",
      url: "https://elogbookapi.vidyagxp.com/differential-pressure/get-all-differential-pressure",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user-token")}`,
        "Content-Type": "application/json",
      },
    };

    axios(newConfig)
      .then((response) => {
        const allDifferentialPressureElogs = response.data.message;
        let filteredArray = allDifferentialPressureElogs.filter((elog) => {
          const userId = userDetails.userId;

          return (
            userId === elog.reviewer_id ||
            userId === elog.initiator_id ||
            userId === elog.approver_id ||
            hasAccess(4, elog.site_id, 1)
          );
        });
        setDifferentialPressureElogs(filteredArray);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });

    const newConfigTemp = {
      method: "get",
      url: "https://elogbookapi.vidyagxp.com/temprature-record/get-all-temprature-record",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user-token")}`,
        "Content-Type": "application/json",
      },
    };

    axios(newConfigTemp)
      .then((response) => {
        const allTempratureRecordElogs = response.data.message;
        let filteredArray = allTempratureRecordElogs.filter((elog) => {
          const userId = userDetails.userId;

          return (
            userId === elog.reviewer_id ||
            userId === elog.initiator_id ||
            userId === elog.approver_id ||
            hasAccess(4, elog.site_id, 4)
          );
        });
        setTempratureRecordElogs(filteredArray);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }, []);

  const combinedRecords = [
    ...differentialPressureElogs,
    ...areaAndERecordElogs,
    ...equipmentCRecordElogs,
    ...tempratureRecordElogs,
  ];

  const handleNavigation = (item) => {
    if (item.DifferentialPressureRecords) {
      navigate("/dpr-panel", { state: item });
    } else if (item.process === "Area and equipment") {
      navigate("/area-and-equipment-panel", { state: item });
    } else if (item.TempratureRecords) {
      navigate("/tpr-panel", { state: item });
    } else if (item.process === "Equipment cleaning checklist") {
      navigate("/ecc-panel", { state: item });
    } else {
      // Handle default or fallback navigation if needed
    }
  };

  return (
    <>
      <HeaderTop />
      <HeaderBottom />

      <div className="desktop-input-table-wrapper">
        <div className="input-wrapper">
          <div className="group-input-2">
            <label>eLog</label>
            <select
              value={eLogSelect}
              onChange={(e) => setELogSelect(e.target.value)}
            >
              <option value="All_Records">All Records</option>
              <option value="diffrential_pressure">
                Diffrential Pressure Record
              </option>
              <option value="area_and_equipment">
                Area & Equipment Usage Log
              </option>
              <option value="equipment_cleaning">
                Equipment Cleaning Checklist
              </option>
              <option value="temperature_records">Temperature Records</option>
            </select>
          </div>
          {/* <button className="btn">Print</button> */}
        </div>

        <table>
          <thead>
            <tr>
              <th>S no</th>
              <th>E.Log no</th>
              <th>Initiator</th>
              <th>Date of initiation</th>
              <th>Short description</th>
              <th>Status</th>
              <th>Site</th>
            </tr>
          </thead>
          <tbody>
            {eLogSelect === "diffrential_pressure"
              ? differentialPressureElogs?.map((item, index) => {
                  return (
                    <tr key={item.index}>
                      <td> {index + 1}</td>
                      <td
                        style={{
                          cursor: "pointer",
                          color: "black",
                        }}
                        onClick={() => navigate("/dpr-panel", { state: item })}
                        onMouseEnter={(e) => {
                          e.target.style.color = "blue";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "black";
                        }}
                      >
                        {`DP${item.form_id}`}
                      </td>
                      <td>{item.initiator_name}</td>
                      <td>{item.date_of_initiation.split("T")[0]}</td>
                      <td>{item.description}</td>
                      <td>{item.status}</td>
                      <td>
                        {item.site_id === 1
                          ? "India"
                          : item.site_id === 2
                          ? "Malaysia"
                          : item.site_id === 3
                          ? "EMEA"
                          : "EU"}
                      </td>
                    </tr>
                  );
                })
              : null}

            {eLogSelect === "area_and_equipment"
              ? areaAndERecordElogs?.map((item, index) => {
                  return (
                    <tr key={item.index}>
                      <td> {index + 1}</td>
                      <td onClick={() => navigate("/area-and-equipment-panel")}>
                        {item.eLogId}
                      </td>
                      <td>{item.initiator}</td>
                      <td>{item.dateOfInitiation}</td>
                      <td>{item.shortDescription}</td>
                      <td>{item.status}</td>
                      <td>{item.process}</td>
                    </tr>
                  );
                })
              : null}

            {eLogSelect === "equipment_cleaning"
              ? equipmentCRecordElogs?.map((item, index) => {
                  return (
                    <tr key={item.index}>
                      <td> {index + 1}</td>
                      <td onClick={() => navigate("/ecc-panel")}>
                        {item.eLogId}
                      </td>
                      <td>{item.initiator}</td>
                      <td>{item.dateOfInitiation}</td>
                      <td>{item.shortDescription}</td>
                      <td>{item.status}</td>
                      <td>{item.process}</td>
                    </tr>
                  );
                })
              : null}

            {eLogSelect === "temperature_records"
              ? tempratureRecordElogs?.map((item, index) => {
                  return (
                    <tr key={item.index}>
                      <td> {index + 1}</td>
                      <td
                        style={{
                          cursor: "pointer",
                          color: "black",
                        }}
                        onClick={() => navigate("/tpr-panel", { state: item })}
                        onMouseEnter={(e) => {
                          e.target.style.color = "blue";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "black";
                        }}
                      >
                        {`TR${item.form_id}`}
                      </td>
                      <td>{item.initiator_name}</td>
                      <td>{item.date_of_initiation.split("T")[0]}</td>
                      <td>{item.description}</td>
                      <td>{item.status}</td>
                      <td>
                        {item.site_id === 1
                          ? "India"
                          : item.site_id === 2
                          ? "Malaysia"
                          : item.site_id === 3
                          ? "EMEA"
                          : "EU"}
                      </td>
                    </tr>
                  );
                })
              : null}

            {eLogSelect === "All_Records" &&
              combinedRecords?.map((item, index) => {
                return (
                  <tr key={item.eLogId}>
                    <td> {index + 1}</td>
                    <td
                      style={{
                        cursor: "pointer",
                        color: "black",
                      }}
                      onClick={() => {
                        handleNavigation(item);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "blue";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "black";
                      }}
                    >
                      {item.DifferentialPressureRecords
                        ? `DP${item.form_id}`
                        : item.TempratureRecords
                        ? `TR${item.form_id}`
                        : null}
                    </td>
                    <td>{item.initiator_name}</td>
                    <td>{item.date_of_initiation.split("T")[0]}</td>
                    <td>{item.description}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.site_id === 1
                        ? "India"
                        : item.site_id === 2
                        ? "Malaysia"
                        : item.site_id === 3
                        ? "EMEA"
                        : "EU"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Dashboard;
