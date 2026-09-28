import { cn } from "@/lib/cn";

interface BaseProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

function FieldShell({ label, name, error, hint, required, className, children }: BaseProps & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  type = "text",
  defaultValue,
  placeholder,
  autoComplete = "off",
  ...props
}: BaseProps & { type?: string; defaultValue?: string | null; placeholder?: string; autoComplete?: string }) {
  return (
    <FieldShell {...props}>
      <input
        id={props.name}
        name={props.name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!props.error}
        aria-describedby={props.error ? `${props.name}-error` : undefined}
        className={cn("input", props.error && "input-error")}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  defaultValue,
  placeholder,
  rows = 3,
  ...props
}: BaseProps & { defaultValue?: string | null; placeholder?: string; rows?: number }) {
  return (
    <FieldShell {...props}>
      <textarea
        id={props.name}
        name={props.name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        aria-invalid={!!props.error}
        className={cn("input", props.error && "input-error")}
      />
    </FieldShell>
  );
}

export function SelectField({
  options,
  defaultValue,
  includeBlank,
  ...props
}: BaseProps & { options: readonly string[]; defaultValue?: string | null; includeBlank?: string }) {
  return (
    <FieldShell {...props}>
      <select
        id={props.name}
        name={props.name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={!!props.error}
        className={cn("input", props.error && "input-error")}
      >
        {includeBlank !== undefined && <option value="">{includeBlank}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
