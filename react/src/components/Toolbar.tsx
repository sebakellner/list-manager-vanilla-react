import type { Ref } from "react";
import Button from "./Button";

interface ToolbarProps {
  canUndo: boolean;
  hasSelection: boolean;
  onUndo: () => void;
  onDelete: () => void;
  onAdd: () => void;
  addRef: Ref<HTMLButtonElement>;
}

export default function Toolbar({
  canUndo,
  hasSelection,
  onUndo,
  onDelete,
  onAdd,
  addRef,
}: ToolbarProps) {
  return (
    <div className="actions">
      <div className="actions__group">
        <Button
          variant="icon"
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Undo last change"
          title="Undo"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </Button>
        <Button
          disabled={!hasSelection}
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
      <Button
        ref={addRef}
        variant="primary"
        onClick={onAdd}
      >
        Add
      </Button>
    </div>
  );
}
