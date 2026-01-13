"use client";
import { useAuth } from "@/contexts/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="w-full flex items-center py-4 bg-white shadow-md">
      <ul className="flex gap-8 ml-auto mr-auto">
        <li>
          <a href="/" className="group flex flex-col items-center">
            <span className="rounded-full p-3 group-hover:bg-gray-200 transition">
              {/* Home/Generate Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
              </svg>
            </span>
            <span className="text-xs text-gray-500 mt-1">Generate</span>
          </a>
        </li>
        <li>
          <a href="/feed" className="group flex flex-col items-center">
            <span className="rounded-full p-3 group-hover:bg-gray-200 transition">
              {/* Feed Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15M4.5 12h15M4.5 17.25h15" />
              </svg>
            </span>
            <span className="text-xs text-gray-500 mt-1">Feed</span>
          </a>
        </li>
        <li>
          <a href="/chat" className="group flex flex-col items-center">
            <span className="rounded-full p-3 group-hover:bg-gray-200 transition">
              {/* Chat Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75h7.5m-7.5-3h7.5m-7.5-3h7.5M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4.5-1.07L3 21l1.07-4.5A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
            <span className="text-xs text-gray-500 mt-1">Chat</span>
          </a>
        </li>
        <li>
          <a href="/my-images" className="group flex flex-col items-center">
            <span className="rounded-full p-3 group-hover:bg-gray-200 transition">
              {/* My Images Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15M4.5 4.5h15v15h-15v-15z" />
              </svg>
            </span>
            <span className="text-xs text-gray-500 mt-1">My Images</span>
          </a>
        </li>
      </ul>
      <div className="flex items-center gap-4 ml-auto">
        {user && (
          <>
            <span className="text-sm text-gray-700 font-medium">{user.displayName || user.email}</span>
            <button
              onClick={logout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
