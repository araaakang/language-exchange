interface MessageBubbleProps {
  text: string;
  createdAt: Date;
  isOwn: boolean;
}

export default function MessageBubble({
  text,
  createdAt,
  isOwn,
}: MessageBubbleProps) {
  const time = createdAt.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-black"
          }`}
        >
          {text}
        </div>
        <span className="mt-1 text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
}
