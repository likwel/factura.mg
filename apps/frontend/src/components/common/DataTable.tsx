// apps/frontend/src/components/common/DataTable.tsx
import { useState, useRef, useEffect } from 'react';
import {
    Search, Filter, Calendar, ChevronDown, RefreshCw,
    Plus, Trash2, Download, X, Check, AlertCircle, MoreVertical, Package
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
    title: string;
    description?: string;
    createLabel?: string;
    onCreateClick?: () => void;
    onRefresh?: () => void;
    data: T[];
    columns: Column<T>[];
    selectable?: boolean;
    bulkActions?: BulkAction<T>[];
    rowActions?: TableAction<T>[];
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    showDateFilter?: boolean;
    onDateFilter?: (dates: { start: Date; end: Date } | null) => void;
    filters?: FilterOption[];
    onFilterChange?: (filter: string) => void;
    currentPage?: number;
    totalPages?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    loading?: boolean;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
}

// Modal de confirmation
function ConfirmDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    message: string; 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                        >
                            Non, annuler
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg shadow-red-500/30"
                        >
                            Oui, supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DataTable<T extends { id: string | number }>({
    title,
    description = '',
    createLabel = 'Créer',
    onCreateClick,
    onRefresh,
    data,
    columns,
    selectable = false,
    bulkActions = [],
    rowActions = [],
    searchPlaceholder = 'Rechercher...',
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
    const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
    
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

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

    const toggleFilter = (filterValue: string) => {
        const newFilters = new Set(selectedFilters);
        if (newFilters.has(filterValue)) {
            newFilters.delete(filterValue);
        } else {
            newFilters.add(filterValue);
        }
        setSelectedFilters(newFilters);
        onFilterChange?.(filterValue);
    };

    const isAllSelected = data.length > 0 && selectedRows.size === data.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < data.length;

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-3 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                            {description && (
                                <p className="text-sm text-gray-600">{description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Actualiser</span>
                            </button>
                        )}

                        {onCreateClick && (
                            <button
                                onClick={onCreateClick}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                {createLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white rounded-lg">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[300px] relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 font-medium bg-gray-50 focus:bg-white"
                        />
                    </div>

                    {showDateFilter && (
                        <button className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700 hidden sm:inline">Période</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                    )}

                    {/* Filtres cochables */}
                    {filters.length > 0 && (
                        <div className="relative" ref={filterMenuRef}>
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow"
                            >
                                <Filter className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700 hidden sm:inline">Filtres</span>
                                {selectedFilters.size > 0 && (
                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                                        {selectedFilters.size}
                                    </span>
                                )}
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 min-w-[240px] overflow-hidden">
                                    {filters.map((filter, index) => {
                                        const isChecked = selectedFilters.has(filter.value);
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => toggleFilter(filter.value)}
                                                className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center gap-3 transition-all font-medium text-gray-700 hover:text-blue-700 border-b border-gray-100 last:border-0"
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                                    isChecked 
                                                        ? 'bg-blue-600 border-blue-600' 
                                                        : 'border-gray-300 bg-white'
                                                }`}>
                                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    {filter.icon}
                                                </div>
                                                <span className="flex-1">{filter.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative" ref={actionsMenuRef}>
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:border-gray-300 hover:from-gray-100 hover:to-gray-200 transition-all font-medium shadow-sm hover:shadow"
                        >
                            Actions
                            <ChevronDown className={`w-4 h-4 inline ml-2 transition-transform ${showActionsMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showActionsMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 min-w-[200px] overflow-hidden">
                                <button className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center gap-3 transition-all font-medium text-gray-700 hover:text-blue-700">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Download className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Exporter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Barre de sélection */}
            {selectable && selectedRows.size > 0 && (
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-lg shadow-lg px-6 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="text-base font-bold text-white">
                                        {selectedRows.size} élément{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
                                    </span>
                                    <button
                                        onClick={() => setSelectedRows(new Set())}
                                        className="block text-sm text-white/90 hover:text-white font-medium hover:underline transition-all mt-0.5"
                                    >
                                        Tout désélectionner
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {bulkActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => action.onClick(getSelectedData())}
                                    className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
                                        action.variant === 'danger'
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
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

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                            <tr>
                                {selectable && (
                                    <th className="w-16 px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = isSomeSelected;
                                            }}
                                            onChange={toggleSelectAll}
                                            className="w-5 h-5 text-blue-600 rounded-lg cursor-pointer transition-all"
                                        />
                                    </th>
                                )}

                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                        style={{ width: column.width }}
                                    >
                                        {column.header}
                                    </th>
                                ))}

                                {rowActions.length > 0 && (
                                    <th className="w-32 px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="px-6 py-20">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <RefreshCw className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <p className="text-gray-600 font-semibold text-lg">Chargement des données...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="px-6 py-20">
                                        <div className="flex flex-col items-center justify-center gap-5">
                                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                                                {emptyIcon || <AlertCircle className="w-10 h-10 text-gray-400" />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-700 font-bold text-xl">{emptyMessage}</p>
                                                <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos critères de recherche ou créez un nouvel élément</p>
                                            </div>
                                            {onCreateClick && (
                                                <button
                                                    onClick={onCreateClick}
                                                    className="mt-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                    {createLabel}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr key={row.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-150">
                                        {selectable && (
                                            <td className="px-6 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(row.id)}
                                                    onChange={() => toggleSelectRow(row.id)}
                                                    className="w-5 h-5 text-blue-600 rounded-lg cursor-pointer transition-all"
                                                />
                                            </td>
                                        )}

                                        {columns.map((column, colIndex) => (
                                            <td key={colIndex} className="px-6 py-2 text-sm text-gray-900 font-medium">
                                                {column.render
                                                    ? column.render(row[column.key as keyof T], row)
                                                    : String(row[column.key as keyof T] || '')}
                                            </td>
                                        ))}

                                        {rowActions.length > 0 && (
                                            <td className="px-6 py-2 text-right">
                                                <RowActionsMenu actions={rowActions} row={row} rowIndex={rowIndex} />
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
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <select
                                    value={pageSize}
                                    onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                                    className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold cursor-pointer transition-all hover:border-blue-300 bg-white"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-700 font-semibold">par page</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onPageChange?.(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-gray-700 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold shadow-sm hover:shadow"
                                >
                                    ←
                                </button>

                                <div className="flex items-center gap-2">
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
                                                <div key={page} className="flex items-center gap-2">
                                                    {showEllipsis && <span className="px-2 text-gray-400 font-bold">...</span>}
                                                    <button
                                                        onClick={() => onPageChange?.(page)}
                                                        className={`min-w-[35px] h-8 w-8 rounded-lg transition-all font-bold shadow-sm hover:shadow ${
                                                            page === currentPage
                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                                                                : 'text-gray-700 hover:bg-white hover:scale-105'
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
                                    className="px-4 py-2 text-gray-700 hover:bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold shadow-sm hover:shadow"
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


// Menu d'actions Premium avec position fixe
function RowActionsMenu<T>({ actions, row, rowIndex }: { actions: TableAction<T>[]; row: T; rowIndex: number }) {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
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

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setShowMenu(false), true);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', () => setShowMenu(false), true);
            };
        }
    }, [showMenu]);

    const handleToggleMenu = () => {
        if (!showMenu && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuHeight = actions.length * 48 + 20;
            const spaceBelow = window.innerHeight - rect.bottom;
            
            setMenuPosition({
                top: spaceBelow > menuHeight ? rect.bottom + 8 : rect.top - menuHeight - 8,
                left: rect.right - 220
            });
        }
        setShowMenu(!showMenu);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggleMenu}
                className="inline-flex items-center justify-center w-10 h-10 hover:bg-blue-50 rounded-lg transition-all group shadow-sm hover:shadow-md"
            >
                <MoreVertical className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
            </button>

            {showMenu && (
                <div 
                    className="actions-menu fixed bg-white border border-gray-100 rounded-lg shadow-2xl z-[10000] w-[220px] overflow-hidden"
                    style={{
                        top: `${menuPosition.top}px`,
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
                            className={`w-full px-4 py-3 text-left hover:bg-gradient-to-r flex items-center gap-3 transition-all font-semibold border-b border-gray-50 last:border-0 ${
                                action.variant === 'danger' 
                                    ? 'text-red-600 hover:from-red-50 hover:to-red-100 hover:text-red-700' 
                                    : 'text-gray-700 hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${
                                action.variant === 'danger' 
                                    ? 'bg-gradient-to-br from-red-50 to-red-100' 
                                    : 'bg-gradient-to-br from-blue-50 to-blue-100'
                            }`}>
                                {action.icon}
                            </div>
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}

// Menu d'actions avec confirmation
function RowActionsMenuO<T>({ actions, row }: { actions: TableAction<T>[]; row: T }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<TableAction<T> | null>(null);
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

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenu]);

    const handleActionClick = (action: TableAction<T>) => {
        if (action.variant === 'danger') {
            setPendingAction(action);
            setShowConfirm(true);
            setShowMenu(false);
        } else {
            action.onClick(row);
            setShowMenu(false);
        }
    };

    return (
        <>
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={() => setShowMenu(!showMenu)}
                    className="px-3 py-2 hover:bg-blue-50 rounded-lg transition-all group"
                >
                    <MoreVertical className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                </button>

                {showMenu && (
                    <div className="actions-menu absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-[200px] overflow-hidden">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleActionClick(action)}
                                className={`w-full px-4 py-3 text-left hover:bg-gradient-to-r flex items-center gap-3 transition-all font-medium border-b border-gray-100 last:border-0 ${
                                    action.variant === 'danger' 
                                        ? 'text-red-600 hover:from-red-50 hover:to-red-100 hover:text-red-700' 
                                        : 'text-gray-700 hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    action.variant === 'danger' ? 'bg-red-50' : 'bg-blue-50'
                                }`}>
                                    {action.icon}
                                </div>
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false);
                    setPendingAction(null);
                }}
                onConfirm={() => {
                    if (pendingAction) {
                        pendingAction.onClick(row);
                        setPendingAction(null);
                    }
                }}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
            />
        </>
    );
}
