import { redirect } from 'next/navigation';

// The proxy already sends users without a session to /login before this page runs.
export default function HomePage() {
  redirect('/dashboard');
}
