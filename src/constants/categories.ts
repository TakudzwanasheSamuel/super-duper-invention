/**
 * Material Icons (from @expo/vector-icons / MaterialIcons) names used across the app
 * for category visuals. Stored in the SQLite `categories.icon_name` column.
 *
 * If you add new presets here, make sure the name is a valid MaterialIcons glyph.
 */

export const DEFAULT_CATEGORY_ICON = 'category';

/** Suggested icon for well-known seeded categories. */
export const CategoryIcons: Record<string, string> = {
  Groceries: 'shopping-cart',
  Tech: 'computer',
  Subscriptions: 'subscriptions',
  Transport: 'directions-car',
  Income: 'attach-money',
  Salary: 'attach-money',
  Savings: 'savings',
  Food: 'restaurant',
  Rent: 'home',
  Utilities: 'flash-on',
  Health: 'favorite',
  Entertainment: 'movie',
};

/** Options offered in the in-app icon picker (CategoryManager). */
export const CategoryIconOptions: { name: string; label: string }[] = [
  { name: 'category', label: 'General' },
  { name: 'shopping-cart', label: 'Groceries' },
  { name: 'restaurant', label: 'Food' },
  { name: 'home', label: 'Home' },
  { name: 'flash-on', label: 'Utilities' },
  { name: 'computer', label: 'Tech' },
  { name: 'subscriptions', label: 'Subs' },
  { name: 'directions-car', label: 'Transport' },
  { name: 'flight', label: 'Travel' },
  { name: 'attach-money', label: 'Income' },
  { name: 'savings', label: 'Savings' },
  { name: 'favorite', label: 'Health' },
  { name: 'movie', label: 'Fun' },
  { name: 'school', label: 'School' },
];

/**
 * Pick a sensible default icon for a category name. Falls back to a generic
 * "category" icon when no preset matches.
 */
export function getDefaultIconForCategory(name: string): string {
  return CategoryIcons[name] ?? DEFAULT_CATEGORY_ICON;
}
