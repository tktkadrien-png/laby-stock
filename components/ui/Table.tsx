import { HTMLAttributes, forwardRef } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={`w-full ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', children, ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-blue-800 ${className}`}
    {...props}
  >
    {children}
  </thead>
));

TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', children, ...props }, ref) => (
  <tbody ref={ref} className={className} {...props}>
    {children}
  </tbody>
));

TableBody.displayName = 'TableBody';

const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className = '', children, ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${className}`}
    {...props}
  >
    {children}
  </tr>
));

TableRow.displayName = 'TableRow';

const TableHead = forwardRef<
  HTMLTableCellElement,
  HTMLAttributes<HTMLTableCellElement>
>(({ className = '', children, ...props }, ref) => (
  <th
    ref={ref}
    className={`px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${className}`}
    {...props}
  >
    {children}
  </th>
));

TableHead.displayName = 'TableHead';

const TableCell = forwardRef<
  HTMLTableCellElement,
  HTMLAttributes<HTMLTableCellElement>
>(({ className = '', children, ...props }, ref) => (
  <td
    ref={ref}
    className={`px-4 py-3 text-sm text-gray-900 ${className}`}
    {...props}
  >
    {children}
  </td>
));

TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
