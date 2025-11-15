function BookCardTools({
  titleSortOrder,
  authorSortOrder,
  dateSortOrder,
  onTitleSortToggle,
  onAuthorSortToggle,
  onDateSortToggle,
  selectedYear,
  availableYears,
  onYearFilterChange,
  selectedAuthor,
  availableAuthors,
  onAuthorFilterChange,
}) {
  const yearOptions = Array.isArray(availableYears) ? availableYears : [];
  const authorOptions = Array.isArray(availableAuthors) ? availableAuthors : [];

  return (
    <section className="viewBooks__actions">
      <div style={{ marginRight: "1rem" }}>
        <label htmlFor="bookYearFilter" style={{ fontWeight: 600 }}>
          Filter by year:
        </label>
        <select
          id="bookYearFilter"
          value={selectedYear}
          onChange={(event) => onYearFilterChange(event.target.value)}
          style={{
            marginLeft: "0.5rem",
            padding: "0.4rem 0.5rem",
            minWidth: "140px",
          }}
        >
          <option value="all">All years</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginRight: "1rem" }}>
        <label htmlFor="bookAuthorFilter" style={{ fontWeight: 600 }}>
          Filter by author:
        </label>
        <select
          id="bookAuthorFilter"
          value={selectedAuthor}
          onChange={(event) => onAuthorFilterChange(event.target.value)}
          style={{
            marginLeft: "0.5rem",
            padding: "0.4rem 0.5rem",
            minWidth: "180px",
          }}
        >
          <option value="all">All authors</option>
          {authorOptions.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="viewBooks__sortButton"
          onClick={onTitleSortToggle}
        >
          Sort Title: {titleSortOrder === "asc" ? "A-Z" : "Z-A"}
        </button>
        <button
          type="button"
          className="viewBooks__sortButton"
          onClick={onAuthorSortToggle}
        >
          Sort Author: {authorSortOrder === "asc" ? "A-Z" : "Z-A"}
        </button>
        <button
          type="button"
          className="viewBooks__sortButton"
          onClick={onDateSortToggle}
        >
          Sort Date: {dateSortOrder === "desc" ? "Newest" : "Oldest"}
        </button>
      </div>
    </section>
  );
}

export default BookCardTools;
