import { Server } from "socket.io";
import { NextResponse } from "next/server";

const globalForSocket = globalThis as unknown as { io?: Server };

export async function GET() {
  if (!globalForSocket.io) {
    globalForSocket.io = new Server({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    globalForSocket.io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("message", (data) => {
        console.log("Received message:", data);
        globalForSocket.io?.emit("message", data);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  return NextResponse.json({ status: "Socket.IO running" });
}
