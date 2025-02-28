import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { RefreshCcw } from "lucide-react";
import useAuthStore from "../store/useAuthStore";

function Sidebar() {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, []);

  if (isUsersLoading) return <div>Loading users...</div>;

  return (
    <aside className="h-full w-20 lg:w-72 bg-gray-200 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <h1 className="text-lg font-semibold">Contacts</h1>
        <button onClick={getUsers}>
          <RefreshCcw className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.map(({ _id, fullName, email, profilePicture, createdAt }) => (
          <div
            key={_id}
            className={`flex items-center p-4 gap-3 cursor-pointer ${
              selectedUser?._id === _id ? "bg-gray-300" : ""
            }`}
            onClick={() =>
              setSelectedUser({
                _id,
                fullName,
                email,
                profilePicture,
                createdAt,
              })
            }
          >
            <img
              src={profilePicture || "https://via.placeholder.com/150"} // fallback profile picture
              alt={fullName}
              className="w-10 h-10 rounded-full border border-gray-400"
            />
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold">{fullName}</h2>
              <p className="text-xs text-gray-600">
                {onlineUsers.includes(_id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
