import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { useFormStatus } from "react-dom";
import Button from "./Button";

interface AddModalProps {
  onAdd: (text: string) => boolean | Promise<boolean>;
  onClose: () => void;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button variant="primary" type="submit" disabled={disabled} busy={pending}>
      Add
    </Button>
  );
}

export default function AddModal({ onAdd, onClose }: AddModalProps) {
  const [text, setText] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) throw new Error("Add dialog is not mounted");
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const closeModal = () => {
    dialogRef.current?.close();
    onClose();
  };

  const preventDuplicateSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    // Block repeated events before React renders the pending state.
    if (submittingRef.current || !dialogRef.current?.open || !text.trim()) {
      e.preventDefault();
      return;
    }
    submittingRef.current = true;
  };

  const handleSubmit = async () => {
    try {
      if ((await onAdd(text)) && dialogRef.current?.open) closeModal();
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="overlay"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
      onCancel={(e) => {
        e.preventDefault();
        closeModal();
      }}
    >
      <div className="modal">
        <form action={handleSubmit} onSubmit={preventDuplicateSubmit} autoComplete="off">
          <label id="modal-title" className="modal__title" htmlFor="item-input">
            Add item to list
          </label>
          <input
            id="item-input"
            className="field"
            type="text"
            placeholder="Type the text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div className="modal__actions">
            <SubmitButton disabled={text.trim() === ""} />
            <Button onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
