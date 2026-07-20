import Image from "next/image";

interface ChatRoomHeaderProps {
  partner: {
    displayName: string | null;
    photoURL: string | null;
  };
  onBack: () => void;
}

export default function ChatRoomHeader({
  partner,
  onBack,
}: ChatRoomHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b p-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="返回"
        className="text-xl leading-none"
      >
        ←
      </button>

      {partner.photoURL ? (
        <Image
          src={partner.photoURL}
          alt={partner.displayName ?? "使用者頭像"}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-200" />
      )}

      <h1 className="font-bold">{partner.displayName ?? "使用者"}</h1>
    </div>
  );
}
