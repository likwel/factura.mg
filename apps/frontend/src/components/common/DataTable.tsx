// apps/frontend/src/components/common/DataTable.tsx
import { useState, useRef, useEffect } from 'react';
import {
    Search, Filter, Calendar, ChevronDown, RefreshCw,
    Plus, Trash2, Download, X, Check, AlertCircle
} from 'lucide-react';

// Types
export interface Column<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    render?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
}

export interface FilterOption {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

export interface TableAction<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'danger';
}

export interface BulkAction<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    variant?: 'default' | 'danger';
}

interface DataTableProps<T> {
    // Header
    title: string;
    description :string,
    createLabel?: string;
    onCreateClick?: () => void;
    onRefresh?: () => void;

    // Data
    data: T[];
    columns: Column<T>[];

    // Selection
    selectable?: boolean;
    bulkActions?: BulkAction<T>[];

    // Actions
    rowActions?: TableAction<T>[];

    // Filters
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    showDateFilter?: boolean;
    onDateFilter?: (dates: { start: Date; end: Date } | null) => void;
    filters?: FilterOption[];
    onFilterChange?: (filter: string) => void;

    // Pagination
    currentPage?: number;
    totalPages?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;

    // Loading & Empty
    loading?: boolean;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
    title,
    description='',
    createLabel = 'Créer',
    onCreateClick,
    onRefresh,
    data,
    columns,
    selectable = false,
    bulkActions = [],
    rowActions = [],
    searchPlaceholder = 'Rechercher un document',
    onSearch,
    showDateFilter = false,
    onDateFilter,
    filters = [],
    onFilterChange,
    currentPage = 1,
    totalPages = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    loading = false,
    emptyMessage = 'Aucune donnée disponible',
    emptyIcon,
}: DataTableProps<T>) {
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    // Fermer les dropdowns au clic extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setShowActionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map(row => row.id)));
        }
    };

    const toggleSelectRow = (id: string | number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const getSelectedData = () => {
        return data.filter(row => selectedRows.has(row.id));
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        onSearch?.(value);
    };

    const isAllSelected = data.length > 0 && selectedRows.size === data.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < data.length;

    return (
        <div className="flex flex-col h-full bg-gray-50 space-y-6">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                        <p className="text-gray-600">{description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Actualiser</span>
                            </button>
                        )}

                        {onCreateClick && (
                            <button
                                onClick={onCreateClick}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                {createLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className=" mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="flex-1 min-w-[300px] relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Date Filter */}
                    {showDateFilter && (
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 font-medium shadow-sm">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700 hidden sm:inline">Choisir une plage de dates</span>
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                        </button>
                    )}

                    {/* Filters Dropdown */}
                    {filters.length > 0 && (
                        <div className="relative" ref={filterMenuRef}>
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 font-medium shadow-sm"
                            >
                                <Filter className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700 hidden sm:inline">Filtrer par statut</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filters.map((filter, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                onFilterChange?.(filter.value);
                                                setShowFilterMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors font-medium text-gray-700 hover:text-blue-700 first:rounded-t-xl last:rounded-b-xl"
                                        >
                                            {filter.icon}
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions Menu */}
                    <div className="relative" ref={actionsMenuRef}>
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm"
                        >
                            Actions
                        </button>

                        {showActionsMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <button className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors font-medium text-gray-700 hover:text-blue-700">
                                    <Download className="w-4 h-4" />
                                    Exporter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Selection Toolbar - Sticky */}
            {selectable && selectedRows.size > 0 && (
                <div className="sticky top-[73px] z-20  mt-4 mb-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg border border-blue-400 px-6 py-2 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-base font-semibold text-white">
                                    {selectedRows.size} élément{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedRows(new Set())}
                                className="text-sm text-white/90 hover:text-white font-medium hover:underline transition-all"
                            >
                                Tout désélectionner
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {bulkActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => action.onClick(getSelectedData())}
                                    className={`px-4 py-1 rounded-lg transition-all font-medium flex items-center gap-2 ${action.variant === 'danger'
                                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className=" mt-4 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-300">
                            <tr>
                                {selectable && (
                                    <th className="w-16 px-6 py-3">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = isSomeSelected;
                                            }}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
                                        />
                                    </th>
                                )}

                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                                        style={{ width: column.width }}
                                    >
                                        {column.header}
                                    </th>
                                ))}

                                {rowActions.length > 0 && (
                                    <th className="w-32 px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-gray-500 font-medium">Chargement des données...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            {emptyIcon || <AlertCircle className="w-12 h-12 text-gray-300" />}
                                            <div className="text-center">
                                                <p className="text-gray-500 font-medium text-lg">{emptyMessage}</p>
                                                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
                                            </div>
                                            {onCreateClick && (
                                                <button
                                                    onClick={onCreateClick}
                                                    className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    {createLabel}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        {selectable && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(row.id)}
                                                    onChange={() => toggleSelectRow(row.id)}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
                                                />
                                            </td>
                                        )}

                                        {columns.map((column, colIndex) => (
                                            <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                                                {column.render
                                                    ? column.render(row[column.key as keyof T], row)
                                                    : String(row[column.key as keyof T] || '')}
                                            </td>
                                        ))}

                                        {rowActions.length > 0 && (
                                            <td className="px-6 py-4 text-right">
                                                <RowActionsMenu actions={rowActions} row={row} />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && data.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <select
                                    value={pageSize}
                                    onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer transition-all"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-600 font-medium">par page</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onPageChange?.(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 text-gray-600 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                >
                                    ←
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            return page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - currentPage) <= 1;
                                        })
                                        .map((page, index, array) => {
                                            const prevPage = array[index - 1];
                                            const showEllipsis = prevPage && page - prevPage > 1;

                                            return (
                                                <div key={page} className="flex items-center gap-1">
                                                    {showEllipsis && <span className="px-2 text-gray-400 font-medium">...</span>}
                                                    <button
                                                        onClick={() => onPageChange?.(page)}
                                                        className={`min-w-[40px] h-10 rounded-lg transition-all font-medium ${page === currentPage
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-gray-700 hover:bg-white'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                </div>

                                <button
                                    onClick={() => onPageChange?.(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 text-gray-600 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Row Actions Menu Component
function RowActionsMenu<T>({ actions, row }: { actions: TableAction<T>[]; row: T }) {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [openUpward, setOpenUpward] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                const target = event.target as HTMLElement;
                if (!target.closest('.actions-menu')) {
                    setShowMenu(false);
                }
            }
        };

        const handleScroll = () => {
            setShowMenu(false);
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [showMenu]);

    const handleToggleMenu = () => {
        if (!showMenu && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuHeight = 200; // Hauteur estimée du menu
            const spaceBelow = window.innerHeight - rect.bottom;
            const shouldOpenUpward = spaceBelow < menuHeight;

            setOpenUpward(shouldOpenUpward);
            setMenuPosition({
                top: shouldOpenUpward ? rect.top : rect.bottom,
                left: rect.right - 180, // 180px = min-width du menu
            });
        }
        setShowMenu(!showMenu);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggleMenu}
                className="px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-all"
            >
                <span className="text-gray-700 flex items-center gap-1 font-medium text-sm">
                    Actions
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                </span>
            </button>

            {showMenu && (
                <div 
                    className="actions-menu fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] min-w-[180px] overflow-hidden animate-in fade-in duration-200"
                    style={{
                        top: openUpward ? 'auto' : `${menuPosition.top}px`,
                        bottom: openUpward ? `${window.innerHeight - menuPosition.top}px` : 'auto',
                        left: `${menuPosition.left}px`,
                    }}
                >
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                action.onClick(row);
                                setShowMenu(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors font-medium first:rounded-t-xl last:rounded-b-xl ${
                                action.variant === 'danger' 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}