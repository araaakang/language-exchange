import { INTEREST_OPTIONS, Interest } from "@/types/user";

export interface InterestChipToggleProps {
  selected: Interest[];
  onToggle: (interest: Interest) => void;
  maxSelection?: number;
}

export default function InterestChipToggle({
  selected,
  onToggle,
  maxSelection,
}: InterestChipToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {INTEREST_OPTIONS.map((interest) => {
        const isSelected = selected.includes(interest);
        const disabled =
          !isSelected &&
          maxSelection !== undefined &&
          selected.length >= maxSelection;

        return (
          <button
            key={interest}
            type="button"
            onClick={() => onToggle(interest)}
            disabled={disabled}
            className={`rounded-full px-3 py-1 text-sm ${
              isSelected
                ? "border border-black bg-white text-black"
                : "bg-black text-white disabled:opacity-40"
            }`}
          >
            {interest}
          </button>
        );
      })}
    </div>
  );
}
