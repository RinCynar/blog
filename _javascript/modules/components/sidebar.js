/**
 * Overlay navigation drawer for compact viewports.
 */

import { trapFocus } from './focus-trap';

const ATTR_DISPLAY = 'sidebar-display';

class SidebarUtil {
  static isExpanded = false;

  static trigger() {
    return document.getElementById('sidebar-trigger');
  }

  static drawer() {
    return document.getElementById('sidebar');
  }

  static setExpanded(open) {
    const body = document.body;
    const trigger = SidebarUtil.trigger();
    const drawer = SidebarUtil.drawer();

    SidebarUtil.isExpanded = open;

    if (open) {
      body.setAttribute(ATTR_DISPLAY, '');
    } else {
      body.removeAttribute(ATTR_DISPLAY);
    }

    if (trigger) {
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (drawer) {
      if (window.innerWidth < 900) {
        drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      } else {
        drawer.removeAttribute('aria-hidden');
      }
    }

    if (open) {
      const closeBtn = document.getElementById('sidebar-close');
      (closeBtn || drawer)?.focus?.();
    } else {
      trigger?.focus?.();
    }
  }

  static toggle() {
    SidebarUtil.setExpanded(!SidebarUtil.isExpanded);
  }

  static close() {
    if (SidebarUtil.isExpanded) {
      SidebarUtil.setExpanded(false);
    }
  }
}

export function sidebarExpand() {
  const trigger = SidebarUtil.trigger();
  const mask = document.getElementById('mask');
  const closeBtn = document.getElementById('sidebar-close');
  const drawer = SidebarUtil.drawer();

  if (window.innerWidth < 900) {
    drawer?.setAttribute('aria-hidden', 'true');
  }

  trigger?.addEventListener('click', () => SidebarUtil.toggle());
  closeBtn?.addEventListener('click', () => SidebarUtil.close());

  mask?.addEventListener('click', () => {
    SidebarUtil.close();
    document.body.removeAttribute('toc-sheet');
  });

  document.addEventListener('keydown', (event) => {
    if (!SidebarUtil.isExpanded) return;

    if (event.key === 'Escape') {
      SidebarUtil.close();
      return;
    }

    if (window.innerWidth < 900) {
      trapFocus(drawer, event);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) {
      SidebarUtil.close();
      drawer?.removeAttribute('aria-hidden');
    } else if (!SidebarUtil.isExpanded) {
      drawer?.setAttribute('aria-hidden', 'true');
    }
  });
}
