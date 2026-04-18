// Inline script to apply theme BEFORE React hydrates — avoids flash of wrong theme.
// Injected into <head> via next/script with strategy="beforeInteractive".
export const themeInitScript = `
(function() {
  try {
    var key = 'estate-theme';
    var stored = localStorage.getItem(key);
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
