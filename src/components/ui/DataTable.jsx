import { cn } from "@/lib/utils";

export function DataTable({ columns, data, onRowClick, className }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-coco-border", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-coco-border bg-coco-cream">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-coco-muted text-xs uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={cn("border-b border-coco-border/50 last:border-0 bg-white", onRowClick && "cursor-pointer hover:bg-coco-leaf-soft/30 transition-colors")}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-coco-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
