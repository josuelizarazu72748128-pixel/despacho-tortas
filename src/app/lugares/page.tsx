"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2, Check, X } from "lucide-react";
import { useData } from "@/lib/storage";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast, { type ToastData } from "@/components/Toast";

export default function LugaresPage() {
  const { data, addPlace, updatePlace, deletePlace, restorePlace } = useData();
  const [newName, setNewName] = useState("");
  const [copyFrom, setCopyFrom] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    addPlace(name, copyFrom || undefined);
    setNewName("");
    setCopyFrom("");
    setToast({ message: `Lugar "${name}" creado` });
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  function saveEdit() {
    if (!editingId) return;
    const name = editingName.trim();
    if (name) updatePlace(editingId, name);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    const place = data.places.find((p) => p.id === id);
    if (!place) return;
    const prices = data.prices[id] ?? {};
    const meta = data.priceMeta[id];
    deletePlace(id);
    setConfirmingId(null);
    setToast({
      message: `"${place.name}" eliminado`,
      actionLabel: "Deshacer",
      onAction: () => restorePlace(place, prices, meta),
    });
  }

  return (
    <div className="flex-1 space-y-6 px-4 py-5 sm:px-6">
      <section className="rounded-[20px] bg-white p-5 shadow-card">
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-strong">
          Nuevo lugar / sucursal
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del lugar (ej. Colomi)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-[52px] w-full rounded-2xl border-2 border-border-soft bg-white px-4 text-base font-semibold focus:border-orange-700 focus:outline-none"
          />
          <div>
            <label className="mb-1 block text-sm font-bold text-brown-soft">
              Copiar lista de precios de (opcional)
            </label>
            <select
              value={copyFrom}
              onChange={(e) => setCopyFrom(e.target.value)}
              className="h-[52px] w-full rounded-2xl border-2 border-border-soft bg-white px-3 text-base font-semibold focus:border-orange-700 focus:outline-none"
            >
              <option value="">— Sin copiar, empezar vacío —</option>
              {data.places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="gradient-btn flex h-[52px] w-full items-center justify-center rounded-2xl text-base font-bold text-white shadow-btn active:scale-95 disabled:opacity-40"
          >
            Crear lugar
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 font-heading text-lg font-bold text-brown-strong">
          Lugares existentes ({data.places.length})
        </h2>
        {data.places.map((p) => (
          <div key={p.id} className="rounded-[20px] bg-white p-4 shadow-card">
            {editingId === p.id ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  className="h-[52px] flex-1 rounded-2xl border-2 border-border-soft px-3 text-base font-semibold focus:border-orange-700 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-orange-700 px-4 font-bold text-white active:scale-95 sm:flex-none"
                  >
                    <Check size={16} /> Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-peach-soft px-4 font-bold text-brown-strong active:scale-95 sm:flex-none"
                  >
                    <X size={16} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peach-soft text-orange-700">
                    <MapPin size={20} />
                  </div>
                  <p className="truncate font-heading font-bold text-brown-strong">{p.name}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p.id, p.name)}
                    aria-label={`Editar ${p.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-peach-soft text-orange-700 active:scale-90"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(p.id)}
                    aria-label={`Eliminar ${p.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-peach-light text-danger-text active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {data.places.length === 0 && (
          <p className="text-center text-sm font-semibold text-brown-soft">
            Todavía no hay lugares. Crea el primero arriba.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={confirmingId !== null}
        icon={<Trash2 size={20} />}
        title="¿Eliminar este lugar?"
        message={`Se perderán sus precios asociados. Podrás deshacerlo justo después de eliminar.`}
        actions={[
          {
            label: "Sí, eliminar",
            variant: "danger",
            onClick: () => confirmingId && handleDelete(confirmingId),
          },
          { label: "Cancelar", variant: "secondary", onClick: () => setConfirmingId(null) },
        ]}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
