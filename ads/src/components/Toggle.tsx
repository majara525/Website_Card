interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="toggle-track shrink-0"
      data-active={checked}
      onClick={onChange}
    >
      <span className="toggle-thumb" />
    </button>
  );
}
