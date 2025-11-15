function BookCardTools({
  titleSortOrder,
  authorSortOrder,
  dateSortOrder,
  onTitleSortToggle,
  onAuthorSortToggle,
  onDateSortToggle,
}) {
  return (
    <section className="viewBooks__actions">
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
    </section>
  );
}

export default BookCardTools;
