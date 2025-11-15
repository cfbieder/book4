function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages) {
    return null;
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        marginTop: "1.5rem",
      }}
    >
      <button
        type="button"
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        style={{ padding: "0.4rem 0.8rem" }}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        style={{ padding: "0.4rem 0.8rem" }}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
