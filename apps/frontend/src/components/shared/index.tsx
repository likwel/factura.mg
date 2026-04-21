// components/shared/index.tsx

import React, { useState } from 'react';
import { ChevronDown, Check, Loader2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import type {
  CustomSelectProps,
  InputProps,
  TextareaProps,
  ButtonProps,
  CardProps,
  PageHeaderProps,
  ToggleButtonGroupProps,
  AlertProps
} from '../../types';

// ============================================================================
// CUSTOM SELECT COMPONENT
// ============================================================================

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  required = false,
  icon: Icon,
  error,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-white border rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all flex items-center justify-between hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-gray-400" />}
          <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-auto">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check size={18} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}
        <input
          type={type}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-white border rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed ${
            error ? 'border-red-300' : 'border-gray-200'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-white border rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
          error ? 'border-red-300' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl disabled:from-blue-300 disabled:to-blue-400',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl disabled:from-green-300 disabled:to-green-400',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl disabled:from-red-300 disabled:to-red-400',
    purple: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl disabled:from-purple-300 disabled:to-purple-400',
    warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 shadow-lg hover:shadow-xl disabled:from-yellow-300 disabled:to-yellow-400'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 justify-center disabled:cursor-not-allowed disabled:opacity-60 ${
        fullWidth ? 'w-full' : ''
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={20} className="animate-spin" />}
      {!loading && Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 ${!noPadding ? 'p-8' : ''} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// PAGE HEADER COMPONENT
// ============================================================================

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  iconColor = 'from-blue-500 to-blue-600'
}) => {
  return (
    <div className="flex items-center gap-4 mb-4 pb-6 border-b border-gray-200">
      {/* <div className={`w-14 h-14 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center`}>
        <Icon className="text-white" size={28} />
      </div> */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
    </div>
  );
};

// ============================================================================
// TOGGLE BUTTON GROUP COMPONENT
// ============================================================================

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  options,
  value,
  onChange,
  fullWidth = false
}) => {
  return (
    <div className={`flex gap-4 ${fullWidth ? 'w-full' : ''}`}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`${fullWidth ? 'flex-1' : ''} py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 ${
            value === option.value
              ? `bg-gradient-to-r ${option.color || 'from-blue-600 to-blue-700'} text-white shadow-xl scale-105`
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.icon && <span className="mr-2">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// ALERT COMPONENT
// ============================================================================

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, onClose }) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info
    }
  };

  const config = types[type];
  const IconComponent = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} ${config.text} px-4 py-3 rounded-xl flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <IconComponent size={20} />
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 hover:opacity-70">
          <span className="text-xl">×</span>
        </button>
      )}
    </div>
  );
};

// Export all components
export default {
  CustomSelect,
  Input,
  Textarea,
  Button,
  Card,
  PageHeader,
  ToggleButtonGroup,
  Alert
};