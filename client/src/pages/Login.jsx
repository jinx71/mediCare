import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const redirectFor = (user) => {
    const from = location.state?.from?.pathname;
    if (from) return from;
    return user.role === 'admin' ? '/admin' : '/dashboard';
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(redirectFor(user), { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setValue('email', 'admin@medicare.dev');
      setValue('password', 'Admin123!');
    } else {
      setValue('email', 'patient@medicare.dev');
      setValue('password', 'Patient123!');
    }
  };

  return (
    <div className="container-px flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-ink-900">Sign in to MediCare</h1>
          <p className="mt-1 text-sm text-ink-500">Manage appointments and look up drug info.</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <Button className="w-full" size="lg" loading={submitting} onClick={handleSubmit(onSubmit)}>
              Sign in
            </Button>
          </div>

          {/* Demo helper for reviewers */}
          <div className="mt-5 rounded-xl bg-ink-50 p-3">
            <p className="text-center text-xs font-medium text-ink-500">Demo accounts</p>
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => fillDemo('patient')}>
                Patient
              </Button>
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => fillDemo('admin')}>
                Admin
              </Button>
            </div>
          </div>
        </Card>

        <p className="mt-4 text-center text-sm text-ink-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
