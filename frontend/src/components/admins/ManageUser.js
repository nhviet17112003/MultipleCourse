import { useEffect, useState } from "react";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/all-users",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleUserStatus = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/set-status-user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const updatedUsers = users.map((user) =>
        user._id === id ? { ...user, status: !user.status } : user
      );
      setUsers(updatedUsers);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Avatar</th>
            <th className="border border-gray-300 px-4 py-2">Full Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Phone</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center border-b border-gray-300">
              <td className="border border-gray-300 px-4 py-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullname}
                    className="w-10 h-10 rounded-full mx-auto"
                  />
                ) : (
                  "No Avatar"
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.fullname}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.phone || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.role}</td>
              <td className="border border-gray-300 px-4 py-2">
                <span
                  className={
                    user.status
                      ? "bg-green-200 text-green-600 px-2 py-1 rounded"
                      : "bg-red-200 text-red-600 px-2 py-1 rounded"
                  }
                >
                  {user.status ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.role !== "Admin" && (
                  <button
                    onClick={() => toggleUserStatus(user._id)}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    {user.status ? "Ban" : "Unban"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUser;
