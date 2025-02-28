import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import useAuthStore from "../store/useAuthStore";
import { formatMessageTime } from "../utils/utils";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } =
    useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages when the selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Show loading skeleton while messages are being fetched
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)) // Sort by sentAt (oldest first)
          .map((message) => (
            <div
              key={`${message._id}-${message.tempId}`} // Unique key combining _id and tempId
              className={`chat ${
                message.tempId || message.senderId === authUser.id
                  ? "chat-end" // Force temp and authUser's messages to the right
                  : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser.id
                        ? authUser.profilePic || "/avatar.png"
                        : message.receiverProfile?.profilePicture ||
                          "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <span className="text-xs opacity-50 ml-1">
                  {message.sentAt && !isNaN(new Date(message.sentAt).getTime())
                    ? formatMessageTime(new Date(message.sentAt).getTime())
                    : message.status === "sending"
                    ? "Sending..."
                    : "Failed to send"}
                </span>
              </div>

              <div className="chat-bubble flex flex-col">
                {message.attachments && message.attachments.length > 0 && (
                  <div>
                    {message.attachments.map((attachment, idx) => (
                      <img
                        key={idx}
                        src={attachment}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    ))}
                  </div>
                )}

                {message.decryptedContent && <p>{message.decryptedContent}</p>}
              </div>
            </div>
          ))}
      </div>

      {/* Message Input */}
      <MessageInput />

      {/* Invisible div for scrolling to the bottom */}
      <div ref={messageEndRef}></div>
    </div>
  );
};

export default ChatContainer;
