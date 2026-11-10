"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { BinId } from "@/lib/bins";

export type HistoryEntry = {
  id: string;
  at: number;
  name: string;
  bin: BinId;
  thumb?: string;
};

const KEY = "sorter:historik:v1";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getRaw() {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function useHistory(): HistoryEntry[] {
  const raw = useSyncExternalStore(subscribe, getRaw, () => "[]");
  return useMemo(() => {
    try {
      return JSON.parse(raw) as HistoryEntry[];
    } catch {
      return [];
    }
  }, [raw]);
}

export function addHistory(entries: Omit<HistoryEntry, "id" | "at">[]) {
  try {
    const current = JSON.parse(getRaw()) as HistoryEntry[];
    const now = Date.now();
    const added = entries.map((e, i) => ({ ...e, id: `${now}-${i}`, at: now }));
    localStorage.setItem(KEY, JSON.stringify([...added, ...current].slice(0, 40)));
    emit();
  } catch {
    /* fuld lagerplads – ignorer */
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignorer */
  }
  emit();
}

export function removeHistory(id: string) {
  try {
    const current = JSON.parse(getRaw()) as HistoryEntry[];
    localStorage.setItem(KEY, JSON.stringify(current.filter((e) => e.id !== id)));
    emit();
  } catch {
    /* ignorer */
  }
}
