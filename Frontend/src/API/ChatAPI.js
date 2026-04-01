// Frontend/src/API/ChatAPI.js
import API from "./api";

/* ========================
   SEND AGENT MESSAGE
======================== */
export const sendReply = async (to, message, force = false) => {
  return await API.post("/agent/reply", {
    to,
    message,
    force,
  });
};

export const endSession = async (conversation_id) => {
  return await API.post("/agent/end", { conversation_id });
};

export const assignChat = async (conversation_id, force = false) => {
  return await API.post("/agent/assign", {
    conversation_id,
    force,
  });
};

export const reopenChat = async (conversation_id) => {
  return await API.post("/agent/reopen", { conversation_id });
};
/* ========================
   REOPEN CHAT
======================== */
/* ========================
   FETCH CONVERSATIONS
======================== */
export const fetchConversations = async () => {
  return await API.get("/webhook/conversations"); // ✅ no .data
};

/* ========================
   FETCH MESSAGES
======================== */
export const fetchMessages = async (conversation_id) => {
  return await API.get(
    `/webhook/conversations/${conversation_id}/messages`
  ); // ✅ no .data
};
/* ========================
   FETCH MESSAGES
======================== */
