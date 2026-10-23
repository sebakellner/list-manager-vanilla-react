import type { ListItem } from "../hooks/useItemList";

interface ItemListProps {
  items: ListItem[];
  onToggle: (id: ListItem["id"]) => void;
  onDelete: (id: ListItem["id"]) => void;
}

export default function ItemList({ items, onToggle, onDelete }: ItemListProps) {
  return (
    <ul
      className="list"
      role="listbox"
      aria-label="Items"
      aria-multiselectable="true"
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="list__item"
          role="option"
          aria-selected={item.selected}
          tabIndex={0}
          onClick={() => onToggle(item.id)}
          onDoubleClick={() => onDelete(item.id)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              onToggle(item.id);
            }
          }}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}
