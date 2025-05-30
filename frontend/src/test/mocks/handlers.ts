import { http, HttpResponse } from "msw";

const mockAuthUser = {
  _id: "user-1",
  fullName: "Test User",
  email: "test@example.com",
  profilePic: "/avatar.png",
};

const mockUsers = [
  {
    _id: "user-2",
    fullName: "Jane Doe",
    email: "jane@example.com",
    profilePic: "/avatar.png",
  },
  {
    _id: "user-3",
    fullName: "John Smith",
    email: "john@example.com",
    profilePic: "/avatar.png",
  },
];

const mockMessages = [
  {
    _id: "msg-1",
    text: "Hello there!",
    senderId: "user-1",
    createdAt: "2025-05-30T14:30:00.000Z",
  },
  {
    _id: "msg-2",
    text: "Hi! How are you?",
    senderId: "user-2",
    createdAt: "2025-05-30T14:31:00.000Z",
  },
  {
    _id: "msg-3",
    text: "I'm doing great!",
    senderId: "user-1",
    createdAt: "2025-05-30T14:32:00.000Z",
  },
];

export const handlers = [
  http.get("http://localhost:5001/api/auth/check", () => {
    return HttpResponse.json(mockAuthUser);
  }),

  http.post("http://localhost:5001/api/auth/signup", async () => {
    return HttpResponse.json(mockAuthUser);
  }),

  http.post("http://localhost:5001/api/auth/login", async () => {
    return HttpResponse.json(mockAuthUser);
  }),

  http.post("http://localhost:5001/api/auth/logout", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  http.put("http://localhost:5001/api/auth/update-profile", () => {
    return HttpResponse.json({
      ...mockAuthUser,
      profilePic: "/updated-avatar.png",
    });
  }),

  http.get("http://localhost:5001/api/messages/users", () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get("http://localhost:5001/api/messages/:userId", () => {
    return HttpResponse.json(mockMessages);
  }),

  http.post(
    "http://localhost:5001/api/messages/send/:userId",
    async ({ request }) => {
      const body = await request.text();

      return HttpResponse.json({
        _id: "new-msg-id",
        text: body,
        senderId: "user-1",
        createdAt: new Date().toISOString(),
      });
    }
  ),
];
