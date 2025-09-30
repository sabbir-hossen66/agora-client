"use client";

export default function TypingIndicator({ userName, isVisible }) {
  console.log("👀 TypingIndicator RENDER:", { isVisible, userName });

  if (!isVisible) return null;

  return (
    <div className="px-6 py-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold shadow-md">
          {userName ? userName[0].toUpperCase() : "U"}
        </div>

        <div className="bg-yellow-100 border border-yellow-300 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-md">
          <div className="flex items-center gap-1">
            <div className="bounce-dot"></div>
            <div
              className="bounce-dot"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="bounce-dot"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bounce-dot {
          width: 8px;
          height: 8px;
          background-color: #d97706;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
