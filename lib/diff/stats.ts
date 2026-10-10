export function diffStats(before: string, after: string) {
  const a = before.split("\n");
  const b = after.split("\n");
  const shared = lcsLength(a, b);
  return {
    additions: b.length - shared,
    deletions: a.length - shared,
  };
}

function lcsLength(a: string[], b: string[]) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  let previous = new Uint16Array(cols);
  let current = new Uint16Array(cols);

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      current[j] =
        a[i - 1] === b[j - 1]
          ? previous[j - 1] + 1
          : Math.max(previous[j], current[j - 1]);
    }
    [previous, current] = [current, previous];
    current.fill(0);
  }

  return previous[cols - 1];
}
