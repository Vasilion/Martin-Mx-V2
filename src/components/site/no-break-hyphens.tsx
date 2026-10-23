/** Renders text so hyphenated words ("US-131", "off-camber") wrap as a whole instead of at the hyphen. */
export function NoBreakHyphens({ text }: { text: string }) {
  return text.split(/(\S+-\S+)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
