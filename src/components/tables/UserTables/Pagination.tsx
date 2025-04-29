import Button from "../../ui/button/Button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");

    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center mt-6 space-x-1">
      <Button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700">
        Prev
      </Button>

      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-3 py-1 text-gray-500">
            ...
          </span>
        ) : (
          <Button key={index} onClick={() => typeof page === "number" && onPageChange(page)} className={`px-3 py-1 ${currentPage === page ? "bg-brand-500 text-white" : "bg-gray-300 dark:bg-gray-700"}`}>
            {page}
          </Button>
        )
      )}

      <Button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700">
        Next
      </Button>
    </div>
  );
};
