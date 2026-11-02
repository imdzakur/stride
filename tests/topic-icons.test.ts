import { describe, expect, it } from 'vitest';
import { topicIcon } from '@/glyphs/topic-icons';
import { parsePanelOpen, serializePanelOpen } from '@/shared/panel';

describe('topic icons', () => {
  it.each([
    ['Java', 'java'],
    ['Python', 'python'],
    ['SQL', 'sql'],
    ['PostgreSQL', 'postgres'],
    ['Git', 'git'],
    ['TypeScript', 'typescript'],
    ['Go', 'go'],
    ['Golang', 'go'],
    ['C#', 'csharp'],
    ['Docker', 'docker'],
    ['Terminal', 'terminal'],
    ['Postgres', 'postgres'],
    ['Maven', 'maven'],
    ['Spring Boot', 'spring'],
    ['Django', 'django'],
    ['Express.js', 'express'],
    ['.NET', 'dotnet'],
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

describe('topic panel width cookie', () => {
  it('keeps the width inside its limits and reads back what it wrote', async () => {
    const {
      PANEL_WIDTH_DEFAULT,
      PANEL_WIDTH_MAX,
      PANEL_WIDTH_MIN,
      parsePanelWidth,
      serializePanelWidth,
    } = await import('@/shared/panel');
    expect(parsePanelWidth(undefined)).toBe(PANEL_WIDTH_DEFAULT);
    expect(parsePanelWidth('abc')).toBe(PANEL_WIDTH_DEFAULT);
    expect(parsePanelWidth('-20')).toBe(PANEL_WIDTH_DEFAULT);
    expect(parsePanelWidth('100')).toBe(PANEL_WIDTH_MIN);
    expect(parsePanelWidth('9999')).toBe(PANEL_WIDTH_MAX);
    expect(parsePanelWidth(serializePanelWidth(301.6))).toBe(302);
  });
});
