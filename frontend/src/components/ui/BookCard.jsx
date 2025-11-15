import { formatDateRead } from "../js/utils";

const cardStyles = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "1rem",
  backgroundColor: "#fff",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
};

const coverStyles = {
  width: "100%",
  height: "220px",
  objectFit: "contain",
  objectPosition: "center",
  borderRadius: "4px",
  marginBottom: "0.75rem",
  backgroundColor: "#f5f5f5",
};

const resolveCoverImage = (imageUrl) =>
  typeof imageUrl === "string" && imageUrl.trim().length ? imageUrl : null;

function BookCard({ book }) {
  if (!book) {
    return null;
  }
  const coverImage = resolveCoverImage(book.image);
  const dateRead = formatDateRead(book);

  return (
    <article style={cardStyles}>
      {coverImage && (
        <img
          src={coverImage}
          alt={book.title ? `Cover of ${book.title}` : "Book cover image"}
          loading="lazy"
          style={coverStyles}
        />
      )}
      <h3 style={{ margin: "0 0 0.5rem" }}>{book.title}</h3>
      <p style={{ margin: "0 0 0.25rem", color: "#555" }}>
        {book.author || "Unknown Author"}
      </p>
      {book.rating != null && (
        <p style={{ margin: 0, fontWeight: 600 }}>Rating: {book.rating}/5</p>
      )}
      {dateRead && (
        <p style={{ margin: "0.5rem 0 0", color: "#666" }}>Read: {dateRead}</p>
      )}
    </article>
  );
}

export default BookCard;
