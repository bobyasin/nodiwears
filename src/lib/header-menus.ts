const CLOSE_DELAY_MS = 140;

/**
 * Wires up the header dropdowns ([data-menu]): open on hover (mouse) or click/tap, close on
 * Escape, outside click or when focus leaves, and switch the active category in the mega menu.
 */
export function initMenus(root: ParentNode = document): void {
  const menus = Array.from(root.querySelectorAll<HTMLElement>('[data-menu]'));
  const canHover = typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover)').matches;

  function trigger(menu: HTMLElement): HTMLButtonElement | null {
    return menu.querySelector<HTMLButtonElement>('.menu-trigger');
  }

  function setOpen(menu: HTMLElement, open: boolean) {
    menu.classList.toggle('is-open', open);
    trigger(menu)?.setAttribute('aria-expanded', String(open));
  }

  function closeAll(except?: HTMLElement) {
    for (const menu of menus) {
      if (menu !== except) {
        setOpen(menu, false);
      }
    }
  }

  for (const menu of menus) {
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    trigger(menu)?.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');

      closeAll(menu);
      setOpen(menu, open);
    });

    if (canHover) {
      menu.addEventListener('mouseenter', () => {
        clearTimeout(closeTimer);
        closeAll(menu);
        setOpen(menu, true);
      });
      menu.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => setOpen(menu, false), CLOSE_DELAY_MS);
      });
    }

    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(menu, false);
        trigger(menu)?.focus();
      }
    });

    menu.addEventListener('focusout', (event) => {
      const next = event.relatedTarget;

      if (next instanceof Node && !menu.contains(next)) {
        setOpen(menu, false);
      }
    });

    const categories = Array.from(menu.querySelectorAll<HTMLElement>('.cat'));

    for (const category of categories) {
      const activate = () => {
        for (const other of categories) {
          other.classList.toggle('is-active', other === category);
        }
      };

      category.addEventListener('mouseenter', activate);
      category.addEventListener('focusin', activate);
    }
  }

  document.addEventListener('click', (event) => {
    const target = event.target;

    if (target instanceof Node && !menus.some((menu) => menu.contains(target))) {
      closeAll();
    }
  });
}
