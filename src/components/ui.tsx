import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/* ---------------------------------------------------------------- Seiten */

export function PageHeader({
  eyebrow,
  title,
  lead,
  aside,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-col gap-6 border-b rule pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="label mb-3">{eyebrow}</p>}
        <h1 className="display text-4xl leading-[1.1] text-ink-700 dark:text-paper-100 sm:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-ink-400 dark:text-paper-200/70">
            {lead}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

export function SectionTitle({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="display text-xl text-ink-700 dark:text-paper-100">{children}</h2>
      {right}
    </div>
  );
}

export function Card({
  children,
  className,
  as: Tag = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'article' | 'div' | 'li';
}) {
  return <Tag className={cx('card p-5 sm:p-6', className)}>{children}</Tag>;
}

export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-12 text-center">
      <span aria-hidden className="mb-1 block h-px w-10 bg-paper-300 dark:bg-ink-600" />
      <p className="display text-lg text-ink-600 dark:text-paper-100">{title}</p>
      <p className="max-w-sm text-[0.9rem] leading-relaxed text-ink-300 dark:text-paper-200/60">
        {text}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------- Bausteine */

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'forest' | 'wine' | 'brass' | 'muted';
}) {
  const tones = {
    neutral:
      'border-paper-300 text-ink-500 dark:border-ink-600 dark:text-paper-200/80',
    forest:
      'border-forest-300/70 text-forest-600 dark:border-forest-500/60 dark:text-forest-300',
    wine: 'border-wine-300/70 text-wine-500 dark:border-wine-300/40 dark:text-wine-300',
    brass:
      'border-brass-300/80 text-brass-500 dark:border-brass-500/50 dark:text-brass-300',
    muted:
      'border-transparent bg-paper-200/70 text-ink-400 dark:bg-ink-700 dark:text-paper-200/60',
  } as const;
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-wide',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Ruhige Linie statt Punktestand. */
export function QuietLine({
  value,
  tone = 'forest',
  label,
}: {
  value: number;
  tone?: 'forest' | 'wine' | 'brass';
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const colors = {
    forest: 'bg-forest-500 dark:bg-forest-300',
    wine: 'bg-wine-500 dark:bg-wine-300',
    brass: 'bg-brass-500 dark:bg-brass-300',
  } as const;
  return (
    <div className="w-full">
      <div
        className="h-px w-full bg-paper-300 dark:bg-ink-600"
        role="img"
        aria-label={label ?? `Fortschritt ${clamped} Prozent`}
      >
        <div
          className={cx('h-px transition-[width] duration-700 ease-calm', colors[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  size = 'md',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  hint?: string;
  size?: 'md' | 'sm';
}) {
  return (
    <label
      className={cx(
        'group flex cursor-pointer items-start gap-3 rounded-card px-2 py-2 transition-colors duration-200 ease-calm',
        'hover:bg-paper-100/80 dark:hover:bg-ink-700/50',
      )}
    >
      <span className="relative mt-0.5 flex shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden
          className={cx(
            'flex items-center justify-center rounded-[2px] border transition-colors duration-200 ease-calm',
            size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
            checked
              ? 'border-forest-500 bg-forest-500 dark:border-forest-300 dark:bg-forest-300'
              : 'border-paper-400 group-hover:border-ink-300 dark:border-ink-500',
            'peer-focus-visible:ring-1 peer-focus-visible:ring-forest-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper-50 dark:peer-focus-visible:ring-offset-ink-800',
          )}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-paper-50 dark:text-ink-800">
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
      <span className="min-w-0">
        <span
          className={cx(
            'block text-[0.95rem] leading-snug transition-colors duration-300 ease-calm',
            checked
              ? 'text-ink-300 line-through decoration-ink-300/40 dark:text-paper-200/40'
              : 'text-ink-600 dark:text-paper-200/90',
          )}
        >
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[0.78rem] text-ink-300 dark:text-paper-200/50">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * Einheitliches Löschen. Erscheint beim Überfahren der Zeile — auf
 * Touch-Geräten dauerhaft, weil es dort kein Hover gibt.
 */
export function DeleteButton({
  onDelete,
  label = 'Entfernen',
  confirm,
  className,
}: {
  onDelete: () => void;
  label?: string;
  /** Rückfrage für alles, was echte Arbeit vernichtet. */
  confirm?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        if (confirm && !window.confirm(confirm)) return;
        onDelete();
      }}
      className={cx(
        'shrink-0 rounded p-1 leading-none text-ink-300 transition-all duration-200 ease-calm',
        'hover:text-wine-500 focus-visible:opacity-100 dark:hover:text-wine-300',
        'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M4 4l8 8M12 4l-8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/* -------------------------------------------------------------- Eingaben */

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextField({ label, className, ...rest }: TextFieldProps) {
  return (
    <label className="block">
      {label && <span className="label mb-1.5 block">{label}</span>}
      <input {...rest} className={cx('field', className)} />
    </label>
  );
}

interface AreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

/** Textfeld, das mit dem Inhalt mitwächst. */
export function AutoTextarea({ label, className, value, ...rest }: AreaFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <label className="block">
      {label && <span className="label mb-1.5 block">{label}</span>}
      <textarea
        ref={ref}
        value={value}
        rows={2}
        {...rest}
        className={cx('field resize-none leading-relaxed', className)}
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className="block">
      {label && <span className="label mb-1.5 block">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx('field cursor-pointer appearance-none pr-8', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5' fill='none' stroke='%236b6862' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.6rem center',
          backgroundSize: '0.85rem',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Ein Feld, das erst beim Klick zum Eingabefeld wird — hält die
 * Oberfläche ruhig und trotzdem überall editierbar.
 */
export function InlineEdit({
  value,
  onSave,
  placeholder = 'Notieren …',
  multiline = true,
  className,
  displayClassName,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  displayClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cx(
          'w-full rounded-card px-2 py-1.5 text-left transition-colors duration-200 ease-calm',
          'hover:bg-paper-100 dark:hover:bg-ink-700/50',
          className,
        )}
      >
        <span
          className={cx(
            'whitespace-pre-wrap leading-relaxed',
            value
              ? cx('text-ink-600 dark:text-paper-200/90', displayClassName)
              : 'text-ink-300 dark:text-paper-200/40',
          )}
        >
          {value || placeholder}
        </span>
      </button>
    );
  }

  if (multiline) {
    return (
      <AutoTextarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        }
      }}
      placeholder={placeholder}
      className={cx('field', className)}
    />
  );
}

/** Kleine Zeile zum Hinzufügen — Enter genügt. */
export function QuickAdd({
  placeholder,
  onAdd,
  buttonLabel = 'Hinzufügen',
}: {
  placeholder: string;
  onAdd: (text: string) => void;
  buttonLabel?: string;
}) {
  const [text, setText] = useState('');
  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="field flex-1"
      />
      <button type="submit" className="btn-quiet shrink-0" disabled={!text.trim()}>
        {buttonLabel}
      </button>
    </form>
  );
}

/** Dezenter Selbsteinschätzungs-Regler, 1–5, ohne Wertung. */
export function Gauge({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[0.85rem] text-ink-400 dark:text-paper-200/60">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label}: ${n} von 5`}
            onClick={() => onChange(n)}
            className={cx(
              'h-1.5 w-6 rounded-full transition-colors duration-300 ease-calm',
              (value ?? 0) >= n
                ? 'bg-forest-500 dark:bg-forest-300'
                : 'bg-paper-300 hover:bg-paper-400 dark:bg-ink-600 dark:hover:bg-ink-500',
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  /*
   * Über ein Portal direkt an <body>: sonst landet der Dialog im
   * Stapelkontext eines sticky-Elternteils (etwa der Seitenspalte) und
   * verschwindet trotz z-50 hinter dem Seiteninhalt.
   */
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <div
        className="fixed inset-0 bg-ink-900/30 backdrop-blur-[2px] dark:bg-ink-900/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'card relative z-10 w-full animate-rise p-6 shadow-[0_20px_60px_-30px_rgba(28,27,24,0.4)] sm:p-8',
          wide ? 'max-w-3xl' : 'max-w-xl',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <h2 className="display text-2xl text-ink-700 dark:text-paper-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="-mr-1 -mt-1 rounded-card p-1.5 text-ink-300 transition-colors hover:text-ink-600 dark:hover:text-paper-100"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4">
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
