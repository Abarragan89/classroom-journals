'use client'
import { useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchOptions } from "@/types";

interface Props {
    searchOptionsRef: React.RefObject<SearchOptions>;
    getFilteredSearch: (filterOptions: SearchOptions) => void;
    totalItems: number;  // Total number of items available
    itemsPerPage: number; // Number of items per page
}

export default function PaginationList({
    searchOptionsRef,
    getFilteredSearch,
    totalItems,
    itemsPerPage,
}: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        if (searchOptionsRef.current) {
            searchOptionsRef.current.paginationSkip = (page - 1) * itemsPerPage;
        }
        getFilteredSearch(searchOptionsRef.current);
    };

    const generatePaginationItems = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5; // Adjust as needed

        if (totalPages <= maxVisiblePages) {
            // Show all pages if totalPages is small
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1); // First page

            if (currentPage > 3) {
                pages.push("ellipsis-start"); // Ellipsis before middle pages
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis-end"); // Ellipsis after middle pages
            }

            pages.push(totalPages); // Last page
        }
        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); goToPage(currentPage - 1); }}
                    // disabled={currentPage === 1}
                    />
                </PaginationItem>

                {generatePaginationItems().map((item, index) =>
                    typeof item === "number" ? (
                        <PaginationItem key={index}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => { e.preventDefault(); goToPage(item); }}
                                className={currentPage === item ? "font-bold" : ""}
                            >
                                {item}
                            </PaginationLink>
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={index}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )
                )}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); goToPage(currentPage + 1); }}
                    // disabled={currentPage === totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
