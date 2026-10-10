export const INSTALLATION_COOKIE = "apisync_installation";

export function readInstallationId(value: string | undefined) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}
