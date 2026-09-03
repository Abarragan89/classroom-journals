"use client"

import { createPortal } from "react-dom"
import { RubricFormData } from "@/types"

type RubricCategories = RubricFormData["categories"]

/* Printable area of a landscape letter page (11in x 8.5in) at the 0.4in
   margins declared by `@page` in globals.css. */
const PAGE_WIDTH_IN = 10.2
const PAGE_HEIGHT_IN = 7.7

/* Font sizes (pt) the auto-fit pass may choose from, largest first. */
const FONT_SIZES = [14, 13, 12, 11, 10, 9, 8]

/* Text metrics used to predict how tall the table will print. Calibrated
   against Chrome's actual output; see the notes on each constant. */
const CHAR_WIDTH_EM = 0.5 // average glyph advance for mixed-case prose
const BOLD_CHAR_WIDTH_EM = 0.55 // headings and category names run wider
const WRAP_SLACK = 1.15 // ragged-right wrapping wastes ~15% of each line
const LINE_HEIGHT = 1.35 // matches .rubric-print-layer
const CELL_LEADING_IN = 0.17 // cell padding (0.08in x 2) plus the row border
const CELL_INSET_IN = 0.2 // horizontal cell padding (0.1in x 2)
const TITLE_LEADING_IN = 0.22 // title margin, padding and rule
const HEADER_LEADING_IN = 0.12 // score-row padding plus border

/* Height a page is assumed to hold, leaving the estimate room to be wrong. */
const USABLE_PAGE_HEIGHT_IN = PAGE_HEIGHT_IN * 0.94
/* Rubrics that already need a page break are not blown up to headline sizes. */
const MULTI_PAGE_MAX_FONT = 12
/* Stretch rows to fill the page only when the rubric is comfortably short. */
const FILL_THRESHOLD = PAGE_HEIGHT_IN * 0.8
const FILL_TARGET = USABLE_PAGE_HEIGHT_IN
const MAX_ROW_HEIGHT_IN = 3

const ptToIn = (pt: number) => pt / 72

const estimateLines = (
    text: string,
    contentWidthIn: number,
    fontPt: number,
    charWidthEm: number = CHAR_WIDTH_EM
) => {
    const charsPerLine = Math.max(6, contentWidthIn / (ptToIn(fontPt) * charWidthEm))
    return String(text ?? "")
        .split("\n")
        .reduce(
            (lines, line) => lines + Math.max(1, Math.ceil((line.length / charsPerLine) * WRAP_SLACK)),
            0
        )
}

/* Leave the category column proportionally wider, but never wide enough to
   starve the criteria columns on rubrics with many score levels. */
const getCategoryColumnWidth = (columnCount: number) =>
    Math.max(12, Math.min(22, 110 / (columnCount + 1)))

/** Predicts the printed height of the rubric, in inches, at a given font size. */
const estimateLayout = (
    title: string,
    categories: RubricCategories,
    columnCount: number,
    fontPt: number
) => {
    const categoryWidth = (getCategoryColumnWidth(columnCount) / 100) * PAGE_WIDTH_IN
    const criteriaWidth = (PAGE_WIDTH_IN - categoryWidth) / columnCount

    const titleHeight =
        estimateLines(title, PAGE_WIDTH_IN, fontPt * 1.7, BOLD_CHAR_WIDTH_EM) *
            ptToIn(fontPt * 1.7) *
            1.2 +
        TITLE_LEADING_IN

    const headerHeight = ptToIn(fontPt * 1.5) * 1.1 + HEADER_LEADING_IN

    const rowHeights = categories.map(category => {
        const categoryHeight =
            estimateLines(
                category.name,
                categoryWidth - CELL_INSET_IN,
                fontPt * 1.05,
                BOLD_CHAR_WIDTH_EM
            ) * ptToIn(fontPt * 1.05)

        const criteriaHeight = (category.criteria ?? []).reduce((tallest, criterion) => {
            const height =
                estimateLines(criterion.description, criteriaWidth - CELL_INSET_IN, fontPt) *
                ptToIn(fontPt)
            return Math.max(tallest, height)
        }, 0)

        return Math.max(categoryHeight, criteriaHeight) * LINE_HEIGHT + CELL_LEADING_IN
    })

    const total = rowHeights.reduce((sum, height) => sum + height, titleHeight + headerHeight)

    return { titleHeight, headerHeight, rowHeights, total }
}

