const WINDOWS_FILE_TIME_OFFSET = 116444736000000000;
const WINDOWS_TICKS_PER_MS = 10000;

const normalizeString = (value) => (value ?? "").toString().toLocaleLowerCase("en-US");

export const getBookTimestamp = (book) => {
  if (!book) {
    return null;
  }
  const unixTimestamp = Number(book?.dateunix);
  if (Number.isFinite(unixTimestamp) && unixTimestamp > 0) {
    return unixTimestamp < 1e12 ? unixTimestamp * 1000 : unixTimestamp;
  }
  const windowsFileTime = Number(book?.dateread);
  if (Number.isFinite(windowsFileTime) && windowsFileTime > 0) {
    const millisSinceUnixEpoch =
      (windowsFileTime - WINDOWS_FILE_TIME_OFFSET) / WINDOWS_TICKS_PER_MS;
    return Number.isFinite(millisSinceUnixEpoch) ? millisSinceUnixEpoch : null;
  }
  return null;
};

const createStringComparator = (field, order) => (a, b) => {
  const valueA = normalizeString(a?.[field]);
  const valueB = normalizeString(b?.[field]);
  if (valueA === valueB) {
    return 0;
  }
  const comparison = valueA > valueB ? 1 : -1;
  return order === "asc" ? comparison : -comparison;
};

const createDateComparator = (order) => (a, b) => {
  const dateA = getBookTimestamp(a);
  const dateB = getBookTimestamp(b);
  if (dateA == null && dateB == null) {
    return 0;
  }
  if (dateA == null) {
    return order === "asc" ? 1 : -1;
  }
  if (dateB == null) {
    return order === "asc" ? -1 : 1;
  }
  if (dateA === dateB) {
    return 0;
  }
  const comparison = dateA > dateB ? 1 : -1;
  return order === "asc" ? comparison : -comparison;
};

export const sortBooks = (
  books,
  {
    sortBy = "date",
    titleSortOrder = "asc",
    authorSortOrder = "asc",
    dateSortOrder = "desc",
  } = {}
) => {
  if (!Array.isArray(books)) {
    return [];
  }
  if (books.length < 2) {
    return [...books];
  }

  const comparators = {
    title: createStringComparator("title", titleSortOrder),
    author: createStringComparator("author", authorSortOrder),
    date: createDateComparator(dateSortOrder),
  };

  const comparator = comparators[sortBy] || comparators.title;
  return [...books].sort(comparator);
};

export const formatDateRead = (book) => {
  if (!book) {
    return null;
  }

  const timestampMs = getBookTimestamp(book);
  if (timestampMs != null) {
    const date = new Date(timestampMs);
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

  if (book.dateread) {
    return String(book.dateread);
  }

  return null;
};
