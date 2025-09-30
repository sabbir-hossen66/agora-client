"use client";

import { Check, CheckCheck, Clock, Loader2 } from "lucide-react";
import { forwardRef } from "react";

const MessageList = forwardRef(
  ({ messages, currentUserId, loadingHistory, onScroll }, ref) => {
    // Get message status icon
    const getStatusIcon = (status) => {
      switch (status) {
        case "sent":
          return <Check className="w-3 h-3" />;
        case "delivered":
          return <CheckCheck className="w-3 h-3" />;
        case "read":
          return <CheckCheck className="w-3 h-3 text-blue-400" />;
        default:
          return <Clock className="w-3 h-3 animate-pulse" />;
      }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (hours < 24) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
      const groups = {};

      messages.forEach((msg) => {
        const date = new Date(msg.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(msg);
      });

      return groups;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white scroll-smooth"
        style={{ height: "calc(100% - 140px)" }}
      >
        {/* Loading more indicator */}
        {loadingHistory && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading messages...
            </div>
          </div>
        )}

        {/* No messages yet */}
        {messages.length === 0 && !loadingHistory && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500">
              Start the conversation by sending a message
            </p>
          </div>
        )}

        {/* Messages grouped by date */}
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            {/* Date separator */}
            <div className="flex items-center justify-center my-6">
              <div className="px-4 py-1.5 bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                {date}
              </div>
            </div>

            {/* Messages */}
            {msgs.map((msg, index) => {
              const isSent = msg.senderId === currentUserId;
              const showAvatar =
                index === 0 || msgs[index - 1].senderId !== msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isSent ? "justify-end" : "justify-start"
                  } items-end gap-2 animate-fadeIn`}
                >
                  {/* Avatar for received messages */}
                  {!isSent && (
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-md ${
                        showAvatar ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {msg.senderId[0].toUpperCase()}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md transition-all hover:shadow-lg ${
                      isSent
                        ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {/* Message footer */}
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1.5 text-xs ${
                        isSent ? "text-purple-200" : "text-gray-500"
                      }`}
                    >
                      <span>{formatTime(msg.timestamp)}</span>
                      {isSent && (
                        <span className="flex items-center">
                          {getStatusIcon(msg.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avatar placeholder for sent messages (for alignment) */}
                  {isSent && <div className="w-8"></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
