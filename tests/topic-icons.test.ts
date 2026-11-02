import { describe, expect, it } from 'vitest';
import { topicIcon } from '@/glyphs/topic-icons';
import { parsePanelOpen, serializePanelOpen } from '@/shared/panel';

describe('topic icons', () => {
  it.each([
    ['Java', 'java'],
    ['Python', 'python'],
    ['SQL', 'sql'],
    ['PostgreSQL', 'sql'],
    ['Git', 'git'],
    ['TypeScript', 'typescript'],
    ['Go', 'go'],
    ['Golang', 'go'],
    ['C#', 'csharp'],
    ['Docker', 'docker'],
    ['  java   basics ', 'java'],
  ])('matches %s', (title, name) => {
    expect(topicIcon(title)?.name).toBe(name);
  });

  it('does not match on a shared prefix or unknown names', () => {
    expect(topicIcon('JavaScript')).toBeNull();
    expect(topicIcon('Gopher')).toBeNull();
    expect(topicIcon('Linear algebra')).toBeNull();
  });
});

describe('topic panel cookie', () => {
  it('defaults to open and reads back what it wrote', () => {
    expect(parsePanelOpen(undefined)).toBe(true);
    expect(parsePanelOpen(serializePanelOpen(false))).toBe(false);
    expect(parsePanelOpen(serializePanelOpen(true))).toBe(true);
  });
});
