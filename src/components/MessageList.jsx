"use client";

import { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom যখন নতুন message আসবে
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>এখনো কোনো message নেই</p>
          <p className="text-sm mt-2">একটা message পাঠাও শুরু করতে! 💬</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          // নিজের message কিনা check করা
          const isOwnMessage = msg.senderId === currentUserId;

          return (
            <div
              key={index}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString("bn-BD", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
