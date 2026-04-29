// apps/frontend/src/components/common/DataTable.tsx
import { useState, useRef, useEffect } from 'react';
import {
    Search, Filter, Calendar, ChevronDown, RefreshCw,
    Plus, Trash2, Download, X, Check, AlertCircle, MoreVertical
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
    requireConfirm?: boolean;
}

export interface BulkAction<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    variant?: 'default' | 'danger';
    requireConfirm?: boolean;
}

export interface Tab {
    label: string;
    value: string;
    count?: number;
}

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface DataTableProps<T> {
    title: string;
    description?: string;
    createLabel?: string;
    createButtonColor?: string; // Nouvelle prop pour la couleur dynamique
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
    onDateFilter?: (dates: DateRange | null) => void;
    filters?: FilterOption[];
    onFilterChange?: (filter: string) => void;
    tabs?: Tab[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    currentPage?: number;
    totalPages?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    loading?: boolean;
    emptyMessage?: string;
    emptyDescription?: string;
    emptyIcon?: React.ReactNode;
    onExport?: () => void; // Export des données
}

// Modal de confirmation
function ConfirmDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'danger'
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'bg-red-100',
            iconColor: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: 'bg-orange-100',
            iconColor: 'text-orange-600',
            button: 'bg-orange-600 hover:bg-orange-700'
        },
        info: {
            icon: 'bg-blue-100',
            iconColor: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full ${styles.icon} flex items-center justify-center flex-shrink-0`}>
                            <AlertCircle className={`w-6 h-6 ${styles.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                            <p className="text-sm text-gray-600">{message}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 ${styles.button} text-white rounded-lg transition-colors text-sm font-medium shadow-sm`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Composant Date Picker
function DateFilterDialog({
    isOpen,
    onClose,
    onApply,
    initialRange
}: {
    isOpen: boolean;
    onClose: () => void;
    onApply: (range: DateRange) => void;
    initialRange?: DateRange;
}) {
    const [startDate, setStartDate] = useState<string>(
        initialRange?.start ? initialRange.start.toISOString().split('T')[0] : ''
    );
    const [endDate, setEndDate] = useState<string>(
        initialRange?.end ? initialRange.end.toISOString().split('T')[0] : ''
    );

    if (!isOpen) return null;

    const handleApply = () => {
        const range: DateRange = {
            start: startDate ? new Date(startDate) : null,
            end: endDate ? new Date(endDate) : null
        };
        onApply(range);
        onClose();
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        onApply({ start: null, end: null });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Filtrer par période</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                        >
                            Effacer
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Appliquer
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
    createButtonColor = 'createColor', // Couleur par défaut
    onCreateClick,
    onRefresh,
    data,
    columns,
    selectable = false,
    bulkActions = [],
    rowActions = [],
    searchPlaceholder = 'Rechercher',
    onSearch,
    showDateFilter = false,
    onDateFilter,
    filters = [],
    onFilterChange,
    tabs = [],
    activeTab = '',
    onTabChange,
    currentPage = 1,
    totalPages = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    loading = false,
    emptyMessage = 'Aucune donnée disponible',
    emptyDescription = '',
    emptyIcon,
    onExport,
}: DataTableProps<T>) {
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    
    // État pour la confirmation
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    } | null>(null);
    
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
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

    const clearAllFilters = () => {
        setSelectedFilters(new Set());
    };

    const handleDateFilter = (range: DateRange) => {
        setDateRange(range);
        onDateFilter?.(range);
    };

    const clearDateFilter = () => {
        setDateRange({ start: null, end: null });
        onDateFilter?.(null);
    };

    const formatDateRange = () => {
        if (!dateRange.start && !dateRange.end) return null;
        if (dateRange.start && dateRange.end) {
            return `${new Date(dateRange.start).toLocaleDateString('fr-FR')} - ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`;
        }
        if (dateRange.start) {
            return `À partir du ${new Date(dateRange.start).toLocaleDateString('fr-FR')}`;
        }
        if (dateRange.end) {
            return `Jusqu'au ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`;
        }
        return null;
    };

    // Gérer les bulk actions avec confirmation
    const handleBulkAction = (action: BulkAction<T>) => {
        const selectedData = getSelectedData();
        
        if (action.variant === 'danger' || action.requireConfirm) {
            setConfirmConfig({
                title: action.variant === 'danger' ? 'Confirmer la suppression' : 'Confirmer l\'action',
                message: action.variant === 'danger' 
                    ? `Êtes-vous sûr de vouloir supprimer ${selectedRows.size} élément${selectedRows.size > 1 ? 's' : ''} ? Cette action est irréversible.`
                    : `Êtes-vous sûr de vouloir effectuer cette action sur ${selectedRows.size} élément${selectedRows.size > 1 ? 's' : ''} ?`,
                onConfirm: () => {
                    action.onClick(selectedData);
                    setSelectedRows(new Set());
                },
                variant: action.variant === 'danger' ? 'danger' : 'warning'
            });
            setShowConfirm(true);
        } else {
            action.onClick(selectedData);
            setSelectedRows(new Set());
        }
    };

    // Classes dynamiques pour le bouton créer
    const getCreateButtonClasses = () => {
        const colorMap: Record<string, string> = {
            purple: 'bg-purple-600 hover:bg-purple-700',
            blue: 'bg-blue-600 hover:bg-blue-700',
            orange: 'bg-orange-600 hover:bg-orange-700',
            teal: 'bg-teal-600 hover:bg-teal-700',
            green: 'bg-green-600 hover:bg-green-700',
            red: 'bg-red-600 hover:bg-red-700',
            gray: 'bg-gray-600 hover:bg-gray-700',
            info2 : 'bg-info-2 hover:bg-blue-600'
        };
        
        // return colorMap[createButtonColor] || colorMap.blue;
        return createButtonColor
    };

    const isAllSelected = data.length > 0 && selectedRows.size === data.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < data.length;
    const hasDateFilter = dateRange.start !== null || dateRange.end !== null;

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Modal de confirmation */}
            {confirmConfig && (
                <ConfirmDialog
                    isOpen={showConfirm}
                    onClose={() => {
                        setShowConfirm(false);
                        setConfirmConfig(null);
                    }}
                    onConfirm={confirmConfig.onConfirm}
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    variant={confirmConfig.variant}
                    confirmLabel={confirmConfig.variant === 'danger' ? 'Oui, supprimer' : 'Confirmer'}
                    cancelLabel="Annuler"
                />
            )}

            {/* Date Picker Dialog */}
            <DateFilterDialog
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onApply={handleDateFilter}
                initialRange={dateRange}
            />

            {/* Header Simple */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                        {description && (
                            <p className="text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtres Dropdown */}
                        {filters.length > 0 && (
                            <div className="relative" ref={filterMenuRef}>
                                <button
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Filtres</span>
                                    {selectedFilters.size > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                            {selectedFilters.size}
                                        </span>
                                    )}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showFilterMenu && (
                                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px] overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                            <span className="text-sm font-semibold text-gray-900">Filtrer par</span>
                                            {selectedFilters.size > 0 && (
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Tout effacer
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[300px] overflow-y-auto">
                                            {filters.map((filter, index) => {
                                                const isChecked = selectedFilters.has(filter.value);
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => toggleFilter(filter.value)}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                                                    >
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                            isChecked 
                                                                ? 'bg-blue-600 border-blue-600' 
                                                                : 'border-gray-300 bg-white'
                                                        }`}>
                                                            {isChecked && <Check className="w-3 h-3 text-white" />}
                                                        </div>

                                                        {filter.icon && (
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                {filter.icon}
                                                            </div>
                                                        )}

                                                        <span className={`flex-1 text-sm ${
                                                            isChecked ? 'text-gray-900 font-medium' : 'text-gray-700'
                                                        }`}>
                                                            {filter.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {selectedFilters.size > 0 && (
                                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                                <button
                                                    onClick={() => setShowFilterMenu(false)}
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    Appliquer les filtres
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Menu 3 points (More) */}
                        <div className="relative" ref={moreMenuRef}>
                            <button
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>

                            {showMoreMenu && (
                                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden">
                                    {onRefresh && (
                                        <button
                                            onClick={() => {
                                                onRefresh();
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Actualiser
                                        </button>
                                    )}

                                    {showDateFilter && (
                                        <button
                                            onClick={() => {
                                                setShowDatePicker(true);
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700 border-t border-gray-100"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            <span className="flex-1">Filtrer par date</span>
                                            {hasDateFilter && (
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            )}
                                        </button>
                                    )}

                                    {onExport && (
                                        <button
                                            onClick={() => {
                                                onExport();
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700 border-t border-gray-100"
                                        >
                                            <Download className="w-4 h-4" />
                                            Exporter
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {onCreateClick && (
                            <button
                                onClick={onCreateClick}
                                className={`px-4 py-2 ${getCreateButtonClasses()} text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium`}
                            >
                                <Plus className="w-4 h-4" />
                                {createLabel}
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                {tabs.length > 0 && (
                    <div className="flex items-center gap-6 mt-4 border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => onTabChange?.(tab.value)}
                                className={`pb-3 text-sm font-medium transition-colors relative ${
                                    activeTab === tab.value
                                        ? 'text-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className="ml-2 text-xs text-gray-500">({tab.count})</span>
                                )}
                                {activeTab === tab.value && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Filtres actifs en chips */}
                {(selectedFilters.size > 0 || hasDateFilter) && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs font-medium text-gray-600">Filtres actifs:</span>
                        
                        {/* Filtre par date */}
                        {hasDateFilter && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDateRange()}</span>
                                <button
                                    onClick={clearDateFilter}
                                    className="ml-1 hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        {/* Autres filtres */}
                        {Array.from(selectedFilters).map((filterValue) => {
                            const filter = filters.find(f => f.value === filterValue);
                            if (!filter) return null;
                            
                            return (
                                <div
                                    key={filterValue}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                                >
                                    {filter.icon && (
                                        <span className="w-3 h-3">
                                            {filter.icon}
                                        </span>
                                    )}
                                    <span>{filter.label}</span>
                                    <button
                                        onClick={() => toggleFilter(filterValue)}
                                        className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            );
                        })}
                        
                        <button
                            onClick={() => {
                                clearAllFilters();
                                clearDateFilter();
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium underline"
                        >
                            Tout effacer
                        </button>
                    </div>
                )}
            </div>

            {/* Barre de sélection */}
            {selectable && selectedRows.size > 0 && (
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-blue-900">
                                {selectedRows.size} élément{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => setSelectedRows(new Set())}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Désélectionner
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {bulkActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleBulkAction(action)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                                        action.variant === 'danger'
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600 text-sm">Chargement...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 px-4">
                        <div className="mb-6">
                            {emptyIcon || (
                                <svg className="w-40 h-40" viewBox="0 0 200 200" fill="none">
                                    <rect x="40" y="50" width="80" height="100" rx="8" fill="#E5E7EB" transform="rotate(-10 80 100)" />
                                    <rect x="50" y="60" width="80" height="100" rx="8" fill="#F3F4F6" transform="rotate(-5 90 110)" />
                                    <rect x="60" y="70" width="80" height="100" rx="8" fill="white" stroke="#D1D5DB" strokeWidth="2" />
                                    <line x1="75" y1="90" x2="125" y2="90" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
                                    <line x1="75" y1="105" x2="125" y2="105" stroke="#C7D2FE" strokeWidth="3" strokeLinecap="round" />
                                    <line x1="75" y1="120" x2="110" y2="120" stroke="#C7D2FE" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
                        {emptyDescription && (
                            <p className="text-sm text-gray-500 text-center max-w-md mb-6">
                                {emptyDescription}
                            </p>
                        )}
                        {onCreateClick && (
                            <button
                                onClick={onCreateClick}
                                className={`px-4 py-2 ${getCreateButtonClasses()} text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium`}
                            >
                                <Plus className="w-4 h-4" />
                                {createLabel}
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <tr>
                                {selectable && (
                                    <th className="w-9 px-2 py-3">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = isSomeSelected;
                                            }}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                    </th>
                                )}

                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        style={{ width: column.width }}
                                    >
                                        {column.header}
                                    </th>
                                ))}

                                {rowActions.length > 0 && (
                                    <th className="w-16 px-3 py-3"></th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {selectable && (
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(row.id)}
                                                onChange={() => toggleSelectRow(row.id)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                        </td>
                                    )}

                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className="px-2 py-2 text-sm text-gray-900">
                                            {column.render
                                                ? column.render(row[column.key as keyof T], row)
                                                : String(row[column.key as keyof T] || '')}
                                        </td>
                                    ))}

                                    {rowActions.length > 0 && (
                                        <td className="px-2 py-2 text-right">
                                            <RowActionsMenu 
                                                actions={rowActions} 
                                                row={row}
                                                onConfirmAction={(action) => {
                                                    setConfirmConfig({
                                                        title: action.variant === 'danger' ? 'Confirmer la suppression' : 'Confirmer l\'action',
                                                        message: action.variant === 'danger' 
                                                            ? 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.'
                                                            : 'Êtes-vous sûr de vouloir effectuer cette action ?',
                                                        onConfirm: () => action.onClick(row),
                                                        variant: action.variant === 'danger' ? 'danger' : 'warning'
                                                    });
                                                    setShowConfirm(true);
                                                }}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Simple */}
            {!loading && data.length > 0 && totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span>Afficher</span>
                            <select
                                value={pageSize}
                                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>par page</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange?.(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Précédent
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 7) {
                                        page = i + 1;
                                    } else if (currentPage <= 4) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 3) {
                                        page = totalPages - 6 + i;
                                    } else {
                                        page = currentPage - 3 + i;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => onPageChange?.(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                page === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => onPageChange?.(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


// Menu d'actions avec position dynamique et confirmation
function RowActionsMenu<T>({ 
    actions, 
    row,
    onConfirmAction
}: { 
    actions: TableAction<T>[]; 
    row: T;
    onConfirmAction: (action: TableAction<T>) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    }>({});
    
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Calculer la position dynamique du menu
    useEffect(() => {
        if (showMenu && buttonRef.current && menuRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const MENU_OFFSET = 8; // Espace entre le bouton et le menu
            const EDGE_PADDING = 16; // Marge par rapport aux bords de l'écran
            
            let position: typeof menuPosition = {};
            
            // ===== Position HORIZONTALE =====
            const spaceOnRight = viewportWidth - buttonRect.right;
            const spaceOnLeft = buttonRect.left;
            const menuWidth = menuRect.width;
            
            // Calculer la distance depuis le bord droit de la fenêtre
            const distanceFromRight = viewportWidth - buttonRect.right;
            
            // Essayer d'abord d'aligner le menu à droite du bouton
            if (spaceOnRight >= menuWidth + EDGE_PADDING) {
                // Assez d'espace à droite - utiliser position 'right'
                position.right = distanceFromRight;
            } else if (spaceOnLeft >= menuWidth + EDGE_PADDING) {
                // Pas assez à droite, mais assez à gauche - aligner à gauche du bouton
                position.left = Math.max(EDGE_PADDING, buttonRect.left - menuWidth + buttonRect.width);
            } else {
                // Pas assez d'espace des deux côtés
                // Privilégier le côté avec le plus d'espace
                if (spaceOnRight >= spaceOnLeft) {
                    // Plus d'espace à droite
                    position.right = EDGE_PADDING;
                } else {
                    // Plus d'espace à gauche
                    position.left = EDGE_PADDING;
                }
            }
            
            // ===== Position VERTICALE =====
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;
            
            if (spaceBelow >= menuRect.height + MENU_OFFSET) {
                // Assez d'espace en dessous
                position.top = buttonRect.bottom + MENU_OFFSET;
            } else if (spaceAbove >= menuRect.height + MENU_OFFSET) {
                // Pas assez en dessous, placer au-dessus
                position.bottom = viewportHeight - buttonRect.top + MENU_OFFSET;
            } else {
                // Pas assez d'espace, placer où il y a le plus d'espace
                if (spaceBelow > spaceAbove) {
                    position.top = buttonRect.bottom + MENU_OFFSET;
                } else {
                    position.bottom = viewportHeight - buttonRect.top + MENU_OFFSET;
                }
            }
            
            setMenuPosition(position);
        }
    }, [showMenu]);

    // Fermer le menu si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && 
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenu]);

    // Fermer le menu avec Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [showMenu]);

    const handleActionClick = (action: TableAction<T>) => {
        setShowMenu(false);
        
        if (action.variant === 'danger' || action.requireConfirm) {
            onConfirmAction(action);
        } else {
            action.onClick(row);
        }
    };

    // Grouper les actions par séparateur (actions danger séparées)
    const groupedActions = actions.reduce((groups, action, index) => {
        if (index > 0 && action.variant === 'danger' && actions[index - 1].variant !== 'danger') {
            groups.push({ separator: true });
        }
        groups.push(action);
        return groups;
    }, [] as Array<TableAction<T> | { separator: true }>);

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                onClick={() => setShowMenu(!showMenu)}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                    showMenu 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Actions"
                aria-expanded={showMenu}
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {/* Backdrop pour fermer le menu */}
            {showMenu && (
                <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                />
            )}

            {/* Menu déroulant */}
            {showMenu && (
                <div 
                    ref={menuRef}
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: menuPosition.top,
                        bottom: menuPosition.bottom,
                        left: menuPosition.left,
                        right: menuPosition.right,
                    }}
                >
                    <div className="py-1">
                        {groupedActions.map((item, index) => {
                            // Séparateur
                            if ('separator' in item) {
                                return (
                                    <div 
                                        key={`separator-${index}`} 
                                        className="h-px bg-gray-200 my-1"
                                    />
                                );
                            }
                            
                            // Action
                            const action = item as TableAction<T>;
                            const isDestructive = action.variant === 'danger';
                            
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleActionClick(action)}
                                    // disabled={action.disabled}
                                    className={`
                                        w-full px-4 py-2.5 text-left text-sm 
                                        flex items-center gap-3 
                                        transition-all duration-150
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        ${isDestructive 
                                            ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <span className={`flex-shrink-0 ${isDestructive ? 'text-red-500' : 'text-gray-400'}`}>
                                        {action.icon}
                                    </span>
                                    <span className="font-medium flex-1">
                                        {action.label}
                                    </span>
                                    {action.requireConfirm && (
                                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                            ⚠
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
