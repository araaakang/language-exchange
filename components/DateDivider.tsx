interface DateDividerProps {
  label: string;
}

export default function DateDivider({ label }: DateDividerProps) {
  return (
    <div className="flex justify-center py-4">
      <span className="rounded-full bg-gray-100 px-4 py-1 text-xs font-medium text-gray-700 opacity-50">
        {label}
      </span>
    </div>
  );
}
