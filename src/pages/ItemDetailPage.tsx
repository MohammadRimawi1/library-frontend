import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Globe,
  User,
  Bookmark,
  Undo2,
} from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { itemTypeLabels, isPhysical, isOnline, formatDate } from "@/lib/format";
import type { LibraryItem, Copy } from "@/types";

function copyStatusBadge(status: Copy["status"]) {
  switch (status) {
    case "AVAILABLE":
      return <Badge variant="success">Available</Badge>;
    case "BORROWED":
      return <Badge variant="danger">Borrowed</Badge>;
    case "RESERVED":
      return <Badge variant="warning">Reserved</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isBorrower = hasRole("BORROWER");

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<LibraryItem>(`/library-items/${id}`);
      setItem(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 404) {
          setError(
            "This item could not be found. It may have been removed from the catalog.",
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Unable to load this item. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleReserve = async () => {
    if (!item) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.post("/reservations", { itemId: item.id });
      setActionSuccess(
        'Reservation created successfully. Check "My Reservations" to track its status.',
      );
      fetchItem();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 409) {
          setActionError(
            "This item was just reserved by someone else. Please try again or check back later.",
          );
        } else if (err.status === 403) {
          setActionError("You do not have permission to reserve items.");
        } else {
          setActionError(err.message);
        }
      } else {
        setActionError(
          "Unable to complete this reservation. Please try again.",
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async (copyId?: string) => {
    if (!item) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.post("/reservations/return", { itemId: item.id, copyId });
      setActionSuccess("Item returned successfully.");
      fetchItem();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setActionError(err.message);
      } else {
        setActionError("Unable to process the return. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading item…" />;
  if (error)
    return (
      <div>
        <button onClick={() => navigate("/catalog")} className="btn-ghost mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </button>
        <ErrorState message={error} onRetry={fetchItem} />
      </div>
    );
  if (!item) return null;

  const available = isPhysical(item.type)
    ? (item.availableCopies ?? 0) > 0
    : true;

  return (
    <div>
      <Link to="/catalog" className="btn-ghost mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: image + key info */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex h-64 items-center justify-center overflow-hidden rounded-t-xl bg-paper-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <BookOpen className="h-16 w-16 text-paper-400" />
              )}
            </div>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">{itemTypeLabels[item.type]}</Badge>
                {isPhysical(item.type) ? (
                  <Badge variant={available ? "success" : "danger"}>
                    {available
                      ? `${item.availableCopies} of ${item.numOfCopies} available`
                      : "All copies unavailable"}
                  </Badge>
                ) : (
                  <Badge variant="success">Always available</Badge>
                )}
              </div>
              {item.language && (
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Globe className="h-4 w-4 text-ink-400" />
                  {item.language}
                </div>
              )}
              {item.edition && (
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <BookOpen className="h-4 w-4 text-ink-400" />
                  {item.edition}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: details + actions */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h1 className="text-2xl font-semibold text-ink-800">
                  {item.title}
                </h1>
                {item.author?.name && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                    <User className="h-4 w-4" />
                    {item.author.name}
                    {item.author.nationality && ` · ${item.author.nationality}`}
                    {item.author.birthDate &&
                      ` · b. ${formatDate(item.author.birthDate)}`}
                  </p>
                )}
              </div>

              {item.description && (
                <div>
                  <h2 className="mb-1 text-sm font-semibold text-ink-600">
                    Description
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-600">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Borrower actions */}
              {isBorrower && (
                <div className="border-t border-paper-200 pt-4">
                  {actionError && (
                    <div className="mb-3">
                      <Alert variant="error">{actionError}</Alert>
                    </div>
                  )}
                  {actionSuccess && (
                    <div className="mb-3">
                      <Alert variant="success">{actionSuccess}</Alert>
                    </div>
                  )}

                  {isOnline(item.type) ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button onClick={handleReserve} loading={actionLoading}>
                        <Bookmark className="h-4 w-4" />
                        Reserve online item
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleReturn()}
                        loading={actionLoading}
                      >
                        <Undo2 className="h-4 w-4" />
                        Return
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        onClick={handleReserve}
                        loading={actionLoading}
                        disabled={!available}
                      >
                        <Bookmark className="h-4 w-4" />
                        Reserve this item
                      </Button>
                      <span className="text-xs text-ink-400">
                        {available
                          ? "You will be placed in the reservation queue."
                          : "Currently unavailable — reserving will place you in the queue."}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Physical copies table */}
          {isPhysical(item.type) && item.copies && item.copies.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="mb-3 text-lg font-semibold text-ink-800">
                  Individual copies
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-paper-200 text-left text-xs uppercase tracking-wide text-ink-400">
                        <th className="pb-2 pr-4 font-medium">Copy #</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        {isBorrower && (
                          <th className="pb-2 font-medium">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {item.copies.map((copy, idx) => (
                        <tr
                          key={copy.id}
                          className="border-b border-paper-100 last:border-0"
                        >
                          <td className="py-2.5 pr-4 text-ink-600">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 pr-4">
                            {copyStatusBadge(copy.status)}
                          </td>
                          {isBorrower && (
                            <td className="py-2.5">
                              {copy.status === "AVAILABLE" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleReturn(copy.id)}
                                  loading={actionLoading}
                                >
                                  <Undo2 className="h-3.5 w-3.5" />
                                  Return
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
