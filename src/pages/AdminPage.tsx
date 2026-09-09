import { useState, useCallback } from 'react';
import { UserCog, Search, ArrowUpCircle, User } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/States';
import type { Borrower } from '@/types';

export function AdminPage() {
  const [searchId, setSearchId] = useState('');
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);
  const [promoteSuccess, setPromoteSuccess] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchId.trim()) {
      setSearchError('Please enter a user ID.');
      return;
    }
    setLoading(true);
    setSearchError(null);
    setBorrower(null);
    setPromoteError(null);
    setPromoteSuccess(null);
    try {
      const data = await api.get<Borrower>(`/borrowers/${searchId.trim()}`);
      setBorrower(data);
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

  const handlePromote = async () => {
    if (!borrower) return;
    setPromoteLoading(true);
    setPromoteError(null);
    setPromoteSuccess(null);
    try {
      // The endpoint to promote is not fully specified; using a reasonable guess
      // based on the API description: promote by user ID
      await api.post(`/borrowers/${borrower.id}/promote`);
      setBorrower({ ...borrower, role: 'LIBRARIAN' });
      setPromoteSuccess(`${borrower.name} has been promoted to Librarian.`);
      setConfirmOpen(false);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 403) {
          setPromoteError('You do not have permission to promote users.');
        } else if (err.status === 404) {
          setPromoteError('This user could not be found.');
        } else if (err.status === 409) {
          setPromoteError('This user is already a librarian or has a conflicting role.');
        } else {
          setPromoteError(err.message);
        }
      } else {
        setPromoteError('Unable to promote this user. Please try again.');
      }
    } finally {
      setPromoteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">Promote Borrower</h1>
        <p className="mt-1 text-sm text-ink-400">
          Look up a borrower by their user ID and promote them to librarian.
        </p>
      </div>

      {/* Search */}
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
                  placeholder="Enter the borrower's user ID…"
                />
              </div>
              <Button onClick={handleSearch} loading={loading}>
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
            {searchError && (
              <p className="text-xs text-terra-700">{searchError}</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      {loading && <LoadingState message="Looking up user…" />}

      {borrower && (
        <div className="space-y-4">
          {promoteError && <Alert variant="error">{promoteError}</Alert>}
          {promoteSuccess && <Alert variant="success">{promoteSuccess}</Alert>}

          <Card>
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-800">{borrower.name}</h3>
                  <p className="text-sm text-ink-400">{borrower.email}</p>
                  {borrower.phoneNumber && (
                    <p className="text-xs text-ink-400">{borrower.phoneNumber}</p>
                  )}
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-600">
                      {borrower.role}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {borrower.role === 'BORROWER' && (
            <div className="flex justify-end">
              <Button onClick={() => setConfirmOpen(true)}>
                <ArrowUpCircle className="h-4 w-4" />
                Promote to Librarian
              </Button>
            </div>
          )}

          {borrower.role === 'LIBRARIAN' && (
            <Card>
              <CardBody>
                <EmptyState
                  icon={<UserCog className="h-8 w-8" />}
                  title="Already a librarian"
                  description="This user has already been promoted to the librarian role."
                />
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {!borrower && !loading && !searchError && (
        <EmptyState
          icon={<UserCog className="h-12 w-12" />}
          title="Search for a borrower"
          description="Enter a user ID above to look up a borrower and promote them to librarian."
        />
      )}

      {/* Confirmation modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm promotion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Are you sure you want to promote{' '}
            <span className="font-semibold text-ink-800">{borrower?.name}</span> to librarian?
            They will gain access to catalog management and reservation oversight.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={promoteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePromote}
              loading={promoteLoading}
            >
              Yes, promote
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
