"use client";

import { useState, useEffect } from "react";
import * as agoraChatService from "@/lib/agoraChatService";
import { User } from "lucide-react";

export default function ConversationList({ currentUserId, onSelectChat }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    // Load all past conversations when component mounts
    const loadConversations = async () => {
      try {
        // ✅ fetchAllConversations এর বদলে সরাসরি Agora client ব্যবহার করো
        const result = await agoraChatService.client.getConversationList();
        setConversations(result?.data || []);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    loadConversations();

    // New message listener - update conversation list
    const handleMessageReceived = (message) => {
      setConversations((prev) => {
        const exists = prev.find((c) => c.peerId === message.from);
        if (exists) {
          // move updated conversation to top
          return [
            {
              peerId: message.from,
              lastMessage: message.msg || message.text,
              timestamp: message.time,
            },
            ...prev.filter((c) => c.peerId !== message.from),
          ];
        } else {
          // add new conversation
          return [
            {
              peerId: message.from,
              lastMessage: message.msg || message.text,
              timestamp: message.time,
            },
            ...prev,
          ];
        }
      });
    };

    // ✅ listener attach
    agoraChatService.onMessageReceived(handleMessageReceived);

    return () => {
      agoraChatService.removeMessageListener(handleMessageReceived);
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Conversations</h2>

      {conversations.length === 0 && (
        <p className="text-gray-500 text-center">No conversations yet</p>
      )}

      <ul className="divide-y divide-gray-200">
        {conversations.map((c) => (
          <li
            key={c.peerId}
            onClick={() => onSelectChat(c.peerId)}
            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{c.peerId}</p>
                <p className="text-sm text-gray-500 truncate max-w-[180px]">
                  {c.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {formatTime(c.timestamp)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
