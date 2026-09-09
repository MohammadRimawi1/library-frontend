import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Undo2, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { itemTypeLabels, formatDate } from '@/lib/format';
import type { Reservation, ReservationStatus } from '@/types';

const statusFilters: (ReservationStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'ACTIVE',
  'RETURNED',
  'EXPIRED',
];

const statusIcons: Record<ReservationStatus, typeof Clock> = {
  PENDING: Clock,
  ACTIVE: BookOpen,
  RETURNED: CheckCircle2,
  EXPIRED: XCircle,
};

export function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
        setError('Unable to load your reservations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleReturn = async (itemId: string, copyId?: string) => {
    setActionLoading(itemId);
    setActionError(null);
    try {
      await api.post('/reservations/return', { itemId, copyId });
      fetchReservations();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setActionError(err.message);
      } else {
        setActionError('Unable to process the return. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reservations.filter(
    (r) => filter === 'ALL' || r.status === filter,
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">My Reservations</h1>
        <p className="mt-1 text-sm text-ink-400">
          Track the status of items you've reserved and return active ones.
        </p>
      </div>

      {actionError && (
        <div className="mb-4">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-forest-600 text-white'
                : 'bg-paper-100 text-ink-500 hover:bg-paper-200'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading your reservations…" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReservations} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-12 w-12" />}
          title="No reservations yet"
          description="Browse the catalog to reserve your first item."
          action={
            <Link to="/catalog">
              <Button variant="secondary">Browse catalog</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((res) => {
            const Icon = statusIcons[res.status] || Clock;
            return (
              <Card key={res.id} hover>
                <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-paper-100 text-forest-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink-800">
                          {res.itemTitle || 'Library Item'}
                        </h3>
                        <StatusBadge status={res.status} />
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-400">
                        {res.itemType && <span>{itemTypeLabels[res.itemType]}</span>}
                        {res.reservationDate && (
                          <span>Reserved {formatDate(res.reservationDate)}</span>
                        )}
                        {res.dueDate && <span>Due {formatDate(res.dueDate)}</span>}
                        {res.returnDate && <span>Returned {formatDate(res.returnDate)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/catalog/${res.itemId}`}>
                      <Button variant="ghost" size="sm">
                        View item
                      </Button>
                    </Link>
                    {res.status === 'ACTIVE' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={actionLoading === res.itemId}
                        onClick={() => handleReturn(res.itemId, res.copyId)}
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Return
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
