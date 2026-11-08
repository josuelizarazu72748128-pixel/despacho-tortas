"use client";

import { useState } from "react";
import { useData } from "@/lib/storage";

export default function LugaresPage() {
  const { data, addPlace, updatePlace, deletePlace } = useData();
  const [newName, setNewName] = useState("");
  const [copyFrom, setCopyFrom] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    addPlace(name, copyFrom || undefined);
    setNewName("");
    setCopyFrom("");
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

  return (
    <div className="flex-1 space-y-6 px-4 py-5 sm:px-6">
      <section className="rounded-2xl bg-peach-100 p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-orange-strong-700">
          Nuevo lugar / sucursal
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del lugar (ej. Colomi)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-peach-300 bg-white px-4 text-base"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-orange-strong-700">
              Copiar lista de precios de (opcional)
            </label>
            <select
              value={copyFrom}
              onChange={(e) => setCopyFrom(e.target.value)}
              className="h-12 w-full rounded-xl border-2 border-peach-300 bg-white px-3 text-base"
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
            className="h-12 w-full rounded-xl bg-orange-strong-500 font-bold text-white shadow active:scale-95 disabled:opacity-40"
          >
            Crear lugar
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-bold text-orange-strong-700">
          Lugares existentes ({data.places.length})
        </h2>
        {data.places.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
            {editingId === p.id ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  className="h-12 flex-1 rounded-xl border-2 border-peach-300 px-3 text-base"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="h-12 flex-1 rounded-xl bg-orange-strong-500 px-4 font-semibold text-white active:scale-95 sm:flex-none"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="h-12 flex-1 rounded-xl bg-peach-200 px-4 font-semibold text-orange-strong-700 active:scale-95 sm:flex-none"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : confirmingId === p.id ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-foreground">
                  ¿Eliminar &ldquo;{p.name}&rdquo;? Se perderán sus precios.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      deletePlace(p.id);
                      setConfirmingId(null);
                    }}
                    className="h-11 flex-1 rounded-xl bg-red-500 px-4 font-semibold text-white active:scale-95 sm:flex-none"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="h-11 flex-1 rounded-xl bg-peach-200 px-4 font-semibold text-orange-strong-700 active:scale-95 sm:flex-none"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-foreground">{p.name}</p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p.id, p.name)}
                    className="h-11 rounded-xl bg-peach-200 px-4 font-semibold text-orange-strong-700 active:scale-95"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(p.id)}
                    className="h-11 rounded-xl bg-peach-100 px-4 font-semibold text-red-500 active:scale-95"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {data.places.length === 0 && (
          <p className="text-center text-sm text-orange-strong-700/80">
            Todavía no hay lugares. Crea el primero arriba.
          </p>
        )}
      </section>
    </div>
  );
}
