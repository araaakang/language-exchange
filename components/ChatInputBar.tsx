import { useEffect, useRef } from "react";

const MAX_HEIGHT = 144; // px, ~6 lines (text-sm line-height 20px + py-2 padding 16px + border 2px)

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
  const isComposing = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight > MAX_HEIGHT) {
      textarea.style.height = `${MAX_HEIGHT}px`;
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    if (isComposing.current || e.nativeEvent.isComposing) return;

    e.preventDefault();
    onSend();
  };

  return (
    <div className="flex items-end gap-2 border-t p-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={() => {
          isComposing.current = false;
        }}
        placeholder="輸入訊息...（Shift + Enter 換行）"
        rows={1}
        className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm"
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
