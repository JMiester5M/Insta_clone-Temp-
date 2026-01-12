"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import NavBar from "@/components/NavBar";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch user list for search (from Firestore 'users' collection)
  useEffect(() => {
    if (!user) return;
    async function fetchUsers() {
      const usersRef = collection(db, "users");
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email !== user.email) {
          userList.push({ email: data.email, displayName: data.displayName || data.email });
        }
      });
      setUsers(userList);
    }
    fetchUsers();
  }, [user]);

  // Real-time message listener for selected recipient
  useEffect(() => {
    if (!user || !recipient) {
      setMessages([]);
      return;
    }
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("participants", "array-contains", user.email),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only show messages between current user and selected recipient
        if (
          (data.sender === user.email && data.recipient === recipient) ||
          (data.sender === recipient && data.recipient === user.email)
        ) {
          msgs.push(data);
        }
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user, recipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    if (!recipient) {
      setError("Please select a recipient.");
      return;
    }
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        sender: user.email,
        recipient,
        text: input,
        timestamp: serverTimestamp(),
        participants: [user.email, recipient],
      });
      setInput("");
    } catch (err) {
      setError("Failed to send message.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Main Chat Content */}
        <div className="flex flex-col items-center justify-center px-4 py-8">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Chat</h1>
            <div className="mb-4">
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient
              </label>
              <input
                id="userSearch"
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 mb-2"
                placeholder="Search users by username or email..."
              />
              <div className="max-h-32 overflow-y-auto border rounded bg-white shadow-sm">
                {users
                  .filter((u) => {
                    const search = userSearch.toLowerCase();
                    return (
                      (u.displayName && u.displayName.toLowerCase().includes(search)) ||
                      (u.email && u.email.toLowerCase().includes(search))
                    );
                  })
                  .map((u) => (
                    <div
                      key={u.email}
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${recipient === u.email ? "bg-blue-50" : ""}`}
                      onClick={() => setRecipient(u.email)}
                    >
                      <span className="font-medium">{u.displayName}</span>
                      <span className="text-xs text-gray-500 ml-2">{u.email}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 border rounded-lg bg-gray-50 p-4" style={{ minHeight: 200, maxHeight: 300 }}>
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center">No messages yet.</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 flex ${msg.sender === user.email ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender === user.email ? "bg-blue-100 text-blue-900" : "bg-gray-200 text-gray-800"}`}>
                      <div className="text-xs text-gray-500 mb-1">{msg.sender === user.email ? "You" : msg.sender}</div>
                      <div>{msg.text}</div>
                      <div className="text-[10px] text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg mb-2">{error}</div>}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Type your message..."
                disabled={!recipient}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!input.trim() || !recipient}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
