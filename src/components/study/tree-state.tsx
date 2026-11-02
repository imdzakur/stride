'use client';

import type { ReactNode } from 'react';
import { useAppData } from '@/client/app-data';
import type { StudyTree } from '@/shared/types';
import { LoadError } from '../shell/load-error';
import pageStyles from '../shell/page.module.css';
import { TaskListSkeleton } from '../skeleton/skeleton';

// Renders children only once the tree is loaded; loading and failure share one look.
export function TreeState({ children }: { children: (tree: StudyTree) => ReactNode }) {
  const { status, tree, refresh } = useAppData();
  if (tree) return <>{children(tree)}</>;
  if (status === 'error') {
    return (
      <div className={`glass ${pageStyles.card}`}>
        <LoadError message="Could not load your study tree." onRetry={() => void refresh()} />
      </div>
    );
  }
  return (
    <div className={`glass ${pageStyles.card}`} aria-busy="true">
      <p className="sr-only">Loading data.</p>
      <TaskListSkeleton />
    </div>
  );
}

export function NotFoundCard({ message }: { message: string }) {
  return (
    <div className={`glass ${pageStyles.card}`}>
      <p className={pageStyles.empty}>{message}</p>
    </div>
  );
}
