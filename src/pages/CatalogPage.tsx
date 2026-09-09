import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, FileText, Monitor, Library } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/States';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { itemTypeLabels, isPhysical } from '@/lib/format';
import type { LibraryItem, ItemType } from '@/types';

const typeFilters: { value: ItemType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All types' },
  { value: 'BookPhysical', label: 'Physical Books' },
  { value: 'StoryPhysical', label: 'Physical Stories' },
  { value: 'BookOnline', label: 'Online Books' },
  { value: 'StoryOnline', label: 'Online Stories' },
];

function typeIcon(type: ItemType) {
  if (type === 'BookPhysical' || type === 'BookOnline')
    return <BookOpen className="h-5 w-5 text-forest-600" />;
  if (type === 'StoryPhysical' || type === 'StoryOnline')
    return <FileText className="h-5 w-5 text-forest-600" />;
  return <Library className="h-5 w-5 text-forest-600" />;
}

export function CatalogPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemType | 'ALL'>('ALL');

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<LibraryItem[]>('/library-items');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('Unable to load the catalog. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">Catalog</h1>
        <p className="mt-1 text-sm text-ink-400">
          Browse the library collection. Search by title or author, and filter by type.
        </p>
      </div>

      {/* Search & filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author…"
            className="input-field pl-10"
            aria-label="Search catalog"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ItemType | 'ALL')}
          className="input-field sm:w-52"
          aria-label="Filter by type"
        >
          {typeFilters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState message="Loading catalog…" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchItems} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Library className="h-12 w-12" />}
          title="No items found"
          description={
            search || typeFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'The catalog is currently empty.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <Link key={item.id} to={`/catalog/${item.id}`} className="block">
              <Card hover className="group h-full">
                <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-t-xl bg-paper-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-paper-400">
                      {typeIcon(item.type)}
                    </div>
                  )}
                </div>
                <CardBody className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{itemTypeLabels[item.type]}</Badge>
                    {isPhysical(item.type) && item.availableCopies !== undefined && (
                      <Badge variant={item.availableCopies > 0 ? 'success' : 'danger'}>
                        {item.availableCopies > 0
                          ? `${item.availableCopies} available`
                          : 'Unavailable'}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-serif text-base font-semibold leading-snug text-ink-800 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-500">
                    {item.author?.name || 'Unknown author'}
                  </p>
                  {item.language && (
                    <p className="text-xs text-ink-400">{item.language}</p>
                  )}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
