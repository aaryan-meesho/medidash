import { useEffect, useRef, useState } from 'react';

export default function SelectDropdown({ value, options, onChange, className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`select-dropdown${className ? ` ${className}` : ''}`}>
      <button type="button" className="select-dropdown__trigger" onClick={() => setOpen((o) => !o)}>
        <span>{selected ? selected.label : value}</span>
        <span
          className={`select-dropdown__chevron${open ? ' select-dropdown__chevron--open' : ''}`}
          aria-hidden="true"
        >
          &#9662;
        </span>
      </button>
      {open && (
        <ul className="select-dropdown__menu" role="listbox">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`select-dropdown__option${option.value === value ? ' select-dropdown__option--selected' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
