import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null; // ✅ Prevents crash if no user is selected

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profileImage || "/avatar.png"} // ✅ Fixed property name
                alt={selectedUser.username} // ✅ Fixed property name
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.username}</h3>{" "}
            {/* ✅ Fixed property name */}
            <p className="text-sm text-base-content/70">
              {selectedUser.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
