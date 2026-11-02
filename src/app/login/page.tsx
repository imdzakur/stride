import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { DeviceGate } from '@/components/device-gate/device-gate';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <DeviceGate>
      <LoginForm />
    </DeviceGate>
  );
}
