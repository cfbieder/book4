import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationBar from "../common/NavigationBar";
import TitleBar from "../ui/TitleBar";
import Rest from "../js/rest";
import { formatDateRead } from "../js/utils";
import styles from "./BookDetails.module.css";

const FIELD_CONFIG = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "type", label: "Type" },
  { key: "rating", label: "Rating", type: "number", min: 0, max: 5 },
  { key: "dateread", label: "Date Read", type: "number" },
  { key: "image", label: "Cover Image URL" },
  { key: "review", label: "Review", textarea: true },
  { key: "comments", label: "Comments", textarea: true },
];

const coerceValue = (value) => (value == null ? "" : String(value));

const buildPayload = (formState) => {
  const payload = {};
  Object.entries(formState || {}).forEach(([key, value]) => {
    if (value === "" || value == null) {
      payload[key] = "";
      return;
    }
    if (["rating", "dateread", "dateunix"].includes(key)) {
      const numericValue = Number(value);
      payload[key] = Number.isFinite(numericValue) ? numericValue : "";
      return;
    }
    payload[key] = value;
  });
  return payload;
};


function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [isSessionValid, setIsSessionValid] = useState(null);
  const [book, setBook] = useState(null);
  const [formState, setFormState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const formattedDateRead = book ? formatDateRead(book) : null;
  const hasUnsavedChanges = Boolean(
    book &&
      formState &&
      FIELD_CONFIG.some(
        ({ key }) => coerceValue(book[key]) !== coerceValue(formState[key])
      )
  );

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    Rest.validateUserSession(token).then((result) => {
      setIsSessionValid(Boolean(result));
    });
  }, []);

  useEffect(() => {
    if (isSessionValid === false) {
      navigate("/login", { replace: true });
    }
  }, [isSessionValid, navigate]);

  useEffect(() => {
    if (!bookId || !isSessionValid) {
      return;
    }
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        setError("");
        const details = await Rest.getBook(bookId);
        if (!details?._id) {
          throw new Error("Book not found.");
        }
        setBook(details);
        setFormState(
          FIELD_CONFIG.reduce((acc, field) => {
            acc[field.key] = coerceValue(details[field.key]);
            return acc;
          }, {})
        );
      } catch (err) {
        setError(err?.message || "Failed to load book.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId, isSessionValid]);

  const handleInputChange = (key) => (event) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...(prev || {}), [key]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!bookId || !formState) {
      return;
    }
    try {
      setIsSaving(true);
      setError("");
      const payload = buildPayload(formState);
      const updated = await Rest.updateBook(bookId, payload);
      setBook(updated);
      setFormState(
        FIELD_CONFIG.reduce((acc, field) => {
          acc[field.key] = coerceValue(updated[field.key]);
          return acc;
        }, {})
      );
      setIsEditing(false);
    } catch (err) {
      setError(err?.message || "Failed to update book.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bookId) {
      return;
    }
    const confirmDelete = window.confirm(
      "Delete this book permanently? This action cannot be undone."
    );
    if (!confirmDelete) {
      return;
    }
    try {
      setIsDeleting(true);
      setError("");
      await Rest.deleteBook(bookId);
      navigate("/books", { replace: true });
    } catch (err) {
      setError(err?.message || "Failed to delete book.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isSessionValid) {
    return null;
  }
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <NavigationBar onNavigate={(path) => navigate(path)} />
      <main style={{ padding: "2rem", flex: 1 }}>
        <TitleBar title="Book Details" />
        {error && (
          <p role="alert" style={{ color: "#c00", fontWeight: 600 }}>
            {error}
          </p>
        )}
        {isLoading ? (
          <p>Loading book...</p>
        ) : !book ? (
          <p>Book details unavailable.</p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/books")}
                className={styles.primaryButton}
              >
                Back to book list
              </button>
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className={styles.primaryButton}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ color: "#fff", backgroundColor: "#c00" }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
            {isEditing && formState ? (
              <form onSubmit={handleSave} style={{ maxWidth: "600px" }}>
                {FIELD_CONFIG.map((field) => (
                  <label
                    key={field.key}
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ display: "block", marginBottom: "0.25rem" }}>
                      {field.label}
                    </span>
                    {field.textarea ? (
                      <textarea
                        value={formState[field.key] ?? ""}
                        onChange={handleInputChange(field.key)}
                        rows={4}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        min={field.min}
                        max={field.max}
                        value={formState[field.key] ?? ""}
                        onChange={handleInputChange(field.key)}
                        style={{ width: "100%" }}
                      />
                    )}
                  </label>
                ))}
                <button
                  type="submit"
                  disabled={isSaving}
                  style={
                    hasUnsavedChanges
                      ? { backgroundColor: "#ffd600", color: "#000" }
                      : undefined
                  }
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <article
                style={{
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  maxWidth: "700px",
                }}
              >
                {book.image && (
                  <img
                    src={book.image}
                    alt={book.title ? `Cover of ${book.title}` : "Book cover"}
                    style={{
                      width: "220px",
                      height: "320px",
                      objectFit: "contain",
                      marginBottom: "1rem",
                      display: "block",
                    }}
                  />
                )}
                <dl style={{ margin: 0 }}>
                  {FIELD_CONFIG.map((field) => {
                    const hasValue =
                      book[field.key] != null && book[field.key] !== "";
                    const value =
                      field.key === "dateread" && formattedDateRead
                        ? formattedDateRead
                        : hasValue
                        ? book[field.key]
                        : "—";
                    return (
                      <div key={field.key} style={{ marginBottom: "0.75rem" }}>
                        <dt style={{ fontWeight: 600 }}>{field.label}</dt>
                        <dd style={{ margin: 0 }}>{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </article>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default BookDetails;
