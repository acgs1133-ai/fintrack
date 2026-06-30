import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ToastContainer from "../ui/Toast";
import ChatWidget from "../assistente/ChatWidget";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <ToastContainer />
      <ChatWidget />
    </div>
  );
}
