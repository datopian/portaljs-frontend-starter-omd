import { TagIcon } from "@heroicons/react/20/solid";

export function Chip({ text, tooltip }: { text: string; tooltip?: string }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-neutral-200 px-3 py-1 text-neutral-700" title={tooltip}>
      <TagIcon className="inline w-3 h-3" /> {text}
    </span>
  );
}
