interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function ChatInputBar({
  value,
  onChange,
  onSend,
}: ChatInputBarProps) {
  return (
    <div className="flex items-center gap-2 border-t p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="輸入訊息..."
        className="flex-1 rounded-lg border px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={onSend}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
      >
        送出
      </button>
    </div>
  );
}
