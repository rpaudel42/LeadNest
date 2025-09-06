
import Link from 'next/link';
import Container from '@/components/Container';

export default function Home() {
  return (
    <Container>
      <h1 className="text-3xl font-semibold">Social Media AI Agent</h1>
      <p className="mt-2 text-zinc-600">Welcome! Use the admin to invite businesses or sign in if you have an invite.</p>
      <div className="mt-6 flex gap-3">
        <Link className="underline" href="/admin">Go to Admin</Link>
        <Link className="underline" href="/signin">Sign In</Link>
        <Link className="underline" href="/signup">Sign Up (with invite)</Link>
      </div>
    </Container>
  );
}
