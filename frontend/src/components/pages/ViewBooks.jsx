import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rest from "../js/rest";
import { getBookTimestamp, sortBooks } from "../js/utils";
import NavigationBar from "../common/NavigationBar";
import TitleBar from "../ui/TitleBar";
import BookCard from "../ui/BookCard";
import BookCardTools from "../ui/BookCardTools";
import Pagination from "../ui/Pagination";
import "./ViewBooks.css";

const BOOKS_PER_PAGE = 12;

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
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
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

  const availableYears = useMemo(() => {
    if (!Array.isArray(books) || books.length === 0) {
      return [];
    }
    const years = new Set();
    books.forEach((book) => {
      const timestamp = getBookTimestamp(book);
      if (timestamp == null) {
        return;
      }
      const year = new Date(timestamp).getUTCFullYear();
      if (Number.isFinite(year)) {
        years.add(year);
      }
    });
    return Array.from(years)
      .sort((a, b) => b - a)
      .map(String);
  }, [books]);

  const availableAuthors = useMemo(() => {
    if (!Array.isArray(books) || books.length === 0) {
      return [];
    }
    const authors = new Set();
    books.forEach((book) => {
      const author = (book?.author || "").trim();
      if (author) {
        authors.add(author);
      }
    });
    return Array.from(authors).sort((a, b) => a.localeCompare(b));
  }, [books]);

  useEffect(() => {
    if (selectedYear !== "all" && !availableYears.includes(selectedYear)) {
      setSelectedYear("all");
      setCurrentPage(1);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (
      selectedAuthor !== "all" &&
      !availableAuthors.includes(selectedAuthor)
    ) {
      setSelectedAuthor("all");
      setCurrentPage(1);
    }
  }, [availableAuthors, selectedAuthor]);

  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) {
      return [];
    }
    return books.filter((book) => {
      if (selectedAuthor !== "all") {
        const author = (book?.author || "").trim();
        if (author !== selectedAuthor) {
          return false;
        }
      }
      if (selectedYear === "all") {
        return true;
      }
      const timestamp = getBookTimestamp(book);
      if (timestamp == null) {
        return false;
      }
      const year = new Date(timestamp).getUTCFullYear();
      return Number.isFinite(year) && String(year) === selectedYear;
    });
  }, [books, selectedYear, selectedAuthor]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooks.length / BOOKS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);


  const sortedBooks = useMemo(() => {
    return sortBooks(filteredBooks, {
      sortBy,
      titleSortOrder,
      authorSortOrder,
      dateSortOrder,
    });
  }, [filteredBooks, sortBy, titleSortOrder, authorSortOrder, dateSortOrder]);

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * BOOKS_PER_PAGE;
    return sortedBooks.slice(start, start + BOOKS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  const handleYearFilterChange = (nextYear) => {
    setSelectedYear(nextYear);
    setCurrentPage(1);
  };

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

  const handleAuthorFilterChange = (nextAuthor) => {
    setSelectedAuthor(nextAuthor);
    setCurrentPage(1);
  };

  const handleBookOpen = (bookId) => {
    if (!bookId) {
      return;
    }
    navigate(`/books/${bookId}`);
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
          selectedYear={selectedYear}
          availableYears={availableYears}
          onYearFilterChange={handleYearFilterChange}
          selectedAuthor={selectedAuthor}
          availableAuthors={availableAuthors}
          onAuthorFilterChange={handleAuthorFilterChange}
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
        ) : filteredBooks.length === 0 ? (
          <p>
            {selectedYear === "all" && selectedAuthor === "all"
              ? "No books available."
              : "No books match the selected filters."}
          </p>
        ) : (
          <section className="viewBooks__grid">
            {paginatedBooks.map((book) => (
              <BookCard
                key={book._id || `${book.title}-${book.author}`}
                book={book}
                onDoubleClick={() => handleBookOpen(book._id)}
              />
            ))}
          </section>
        )}
        {filteredBooks.length > BOOKS_PER_PAGE && (
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
