export const classMap = (...classes: (any)[]): string|undefined => {
  let out = "";
  for (const c of classes)
    if (Array.isArray(c)) out = classMap(out, ...c) || "";
    else if (c) out += " " + c;
  return out.trim() || undefined;
};

export function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

export function getAsset(publicPath: string): string {
  return process.env.PUBLIC_URL + "/Assets" + (publicPath.startsWith("/") ? publicPath : `/${publicPath}`);
}