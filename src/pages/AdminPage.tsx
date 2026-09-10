import { useState, useCallback } from 'react';
import { UserCog, Search, ArrowUpCircle, ArrowDownCircle, User as UserIcon } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingState } from '@/components/ui/States';
import type { User } from '@/types';

export function AdminPage() {
  const [searchId, setSearchId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'promote' | 'demote' | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchId.trim()) {
      setSearchError('Please enter a user ID.');
      return;
    }
    setLoading(true);
    setSearchError(null);
    setUser(null);
    setActionError(null);
    setActionSuccess(null);
    try {
      const data = await api.get<User>(`/admin/users/${searchId.trim()}`);
      setUser(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 404) {
          setSearchError('No user found with this ID.');
        } else if (err.status === 403) {
          setSearchError('You do not have permission to view users.');
        } else {
          setSearchError(err.message);
        }
      } else {
        setSearchError('Unable to search for users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchId]);

  const handleConfirm = async () => {
    if (!user || !confirmAction) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      if (confirmAction === 'promote') {
        await api.patch(`/admin/users/${user.id}/promote-to-librarian`);
        setUser({ ...user, role: 'LIBRARIAN' });
        setActionSuccess(`${user.name} has been promoted to Librarian.`);
      } else {
        await api.patch(`/admin/users/${user.id}/demote-to-borrower`);
        setUser({ ...user, role: 'BORROWER' });
        setActionSuccess(`${user.name} has been demoted to Borrower.`);
      }
      setConfirmAction(null);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 403) {
          setActionError('You do not have permission to change this user\'s role.');
        } else if (err.status === 404) {
          setActionError('This user could not be found.');
        } else if (err.status === 409) {
          setActionError(err.message);
        } else {
          setActionError(err.message);
        }
      } else {
        setActionError('Unable to update this user. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">Promote / Demote User</h1>
        <p className="mt-1 text-sm text-ink-400">
          Look up a user by their user ID to promote them to librarian or demote them back to borrower.
          Don't have the ID? Check the "All Users" page.
        </p>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="space-y-1">
            <label htmlFor="userId" className="block text-sm font-medium text-ink-700">
              User ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="userId"
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  className="input-field pl-10"
                  placeholder="Paste the user's ID…"
                />
              </div>
              <Button onClick={handleSearch} loading={loading}>
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
            {searchError && <p className="text-xs text-terra-700">{searchError}</p>}
          </div>
        </CardBody>
      </Card>

      {loading && <LoadingState message="Looking up user…" />}

      {user && (
        <div className="space-y-4">
          {actionError && <Alert variant="error">{actionError}</Alert>}
          {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}

          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-800">{user.name}</h3>
                <p className="text-sm text-ink-400">{user.email}</p>
                <p className="text-xs text-ink-400">ID: {user.id}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-600">
                    {user.role}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {user.role === 'BORROWER' && (
            <div className="flex justify-end">
              <Button onClick={() => setConfirmAction('promote')}>
                <ArrowUpCircle className="h-4 w-4" />
                Promote to Librarian
              </Button>
            </div>
          )}

          {user.role === 'LIBRARIAN' && (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setConfirmAction('demote')}>
                <ArrowDownCircle className="h-4 w-4" />
                Demote to Borrower
              </Button>
            </div>
          )}

          {user.role === 'ADMIN' && (
            <Card>
              <CardBody>
                <EmptyState
                  icon={<UserCog className="h-8 w-8" />}
                  title="This user is an admin"
                  description="Admin accounts can't be promoted or demoted from here."
                />
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {!user && !loading && !searchError && (
        <EmptyState
          icon={<UserCog className="h-12 w-12" />}
          title="Search for a user"
          description="Paste a user ID above to look up a user and promote or demote their role."
        />
      )}

      <Modal
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === 'promote' ? 'Confirm promotion' : 'Confirm demotion'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            {confirmAction === 'promote' ? (
              <>
                Are you sure you want to promote{' '}
                <span className="font-semibold text-ink-800">{user?.name}</span> to librarian?
                They will gain access to catalog management and reservation oversight.
              </>
            ) : (
              <>
                Are you sure you want to demote{' '}
                <span className="font-semibold text-ink-800">{user?.name}</span> to borrower?
                They will lose access to catalog management and reservation oversight.
              </>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'promote' ? 'primary' : 'secondary'}
              onClick={handleConfirm}
              loading={actionLoading}
            >
              {confirmAction === 'promote' ? 'Yes, promote' : 'Yes, demote'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}