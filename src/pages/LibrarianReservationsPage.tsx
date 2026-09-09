import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Filter } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { itemTypeLabels, formatDate } from '@/lib/format';
import type { Reservation, ReservationStatus } from '@/types';

const statusFilters: (ReservationStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'ACTIVE',
  'RETURNED',
  'EXPIRED',
];

export function LibrarianReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Reservation[]>('/reservations');
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Unable to load reservations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const matchesStatus = filter === 'ALL' || r.status === filter;
      const matchesSearch =
        !search ||
        r.itemTitle?.toLowerCase().includes(search.toLowerCase()) ||
        r.borrowerName?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [reservations, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: reservations.length };
    for (const r of reservations) {
      c[r.status] = (c[r.status] || 0) + 1;
    }
    return c;
  }, [reservations]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">Reservations Overview</h1>
        <p className="mt-1 text-sm text-ink-400">
          All reservations across the library. Filter by status or search by item or borrower.
        </p>
      </div>

      {/* Filter + search bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-forest-600 text-white'
                  : 'bg-paper-100 text-ink-500 hover:bg-paper-200'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              {counts[f] !== undefined && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    filter === f ? 'bg-forest-800/40' : 'bg-paper-200'
                  }`}
                >
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item or borrower…"
            className="input-field pl-10"
            aria-label="Search reservations"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading reservations…" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReservations} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No reservations found"
          description={
            filter !== 'ALL' || search
              ? 'Try adjusting your filters or search.'
              : 'There are no reservations yet.'
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-200 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Borrower</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Reserved</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-paper-100 last:border-0 hover:bg-paper-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/catalog/${res.itemId}`}
                        className="font-medium text-forest-700 hover:text-forest-800"
                      >
                        {res.itemTitle || 'Unknown item'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {res.borrowerName || '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {res.itemType ? itemTypeLabels[res.itemType] : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {formatDate(res.reservationDate)}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {formatDate(res.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