type EstimatedLayout = ReturnType<typeof estimateLayout>

/**
 * Packs the estimated rows into pages the way the print CSS does: whole rows
 * only, with the score header repeated at the top of every page.
 */
const estimatePageCount = ({ titleHeight, headerHeight, rowHeights }: EstimatedLayout) => {
    let pages = 1
    let used = titleHeight + headerHeight

    for (const height of rowHeights) {
        const isPageEmpty = used <= headerHeight
        if (!isPageEmpty && used + height > USABLE_PAGE_HEIGHT_IN) {
            pages += 1
            used = headerHeight
        }
        used += height
    }

    return pages
}

/**
 * Picks the font size, and optionally fixed row heights, that make the rubric
 * sit well on the paper: the largest size that still prints on the fewest
 * pages, and the biggest of all when the whole rubric fits on one.
 */
const getPrintLayout = (title: string, categories: RubricCategories, columnCount: number) => {
    // Largest size first, so the first match at a page count is the biggest one
    const layouts = FONT_SIZES.map(fontPt => {
        const layout = estimateLayout(title, categories, columnCount, fontPt)
        return { fontPt, layout, pages: estimatePageCount(layout) }
    })

    const fewestPages = Math.min(...layouts.map(({ pages }) => pages))
    const best =
        layouts.find(
            ({ fontPt, pages }) =>
                pages === fewestPages && (fewestPages === 1 || fontPt <= MULTI_PAGE_MAX_FONT)
        ) ?? layouts[layouts.length - 1]

    if (best.pages > 1 || best.layout.total > FILL_THRESHOLD) {
        return { fontPt: best.fontPt, rowHeights: null }
    }

    // Short rubrics look sparse hugging the top of the page, so spread the
    // leftover height across the rows. A row only ever grows past the height it
    // is given, so a low estimate costs whitespace, never clipped text.
    const extraPerRow = (FILL_TARGET - best.layout.total) / categories.length
    return {
        fontPt: best.fontPt,
        rowHeights: best.layout.rowHeights.map(height =>
            Math.min(height + extraPerRow, MAX_ROW_HEIGHT_IN)
        ),
    }
}

/**
 * Renders the rubric as a print-only document. It is portalled to <body> so no
 * scrolling/overflow container of the app can clip it across page breaks, and
 * `@media print` in globals.css hides everything else on the page.
 */
export default function RubricPrintView({ rubric }: { rubric: RubricFormData | null }) {
    // `rubric` is only set from a click handler, so this never renders on the server
    if (!rubric || typeof document === "undefined") return null

    const categories = rubric.categories ?? []
    const columnCount = categories.reduce(
        (max, category) => Math.max(max, category.criteria?.length ?? 0),
        0
    )

    if (!columnCount) return null

    // Highest score first, matching the editor's column order
    const columnIndexes = Array.from({ length: columnCount }, (_, i) => columnCount - 1 - i)
    const categoryColumnWidth = getCategoryColumnWidth(columnCount)
    const criteriaColumnWidth = (100 - categoryColumnWidth) / columnCount
    const { fontPt, rowHeights } = getPrintLayout(rubric.title, categories, columnCount)

    return createPortal(
        <div
            className="rubric-print-layer"
            style={{ ["--rubric-print-font-size" as string]: `${fontPt}pt` }}
            aria-hidden="true"
        >
            <h1 className="rubric-print-title">{rubric.title}</h1>
            <table className="rubric-print-table">
                <colgroup>
                    <col style={{ width: `${categoryColumnWidth}%` }} />
                    {columnIndexes.map(index => (
                        <col key={index} style={{ width: `${criteriaColumnWidth}%` }} />
                    ))}
                </colgroup>
                <thead>
                    <tr>
                        <th className="rubric-print-corner" scope="col">
                            <span className="rubric-print-corner-label">Category</span>
                        </th>
                        {columnIndexes.map(index => (
                            <th key={index} scope="col" className="rubric-print-score">
                                {index + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, catIdx) => (
                        <tr
                            key={`${category.name}-${catIdx}`}
                            style={rowHeights ? { height: `${rowHeights[catIdx].toFixed(2)}in` } : undefined}
                        >
                            <th scope="row" className="rubric-print-category">
                                {category.name}
                            </th>
                            {columnIndexes.map(index => (
                                <td key={index} className="rubric-print-criterion">
                                    {category.criteria?.[index]?.description ?? ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>,
        document.body
    )
}
