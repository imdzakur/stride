import { topicIcon } from '@/glyphs/topic-icons';

type TopicIconProps = { title: string; size?: number; className?: string };

// The icon for a topic such as Java or Python, or nothing when the title names no known topic.
export function TopicIcon({ title, size = 16, className }: TopicIconProps) {
  const icon = topicIcon(title);
  if (!icon) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color: icon.color, flexShrink: 0 }}
      aria-hidden="true"
      focusable="false"
      // The source is only constants from src/glyphs/topic-icons.ts, never user input.
      dangerouslySetInnerHTML={{ __html: icon.markup }}
    />
  );
}

export function hasTopicIcon(title: string): boolean {
  return topicIcon(title) !== null;
}
