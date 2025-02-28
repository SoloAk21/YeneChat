import { create } from "zustand";
import { axiosInstance } from "../utils/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch users dynamically from the backend
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");

      // Assuming '/users' endpoint returns the list of users
      set({ users: res.data.users });
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages dynamically based on the selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`); // Assuming '/messages/:id' returns messages
      set({ messages: res.data.messages });
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a message dynamically
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    // Create a temporary message with a unique tempId
    const tempMessage = {
      _id: Date.now(), // Temporary ID
      text: messageData.text,
      senderId: selectedUser._id,
      status: "sending",
      tempId: Date.now(), // Unique temporary ID
    };

    // Optimistically update the state by adding the temporary message
    set({ messages: [...messages, tempMessage] });

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      // Update the message with the server response
      set({
        messages: messages.map((msg) =>
          msg.tempId === tempMessage.tempId
            ? { ...msg, ...res.data, status: "sent" }
            : msg
        ),
      });
    } catch (error) {
      toast.error(error.response.data.message);

      // In case of error, mark the message as failed
      set({
        messages: messages.map((msg) =>
          msg.tempId === tempMessage.tempId ? { ...msg, status: "failed" } : msg
        ),
      });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
