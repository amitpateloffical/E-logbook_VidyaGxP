import { useState } from "react";
import "./HeaderBottom.css";
import { Link } from "react-router-dom";
import CreateRecordModal from "../Modals/CreateRecordModal/CreateRecordModal";
import { useSelector } from "react-redux";

function HeaderBottom() {
  const [eLogSelect, setELogSelect] = useState("All_Records");
  const [recordModal, setRecordModal] = useState(false);
  const closeRecordModal = () => setRecordModal(false);
  const loggedInUser = useSelector((state) => state.loggedInUser.loggedInUser);

  return (
    <>
      <div className="Header_Bottom">
      <div className="headerBottomInner">
      <div className="input-wrapper w-96">
          <div className="group-input-2">
            <div className="text-2xl font-extrabold">ELog</div>
            <select className="w-96"
              value={eLogSelect}
              onChange={(e) => setELogSelect(e.target.value)}
            >
              <option value="All_Records">All Records</option>
              <option value="diffrential_pressure">Diffrential Pressure Record</option>
              <option value="area_and_equipment">Area & Equipment Usage Log</option>
              <option value="equipment_cleaning">Equipment Cleaning Checklist</option>
              <option value="temperature_records">Temperature Records</option>
            </select>
          </div>
        </div>
        
          {loggedInUser.roles?.some(
            (itm) => itm.role_id === 5 || itm.role_id === 1
          ) ? (
            <div className="headerBottomRgt">
              <div className="themeBtn" onClick={() => setRecordModal(true)}>
                Initiate eLog
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {recordModal && <CreateRecordModal closeModal={closeRecordModal} />}
    </>
  );
}

export default HeaderBottom;
