import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    const url = "http://localhost:1000/user/get-all-users"; // Assuming the endpoint is corrected to "/user/get-all-users"
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`, // Include Bearer prefix with the token
        },
      })
      .then((response) => {
        setAllUsers(response.data.response); // Access the response data
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const openConfirmation = (user) => {
    setSelectedUser(user);
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    const config = {
      method: "delete",
      url: `http://localhost:1000/user/delete-user/${selectedUser.user_id}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
      },
    };
    axios(config)
      .then(() => {
        toast.success("User Delete Successfully");
        setAllUsers((prevUsers) =>
          prevUsers.filter((user) => user.user_id !== selectedUser.user_id)
        );
      })
      .catch(() => {
        toast.error("Couldn't delete User");
      });
    closeConfirmation();
  };

  const openPermissionsModal = (user) => {
    const token = localStorage.getItem("admin-token");
    axios
      .get(`http://localhost:1000/user/get-user-permissions/${user.user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPermissions(response.data.message);
        setSelectedUser(user);
        setShowPermissionsModal(true);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Couldn't fetch permissions");
      });
  };

  const closePermissionsModal = () => {
    setShowPermissionsModal(false);
    setPermissions([]);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="admin-dashboard">
        <div className="main-content">
          <div className="Header_Bottom  ">
            <div
              className="headerBottomInner"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div className="headerBottomLft" style={{ marginRight: "auto" }}>
                <div
                  className="navItem"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <i
                    className="ri-home-3-fill"
                    style={{
                      marginRight: "10px",
                      fontSize: "24px",
                      // color: "#EFA035",
                    }}
                  ></i>
                  <h3 className="text-gray-800 font-bold">User Management</h3>
                </div>
              </div>
              <div
                className="headerBottomRgt"
                onClick={() => {
                  navigate("/admin-add-user");
                }}
              >
                <button
                  className="themeBtn"
                  style={{
                    backgroundColor: "#32cfe1",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
          <div id="body-container" className="p-2">
            <br></br>
            <hr />
            {allUsers.length === 0 ? (
              <>No Registered Users</>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#fff",
                  color: "#333",
                  borderRadius: "10px",
                  boxShadow: "0px 0px 10px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Sno.
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr className="h-11" key={user.id}>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        {user.user_id}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        {user.name}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        {user.email}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        <button
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            // border: "1px solid #EFA035",
                            backgroundColor: "green",
                            color: "white",
                            cursor: "pointer",
                            marginRight: "5px",
                          }}
                          onClick={() => openPermissionsModal(user)}
                        >
                          View Permissions
                        </button>
                        <button
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            // border: "1px solid #EFA035",
                            backgroundColor: "orange",
                            color: "white",
                            cursor: "pointer",
                            marginRight: "5px",
                          }}
                          onClick={() =>
                            navigate(`/admin-edit-user`, {
                              state: { id: user.user_id },
                            })
                          }
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            // border: "1px solid #EFA035",

                            marginRight: "5px",
                            backgroundColor: "red",
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={() => openConfirmation(user)}
                        >
                          Delete
                        </button>
                        <button
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            // border: "1px solid #EFA035",
                            backgroundColor: "blue",
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(`/duplicate-user`, {
                              state: { id: user.user_id },
                            })
                          }
                        >
                          Duplicate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {showConfirmation && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            color: "#333",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px 2px rgba(0, 0, 0, 0.1)",
            zIndex: "1000",
            width: "500px", // Fixed width
            maxHeight: "70vh", // Max height to fit within viewport
            overflowY: "hidden", // Disable vertical scrolling on modal
          }}
        >
          <div style={{ overflowY: "auto", maxHeight: "calc(70vh - 100px)" }}>
            <h2
              style={{
                textAlign: "center",
                color: "black",
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Confirm Deletion
            </h2>
            <p style={{ textAlign: "center" }}>
              Are you sure you want to delete {selectedUser?.name}?
            </p>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={handleDelete}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                border: "1px solid #42e9ff",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                marginRight: "10px",
                background: "#32cfe1",
              }}
            >
              Confirm
            </button>
            <button
              onClick={closeConfirmation}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                border: "1px solid #32cfe1",
                fontWeight: "bold",
                color: "white",
                cursor: "pointer",
                background: "#32cfe1",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPermissionsModal && (
        <div
          style={{
            position: "fixed",
            backgroundColor: "#fff",
            color: "#333",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px 2px rgba(0, 0, 0, 0.1)",
            zIndex: "1000",
            width: "500px", // Fixed width
            maxHeight: "70vh", // Max height to fit within viewport
            overflowY: "hidden", // Disable vertical scrolling on modal
          }}
        >
          <div style={{ overflowY: "auto", maxHeight: "calc(70vh - 100px)" }}>
            <h2
              style={{
                textAlign: "center",
                color: "black",
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Permissions for {selectedUser?.name}
            </h2>
            {permissions?.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                        backgroundColor: "#32cfe1",
                        fontSize: "19px",
                        fontWeight: "bold",
                      }}
                    >
                      {permissions.length > 1 ? "Permissions" : "Permission"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissions?.map((permission) => (
                    <tr key={permission?.id}>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {permission.RoleGroup.roleGroup}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: "center" }}>No permissions found</p>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={closePermissionsModal}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                border: "1px solid #42e9ff",
                backgroundColor: "#32cfe1",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
