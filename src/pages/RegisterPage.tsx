import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ApiRequestError } from '@/lib/api';

interface FormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (!form.phoneNumber.trim()) {
      e.phoneNumber = 'Phone number is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      navigate('/catalog');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 400) {
          setSubmitError(err.message);
        } else if (err.status === 409) {
          setSubmitError('An account with this email already exists. Try signing in instead.');
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-forest-600" strokeWidth={2} />
            <span className="font-serif text-2xl font-semibold text-ink-800">Athenaeum</span>
          </Link>
          <p className="mt-2 text-sm text-ink-400">Library Management System</p>
        </div>

        <div className="card p-8">
          <h1 className="mb-1 text-2xl font-semibold text-ink-800">Create your account</h1>
          <p className="mb-6 text-sm text-ink-400">
            New members join as borrowers and can browse and reserve items.
          </p>

          {submitError && (
            <div className="mb-4">
              <Alert variant="error">{submitError}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Jane Doe"
              autoComplete="name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            <Input
              label="Phone number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              error={errors.phoneNumber}
              placeholder="+1 555 000 1234"
              autoComplete="tel"
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-forest-600 hover:text-forest-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
