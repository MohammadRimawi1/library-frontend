import { useState, useCallback } from 'react';
import { UserX, Search, Trash2, User as UserIcon } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingState } from '@/components/ui/States';
import type { User } from '@/types';

export function DeleteUserPage() {
  const [searchId, setSearchId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletedName, setDeletedName] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchId.trim()) {
      setSearchError('Please enter a user ID.');
      return;
    }
    setLoading(true);
    setSearchError(null);
    setUser(null);
    setDeleteError(null);
    setDeletedName(null);
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

  const handleDelete = async () => {
    if (!user) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/users/${user.id}`);
      setDeletedName(user.name);
      setUser(null);
      setSearchId('');
      setConfirmOpen(false);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          setDeleteError(err.message);
        } else if (err.status === 404) {
          setDeleteError('This user could not be found.');
        } else {
          setDeleteError(err.message);
        }
      } else {
        setDeleteError('Unable to delete this user. Please try again.');
      }
      setConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">Delete User</h1>
        <p className="mt-1 text-sm text-ink-400">
          Permanently delete a user and their entire reservation history. This cannot be undone.
          Don't have the ID? Check the "All Users" page.
        </p>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="space-y-1">
            <label htmlFor="deleteUserId" className="block text-sm font-medium text-ink-700">
              User ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="deleteUserId"
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

      {deletedName && <Alert variant="success">{deletedName} has been permanently deleted.</Alert>}
      {deleteError && <Alert variant="error">{deleteError}</Alert>}

      {user && (
        <div className="space-y-4">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terra-100 text-terra-700">
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

          <div className="flex justify-end">
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete User
            </Button>
          </div>
        </div>
      )}

      {!user && !loading && !searchError && !deletedName && (
        <EmptyState
          icon={<UserX className="h-12 w-12" />}
          title="Search for a user"
          description="Paste a user ID above to look them up, then delete their account."
        />
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm deletion" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-ink-800">{user?.name}</span>? This will erase their
            account and their entire reservation history. This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Yes, delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}