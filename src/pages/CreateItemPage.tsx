import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, FileText, Monitor, Globe } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { isPhysical } from '@/lib/format';
import type { ItemType } from '@/types';

interface FormData {
  type: ItemType;
  title: string;
  numOfCopies: string;
  description: string;
  language: string;
  edition: string;
  image: string;
  authorName: string;
  authorNationality: string;
  authorBirthDate: string;
}

interface FormErrors {
  type?: string;
  title?: string;
  numOfCopies?: string;
  authorName?: string;
}

const itemTypes: { value: ItemType; label: string; icon: typeof BookOpen }[] = [
  { value: 'BookPhysical', label: 'Physical Book', icon: BookOpen },
  { value: 'StoryPhysical', label: 'Physical Story', icon: FileText },
  { value: 'BookOnline', label: 'Online Book', icon: Monitor },
  { value: 'StoryOnline', label: 'Online Story', icon: Globe },
];

export function CreateItemPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    type: 'BookPhysical',
    title: '',
    numOfCopies: '1',
    description: '',
    language: '',
    edition: '',
    image: '',
    authorName: '',
    authorNationality: '',
    authorBirthDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.authorName.trim()) e.authorName = 'Author name is required';
    if (isPhysical(form.type)) {
      const n = parseInt(form.numOfCopies, 10);
      if (isNaN(n) || n < 1) e.numOfCopies = 'Must be at least 1 copy';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);

    const body: Record<string, unknown> = {
      type: form.type,
      title: form.title,
      description: form.description || undefined,
      language: form.language || undefined,
      edition: form.edition || undefined,
      image: form.image || undefined,
      author: {
        name: form.authorName,
        nationality: form.authorNationality || undefined,
        birthDate: form.authorBirthDate || undefined,
      },
    };

    if (isPhysical(form.type)) {
      body.numOfCopies = parseInt(form.numOfCopies, 10);
    }

    try {
      await api.post('/library-items', body);
      navigate('/catalog');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 400) {
          setSubmitError(err.message);
        } else if (err.status === 403) {
          setSubmitError('You do not have permission to create library items.');
        } else if (err.status === 409) {
          setSubmitError('An item with these details may already exist.');
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError('Unable to create the item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-800">Add Library Item</h1>
        <p className="mt-1 text-sm text-ink-400">
          Create a new entry in the library catalog.
        </p>
      </div>

      {submitError && (
        <div className="mb-4">
          <Alert variant="error">{submitError}</Alert>
        </div>
      )}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Type selector */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-ink-700">Item type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {itemTypes.map((t) => {
                  const Icon = t.icon;
                  const selected = form.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleChange('type', t.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-forest-500 bg-forest-50 text-forest-700'
                          : 'border-paper-200 bg-white text-ink-500 hover:border-paper-300 hover:bg-paper-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={errors.title}
              placeholder="The Great Gatsby"
            />

            {isPhysical(form.type) && (
              <Input
                label="Number of copies"
                name="numOfCopies"
                type="number"
                min="1"
                value={form.numOfCopies}
                onChange={(e) => handleChange('numOfCopies', e.target.value)}
                error={errors.numOfCopies}
                hint="How many physical copies the library holds."
              />
            )}

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="A brief summary of the item…"
              rows={3}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Language"
                name="language"
                value={form.language}
                onChange={(e) => handleChange('language', e.target.value)}
                placeholder="English"
              />
              <Input
                label="Edition"
                name="edition"
                value={form.edition}
                onChange={(e) => handleChange('edition', e.target.value)}
                placeholder="1st Edition"
              />
            </div>

            <Input
              label="Image URL"
              name="image"
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://example.com/cover.jpg"
              hint="Optional. A URL to the cover image."
            />

            {/* Author section */}
            <div className="border-t border-paper-200 pt-5">
              <h2 className="mb-3 text-sm font-semibold text-ink-700">Author</h2>
              <div className="space-y-4">
                <Input
                  label="Author name"
                  name="authorName"
                  value={form.authorName}
                  onChange={(e) => handleChange('authorName', e.target.value)}
                  error={errors.authorName}
                  placeholder="F. Scott Fitzgerald"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nationality"
                    name="authorNationality"
                    value={form.authorNationality}
                    onChange={(e) => handleChange('authorNationality', e.target.value)}
                    placeholder="American"
                  />
                  <Input
                    label="Birth date"
                    name="authorBirthDate"
                    type="date"
                    value={form.authorBirthDate}
                    onChange={(e) => handleChange('authorBirthDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-paper-200 pt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/catalog')}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                <PlusCircle className="h-4 w-4" />
                Create item
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
