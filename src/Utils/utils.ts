export const classMap = (...classes: (any)[]): string|undefined => {
  let out = "";
  for (const c of classes)
    if (Array.isArray(c)) out = classMap(out, ...c) || "";
    else if (c) out += " " + c;
  return out.trim() || undefined;
};