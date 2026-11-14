import type { DispatchRecord } from "./types";
import { formatBs, formatDateTime } from "./format";

export function buildDispatchText(record: DispatchRecord): string {
  const lines = [
    `Gema Pastelería - Nota de despacho #${record.number}`,
    `Lugar: ${record.placeName}`,
  ];
  if (record.driverName) lines.push(`Chofer: ${record.driverName}`);
  lines.push(`Fecha: ${formatDateTime(record.dateISO)}`, "");
  record.items.forEach((item) => {
    lines.push(`${item.qty} x ${item.name} — ${formatBs(item.subtotal)}`);
  });
  lines.push("", `Total: ${formatBs(record.total)}`);
  return lines.join("\n");
}

export function buildWhatsAppShareUrl(record: DispatchRecord): string {
  const text = buildDispatchText(record);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
