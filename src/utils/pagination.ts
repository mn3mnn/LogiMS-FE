/**
 * Generates an array of page numbers to display in pagination
 * Shows ellipsis for large page counts to prevent UI crashes
 * 
 * @param currentPage - The current active page
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and 'ellipsis' markers
 */
export function generatePaginationPages(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  
  // Always show first page
  pages.push(1);

  if (currentPage <= 4) {
    // Near the start: show first 5 pages, then ellipsis, then last page
    for (let i = 2; i <= 5; i++) {
      pages.push(i);
    }
    // Only add ellipsis if there's a gap between page 5 and last page
    if (totalPages > 6) {
      pages.push('ellipsis');
    }
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    // Near the end: show first page, ellipsis, then last 5 pages
    // Only add ellipsis if there's a gap between first and last-4
    if (totalPages - 4 > 2) {
      pages.push('ellipsis');
    }
    for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // In the middle: show first, ellipsis, current-1, current, current+1, ellipsis, last
    // Only add first ellipsis if there's a gap
    if (currentPage - 1 > 2) {
      pages.push('ellipsis');
    } else if (currentPage - 1 === 2) {
      // If current-1 is 2, show it (we already have 1)
      pages.push(2);
    }
    
    // Add current page and neighbors
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    
    // Only add second ellipsis if there's a gap
    if (currentPage + 1 < totalPages - 1) {
      pages.push('ellipsis');
    }
    pages.push(totalPages);
  }

  return pages;
}

