'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  MENU_COOKIE_MAX_AGE,
  MENU_COOKIE_NAME,
  MENU_GROUPS_COOKIE_NAME,
  moveEntry,
  serializeClosedGroups,
  serializeMenuOrder,
  type MenuGroup,
  type MenuOrder,
} from '@/shared/menu-order';

type MenuOrderValue = {
  order: MenuOrder;
  move: (group: MenuGroup, index: number, delta: -1 | 1) => void;
  closed: readonly MenuGroup[];
  toggleGroup: (group: MenuGroup) => void;
};

const MenuOrderContext = createContext<MenuOrderValue | null>(null);

function saveCookie(name: string, value: string): void {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${value}; Max-Age=${MENU_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // The browser refused the cookie: the change still holds for this visit.
  }
}

// The main menu order is shared by the sidebar and the Dashboard cards; which groups are
// closed matters only to the sidebar.
export function MenuOrderProvider({
  initial,
  initialClosed,
  children,
}: {
  initial: MenuOrder;
  initialClosed: readonly MenuGroup[];
  children: ReactNode;
}) {
  const [order, setOrder] = useState(initial);
  const [closed, setClosed] = useState(initialClosed);

  const move = useCallback((group: MenuGroup, index: number, delta: -1 | 1) => {
    setOrder(
      (current) => ({ ...current, [group]: moveEntry(current[group], index, delta) }) as MenuOrder,
    );
  }, []);

  const toggleGroup = useCallback((group: MenuGroup) => {
    setClosed((current) =>
      current.includes(group) ? current.filter((g) => g !== group) : [...current, group],
    );
  }, []);

  // Cookies are written after a change, never on the first render.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) return;
    saveCookie(MENU_COOKIE_NAME, serializeMenuOrder(order));
  }, [order]);
  useEffect(() => {
    if (!mounted.current) return;
    saveCookie(MENU_GROUPS_COOKIE_NAME, serializeClosedGroups(closed));
  }, [closed]);
  useEffect(() => {
    mounted.current = true;
  }, []);

  const value = useMemo(
    () => ({ order, move, closed, toggleGroup }),
    [order, move, closed, toggleGroup],
  );
  return <MenuOrderContext.Provider value={value}>{children}</MenuOrderContext.Provider>;
}

export function useMenuOrder(): MenuOrderValue {
  const value = useContext(MenuOrderContext);
  if (!value) throw new Error('useMenuOrder used outside MenuOrderProvider');
  return value;
}
