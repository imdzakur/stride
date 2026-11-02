'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  MENU_COOKIE_MAX_AGE,
  MENU_COOKIE_NAME,
  moveEntry,
  serializeMenuOrder,
  type MenuGroup,
  type MenuOrder,
} from '@/shared/menu-order';

type MenuOrderValue = {
  order: MenuOrder;
  move: (group: MenuGroup, index: number, delta: -1 | 1) => void;
};

const MenuOrderContext = createContext<MenuOrderValue | null>(null);

function saveMenuOrder(order: MenuOrder): void {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${MENU_COOKIE_NAME}=${serializeMenuOrder(order)}; Max-Age=${MENU_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // The browser refused the cookie: the new order still holds for this visit.
  }
}

// The main menu order is shared by the sidebar and the Dashboard cards.
export function MenuOrderProvider({
  initial,
  children,
}: {
  initial: MenuOrder;
  children: ReactNode;
}) {
  const [order, setOrder] = useState(initial);

  const move = useCallback(
    (group: MenuGroup, index: number, delta: -1 | 1) => {
      const next = { ...order, [group]: moveEntry(order[group], index, delta) } as MenuOrder;
      setOrder(next);
      saveMenuOrder(next);
    },
    [order],
  );

  const value = useMemo(() => ({ order, move }), [order, move]);
  return <MenuOrderContext.Provider value={value}>{children}</MenuOrderContext.Provider>;
}

export function useMenuOrder(): MenuOrderValue {
  const value = useContext(MenuOrderContext);
  if (!value) throw new Error('useMenuOrder used outside MenuOrderProvider');
  return value;
}
