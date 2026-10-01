"use client";

import { useEffect, useMemo, useState } from "react";
import { RequireRole } from "@code/guards";
import { selectCoinHistory, selectPlayerProfile, useAppSelector } from "@code/state";
import { AuthorRole, CoinAdjustmentType } from "@shared/enums";
import type { CoinHistoryEntry } from "@shared/types";
import { ADMIN_ROLES } from "@shared/utils";
import { Button } from "@shared/components";
import { CoinHistoryRow } from "./components/CoinHistoryRow";

const MAX_HISTORY_ROWS_PER_PAGE = 50;

export interface CoinHistoryFilters {
  playerName: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string | number;
  amountMax: string | number;
}

export function getVisibleCoinHistory(
  entries: CoinHistoryEntry[],
  role: AuthorRole,
  profileId: string,
): CoinHistoryEntry[] {
  if (role === AuthorRole.BrgyAdmin || role === AuthorRole.SuperAdmin) return entries;
  return entries.filter((entry) => entry.userId === profileId);
}

function normalizeFilterNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function filterCoinHistory(entries: CoinHistoryEntry[], filters: CoinHistoryFilters): CoinHistoryEntry[] {
  const playerName = (filters.playerName ?? "").trim().toLowerCase();
  const amountMin = normalizeFilterNumber(filters.amountMin);
  const amountMax = normalizeFilterNumber(filters.amountMax);

  const normalizedFrom = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
  const normalizedTo = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`) : null;

  return [...entries]
    .filter((entry) => {
      const matchesPlayer = !playerName || entry.userName.toLowerCase().includes(playerName);
      const matchesDateFrom = !normalizedFrom || new Date(entry.createdAt) >= normalizedFrom;
      const matchesDateTo = !normalizedTo || new Date(entry.createdAt) <= normalizedTo;
      const matchesAmountMin = amountMin === null || entry.amount >= amountMin;
      const matchesAmountMax = amountMax === null || entry.amount <= amountMax;

      return matchesPlayer && matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function paginateHistory(entries: CoinHistoryEntry[], page: number, pageSize = MAX_HISTORY_ROWS_PER_PAGE) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), MAX_HISTORY_ROWS_PER_PAGE);
  const startIndex = (safePage - 1) * safePageSize;

  return entries.slice(startIndex, startIndex + safePageSize);
}

function escapeCsvValue(value: string | number): string {
  const stringValue = String(value ?? "");
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function buildHistoryExportRows(entries: CoinHistoryEntry[]) {
  return entries.map((entry) => ({
    Date: new Date(entry.createdAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    Player: entry.userName,
    Type: entry.adjustmentType === CoinAdjustmentType.Credit ? "Credit" : "Debit",
    Amount: entry.amount,
    Reason: entry.reason,
    Admin: entry.adminName,
  }));
}

function exportCoinHistoryToCsv(entries: CoinHistoryEntry[]) {
  const rows = buildHistoryExportRows(entries);
  const headers = ["Date", "Player", "Type", "Amount", "Reason", "Admin"];
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header as keyof typeof row])).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `coin-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const EMPTY_FILTERS: CoinHistoryFilters = {
  playerName: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
};

export function CoinHistoryPage() {
  const history = useAppSelector(selectCoinHistory);
  const profile = useAppSelector(selectPlayerProfile);
  const visibleHistory = useMemo(
    () => getVisibleCoinHistory(history, profile.role, profile.id),
    [history, profile.id, profile.role],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CoinHistoryFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const historyWithGlobalSearch = !term
      ? visibleHistory
      : visibleHistory.filter((entry) => {
          const searchableText = [entry.userName, entry.reason, entry.adminName]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(term);
        });

    return filterCoinHistory(historyWithGlobalSearch, filters);
  }, [visibleHistory, searchTerm, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / MAX_HISTORY_ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedHistory = useMemo(
    () => paginateHistory(filteredHistory, safePage, MAX_HISTORY_ROWS_PER_PAGE),
    [filteredHistory, safePage]
  );

  const updateFilter = (field: keyof CoinHistoryFilters, value: string) => {
    setFilters((previous) => ({ ...previous, [field]: value }));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return (
    <RequireRole currentRole={profile.role} allowedRoles={[...ADMIN_ROLES, AuthorRole.Player]}>
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Coin History</h2>
            <p className="text-sm text-slate-400">
              {profile.role === AuthorRole.Player
                ? "Your coin credits and deductions, most recent first."
                : "Every coin credit and deduction applied to any user, most recent first."}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full md:w-auto"
            onClick={() => exportCoinHistoryToCsv(filteredHistory)}
            disabled={filteredHistory.length === 0}
          >
            Export to Excel
          </Button>
        </header>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4 shadow-sm">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="coin-history-search">
              Search
            </label>
            <input
              id="coin-history-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by player name or reason"
              aria-label="Search coin history"
              className="w-full rounded-lg border border-slate-600 bg-slate-100 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div className="border-t border-slate-700 pt-4">
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersOpen((current) => !current)}
              aria-expanded={isAdvancedFiltersOpen}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-700/50"
            >
              <span>Advanced filters</span>
              <span className="text-base text-slate-300">{isAdvancedFiltersOpen ? "−" : "+"}</span>
            </button>

            {isAdvancedFiltersOpen && (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>Player Name</span>
                  <input
                    value={filters.playerName}
                    onChange={(event) => updateFilter("playerName", event.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="rounded-lg border border-slate-600 bg-slate-100 px-3 py-2 text-sm text-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>Date From</span>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => updateFilter("dateFrom", event.target.value)}
                    className="rounded-lg border border-slate-600 bg-slate-100 px-3 py-2 text-sm text-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>Date To</span>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(event) => updateFilter("dateTo", event.target.value)}
                    className="rounded-lg border border-slate-600 bg-slate-100 px-3 py-2 text-sm text-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>Amount Min</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.amountMin}
                    onChange={(event) => updateFilter("amountMin", event.target.value)}
                    placeholder="0"
                    className="rounded-lg border border-slate-600 bg-slate-100 px-3 py-2 text-sm text-slate-900"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>Amount Max</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.amountMax}
                    onChange={(event) => updateFilter("amountMax", event.target.value)}
                    placeholder="500"
                    className="rounded-lg border border-slate-600 bg-slate-100 px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3" aria-label="Coin history entries">
          {paginatedHistory.length === 0 ? (
            <p className="text-sm text-slate-400">No coin history entries match the current filters.</p>
          ) : (
            paginatedHistory.map((entry) => <CoinHistoryRow key={entry.id} entry={entry} />)
          )}
        </div>

        {filteredHistory.length > MAX_HISTORY_ROWS_PER_PAGE && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-300">
            <span>
              Page {safePage} of {totalPages} · {filteredHistory.length} total records
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={safePage === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </RequireRole>
  );
}
