import { useState, useEffect, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingState, EmptyState } from '@/components/ui/States';
import type { User } from '@/types';

export function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    setListLoading(true);
    setListError(null);
    api
      .get<User[]>('/admin/users')
      .then(setAllUsers)
      .catch(() => setListError('Unable to load users.'))
      .finally(() => setListLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [allUsers, filterText]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">All Users</h1>
        <p className="mt-1 text-sm text-ink-400">
          Browse every account. Click an ID to select it, then copy it into the Promote/Demote or
          Delete User pages.
        </p>
      </div>

      <Card>
        <CardBody>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="input-field pl-10"
              placeholder="Filter by name or email…"
            />
          </div>

          {listLoading && <LoadingState message="Loading users…" />}
          {listError && <Alert variant="error">{listError}</Alert>}

          {!listLoading && !listError && (
            <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-paper-200">
              {filteredUsers.length === 0 ? (
                <EmptyState icon={<Users className="h-10 w-10" />} title="No users match this filter" />
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-paper-100 text-left text-xs font-semibold text-ink-500">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-paper-200">
                        <td className="px-3 py-2 text-ink-700">{u.name}</td>
                        <td className="px-3 py-2 text-ink-500">{u.email}</td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">
                            {u.role}
                          </span>
                        </td>
                        <td className="select-all px-3 py-2 font-mono text-xs text-ink-500">{u.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}