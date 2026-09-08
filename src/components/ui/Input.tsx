import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...rest }: InputProps) {
  const inputId = id || rest.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'border-terra-400 ring-1 ring-terra-400' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-terra-700">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-ink-400">
          {hint}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = '', ...rest }: TextareaProps) {
  const textareaId = id || rest.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`input-field ${error ? 'border-terra-400 ring-1 ring-terra-400' : ''} ${className}`}
        aria-invalid={!!error}
        rows={rest.rows || 4}
        {...rest}
      />
      {error && (
        <p className="text-xs text-terra-700">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, id, className = '', children, ...rest }: SelectProps) {
  const selectId = id || rest.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input-field ${error ? 'border-terra-400 ring-1 ring-terra-400' : ''} ${className}`}
        aria-invalid={!!error}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-terra-700">{error}</p>}
    </div>
  );
}
