// components/TypingIndicator.jsx
export default function TypingIndicator({ isVisible, userName }) {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl rounded-bl-none bg-white text-gray-800 border border-gray-200 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></span>
          </div>
          <span className="text-sm text-gray-600">{userName} is typing...</span>
        </div>
      </div>
    </div>
  );
}
