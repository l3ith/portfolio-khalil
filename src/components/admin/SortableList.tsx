"use client";

import { useState, useTransition, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Item = { id: string };

export type DragHandleProps = {
  ref: (el: HTMLElement | null) => void;
  style: CSSProperties;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

export function SortableList<T extends Item>({
  items: initial,
  onReorder,
  renderItem,
  containerStyle,
}: {
  items: T[];
  onReorder: (ids: string[]) => Promise<void> | void;
  renderItem: (item: T, dragHandleProps: DragHandleProps) => ReactNode;
  containerStyle?: CSSProperties;
}) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const initialIds = initial.map((i) => i.id).join(",");
  const currentIds = items.map((i) => i.id).join(",");
  if (initial.length !== items.length && initialIds !== currentIds) {
    setItems(initial);
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next);
    startTransition(async () => {
      await onReorder(next.map((i) => i.id));
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div style={containerStyle}>
          {items.map((it) => (
            <SortableRow key={it.id} id={it.id}>
              {(handle) => renderItem(it, handle)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handle: DragHandleProps) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? "rgba(0,0,0,0.04)" : undefined,
  };

  const handle: DragHandleProps = {
    ref: setActivatorNodeRef,
    style: {
      cursor: "grab",
      userSelect: "none",
      padding: "0 6px",
      color: "var(--muted)",
      fontFamily: "var(--font-jetbrains-mono)",
      fontSize: 13,
    },
    attributes,
    listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  );
}

export function DragHandle({ handle }: { handle: DragHandleProps }) {
  return (
    <span
      ref={handle.ref}
      style={handle.style}
      {...handle.attributes}
      {...handle.listeners}
      aria-label="Drag to reorder"
      title="Drag to reorder"
    >
      ⋮⋮
    </span>
  );
}
