import type { MenuCategory, MenuItem } from "./menu-data";

export type MenuFilter = "all" | MenuCategory;

export function normalizeMenuSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it-IT").replace(/[^a-z0-9]+/g, " ").trim();
}

export function findMenuItems(items: MenuItem[], category: MenuFilter, query: string): MenuItem[] {
  const terms = normalizeMenuSearch(query).split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    const text = normalizeMenuSearch([item.name, item.description, ...item.ingredients].join(" "));
    return terms.every((term) => text.includes(term));
  });
}
