import { useRef, useState } from "react";
import { useItemList } from "./hooks/useItemList";
import ItemList from "./components/ItemList";
import Toolbar from "./components/Toolbar";
import AddModal from "./components/AddModal";

const INITIAL_ITEMS = ["Item 1", "Item 2", "Item 3", "Item 4"];

export default function App() {
  const list = useItemList(INITIAL_ITEMS);
  const [modalOpen, setModalOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const closeModal = () => {
    setModalOpen(false);
    addBtnRef.current?.focus();
  };

  return (
    <>
      <main className="card">
        <h1>This is a technical proof</h1>
        <p className="intro">
          Lorem ipsum dolor sit amet consectetur adipiscing, elit mus primis nec
          inceptos. Lacinia habitasse arcu molestie maecenas cursus quam nunc,
          hendrerit posuere augue fames dictumst placerat porttitor, dis mi
          pharetra vestibulum venenatis phasellus.
        </p>

        <ItemList
          items={list.items}
          onToggle={list.toggleItem}
          onDelete={list.deleteItem}
        />

        <Toolbar
          canUndo={list.canUndo}
          hasSelection={list.hasSelection}
          onUndo={list.undo}
          onDelete={list.deleteSelected}
          onAdd={() => setModalOpen(true)}
          addRef={addBtnRef}
        />
      </main>

      {modalOpen && <AddModal onAdd={list.addItem} onClose={closeModal} />}
    </>
  );
}
