"use client";

import {
  CSSProperties,
  KeyboardEvent,
  ClipboardEvent,
  FocusEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

interface Props {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  onChange: (next: string) => void;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

export interface EditableTextHandle {
  focus: () => void;
}

/**
 * Inline-editable text element. Click to edit, blur or Enter to commit.
 *
 * - Single-line (default): Enter blurs and commits, newlines from paste are
 *   stripped, no line breaks allowed.
 * - Multiline: Enter inserts a newline, Cmd/Ctrl+Enter blurs and commits.
 *   Escape always reverts.
 *
 * Renders a contentEditable span/div so the typography is identical to the
 * surrounding menu text and there's zero layout shift on focus.
 *
 * When `disabled` is true, the element renders the value as plain text with
 * no editing affordances. Useful for read-only states.
 */
const EditableText = forwardRef<EditableTextHandle, Props>(function EditableText(
  {
    value,
    placeholder,
    multiline = false,
    disabled = false,
    onChange,
    className,
    style,
    ariaLabel,
  },
  ref
) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const isFocused = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        elementRef.current?.focus();
      },
    }),
    []
  );

  // Keep DOM in sync when value changes from above (e.g. external state reset)
  // but never overwrite while the user is actively typing.
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    if (!isFocused.current && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  const handleFocus = useCallback((e: FocusEvent<HTMLSpanElement>) => {
    isFocused.current = true;
    // Select all on first focus so typing replaces existing text by default.
    const range = document.createRange();
    range.selectNodeContents(e.currentTarget);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLSpanElement>) => {
      isFocused.current = false;
      const text = e.currentTarget.textContent ?? "";
      const cleaned = multiline ? text : text.replace(/\r?\n/g, " ").trim();
      if (cleaned !== value) {
        onChange(cleaned);
      }
      e.currentTarget.textContent = cleaned;
    },
    [multiline, onChange, value]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (elementRef.current) elementRef.current.textContent = value;
        elementRef.current?.blur();
        return;
      }
      if (e.key === "Enter") {
        if (multiline) {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            elementRef.current?.blur();
          }
        } else {
          e.preventDefault();
          elementRef.current?.blur();
        }
      }
    },
    [multiline, value]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLSpanElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      const cleaned = multiline ? text : text.replace(/\r?\n/g, " ");
      document.execCommand("insertText", false, cleaned);
    },
    [multiline]
  );

  const isEmpty = value.length === 0;
  const Tag = multiline ? "div" : "span";

  if (disabled) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      ref={elementRef as React.RefObject<HTMLDivElement & HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel ?? placeholder ?? "Editable text"}
      data-editable="true"
      data-empty={isEmpty ? "true" : undefined}
      data-placeholder={placeholder}
      className={className}
      style={style}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    >
      {value}
    </Tag>
  );
});

export default EditableText;
