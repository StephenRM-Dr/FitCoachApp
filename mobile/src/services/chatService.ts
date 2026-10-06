import api from "./api";
import { Message } from "../types";

export const chatService = {
  getMessages: async (params: { clientId?: number; perPage?: number }) => {
    const response = await api.get("/messages", {
      params: { client_id: params.clientId, per_page: params.perPage ?? 50 },
    });
    return response.data.data as Message[];
  },

  sendMessage: async (data: { clientId?: number; body: string }) => {
    const response = await api.post("/messages", {
      client_id: data.clientId,
      body: data.body,
    });
    return response.data as Message;
  },
};
