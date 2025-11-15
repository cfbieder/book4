export const formatDateRead = (book) => {
  if (!book) {
    return null;
  }

  const { dateunix, dateread } = book;
  const unixTimestamp = typeof dateunix === "number" ? dateunix : Number(dateunix);
  if (Number.isFinite(unixTimestamp) && unixTimestamp > 0) {
    const timestampMs = unixTimestamp < 1e12 ? unixTimestamp * 1000 : unixTimestamp;
    const date = new Date(timestampMs);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  const windowsFileTime = typeof dateread === "number" ? dateread : Number(dateread);
  if (Number.isFinite(windowsFileTime) && windowsFileTime > 0) {
    const millisSinceUnixEpoch = (windowsFileTime - 116444736000000000) / 10000;
    if (millisSinceUnixEpoch > 0) {
      const date = new Date(millisSinceUnixEpoch);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      const year = date.getUTCFullYear();
      if (Number.isFinite(year)) {
        return String(year);
      }
    }
  }

  if (dateread) {
    return String(dateread);
  }

  return null;
};
