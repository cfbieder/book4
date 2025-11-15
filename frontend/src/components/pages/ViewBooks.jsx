import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rest from "../js/rest";
import NavigationBar from "../common/NavigationBar";
import TitleBar from "../ui/TitleBar";
import BookCard from "../ui/BookCard";
import BookCardTools from "../ui/BookCardTools";
import Pagination from "../ui/Pagination";
import "./ViewBooks.css";

const BOOKS_PER_PAGE = 12;
const WINDOWS_FILE_TIME_OFFSET = 116444736000000000;
const WINDOWS_TICKS_PER_MS = 10000;

const getBookTimestamp = (book) => {
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

function ViewBooks() {
  const [isSessionValid, setIsSessionValid] = useState(null);
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [titleSortOrder, setTitleSortOrder] = useState("asc");
  const [dateSortOrder, setDateSortOrder] = useState("desc");
  const [authorSortOrder, setAuthorSortOrder] = useState("asc");
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const token = sessionStorage.getItem("token");
      const validationResult = await Rest.validateUserSession(token);
      setIsSessionValid(Boolean(validationResult));
    };

    verifySession();
  }, []);

  useEffect(() => {
    if (isSessionValid === false) {
      navigate("/login", { replace: true });
    }

    if (isSessionValid) {
      const fetchBooks = async () => {
        setIsLoading(true);
        setError("");
        try {
          const data = await Rest.getBooks();
          setBooks(Array.isArray(data) ? data : []);
          setCurrentPage(1);
        } catch (err) {
          setError(err?.message || "Unable to load books.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchBooks();
    }
  }, [isSessionValid, navigate]);

  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);


  const sortedBooks = useMemo(() => {
    const normalize = (value) =>
      (value || "").toString().toLocaleLowerCase("en-US");
    const compareTitles = (a, b) => {
      const aTitle = normalize(a.title);
      const bTitle = normalize(b.title);
      if (aTitle === bTitle) {
        return 0;
      }
      const comparison = aTitle > bTitle ? 1 : -1;
      return titleSortOrder === "asc" ? comparison : -comparison;
    };

    const compareAuthors = (a, b) => {
      const aAuthor = normalize(a.author);
      const bAuthor = normalize(b.author);
      if (aAuthor === bAuthor) {
        return 0;
      }
      const comparison = aAuthor > bAuthor ? 1 : -1;
      return authorSortOrder === "asc" ? comparison : -comparison;
    };

    const compareDates = (a, b) => {
      const aDate = getBookTimestamp(a);
      const bDate = getBookTimestamp(b);
      if (aDate == null && bDate == null) {
        return 0;
      }
      if (aDate == null) {
        return dateSortOrder === "asc" ? 1 : -1;
      }
      if (bDate == null) {
        return dateSortOrder === "asc" ? -1 : 1;
      }
      if (aDate === bDate) {
        return 0;
      }
      const comparison = aDate > bDate ? 1 : -1;
      return dateSortOrder === "asc" ? comparison : -comparison;
    };

    const sorter =
      sortBy === "date"
        ? compareDates
        : sortBy === "author"
        ? compareAuthors
        : compareTitles;
    return [...books].sort(sorter);
  }, [books, sortBy, titleSortOrder, authorSortOrder, dateSortOrder]);

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * BOOKS_PER_PAGE;
    return sortedBooks.slice(start, start + BOOKS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  const handleTitleSortToggle = () => {
    setSortBy("title");
    setTitleSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleDateSortToggle = () => {
    setSortBy("date");
    setDateSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleAuthorSortToggle = () => {
    setSortBy("author");
    setAuthorSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (!isSessionValid) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <NavigationBar onNavigate={(path) => navigate(path)} />
      <main style={{ padding: "2rem", flex: 1 }}>
        <TitleBar title="View Books" />
        <BookCardTools
          titleSortOrder={titleSortOrder}
          dateSortOrder={dateSortOrder}
          onTitleSortToggle={handleTitleSortToggle}
          authorSortOrder={authorSortOrder}
          onAuthorSortToggle={handleAuthorSortToggle}
          onDateSortToggle={handleDateSortToggle}
        />
        {error && (
          <p role="alert" style={{ color: "#c00", fontWeight: 600 }}>
            {error}
          </p>
        )}
        {isLoading ? (
          <p>Loading books...</p>
        ) : books.length === 0 ? (
          <p>No books available.</p>
        ) : (
          <section className="viewBooks__grid">
            {paginatedBooks.map((book) => (
              <BookCard
                key={book._id || `${book.title}-${book.author}`}
                book={book}
              />
            ))}
          </section>
        )}
        {books.length > BOOKS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}

export default ViewBooks;
