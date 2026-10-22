import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Button from "./Button";

interface AddModalProps {
  onAdd: (text: string) => boolean;
  onClose: () => void;
}

export default function AddModal({ onAdd, onClose }: AddModalProps) {
  const [text, setText] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Enter en el input también añade
    if (onAdd(text)) closeModal();
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
        <form onSubmit={handleSubmit} autoComplete="off">
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
            <Button
              variant="primary"
              type="submit"
              disabled={text.trim() === ""}
            >
              Add
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
