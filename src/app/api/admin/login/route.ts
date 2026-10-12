import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let valid = false;

    // Check against Turso User table
    try {
      const result = await turso.execute({
        sql: 'SELECT * FROM User WHERE email = ? LIMIT 1',
        args: [email]
      });

      if (result.rows.length > 0) {
        const user = result.rows[0];
        const passwordHash = user.password as string;
        if (passwordHash && bcrypt.compareSync(password, passwordHash)) {
          valid = true;
        }
      }
    } catch (e) {
      console.warn('Could not query User table:', e);
    }

    // Fallback password check
    const fallbackPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (!valid && (email === 'admin@tesla.com' || email === 'admin') && password === fallbackPassword) {
      valid = true;
    }

    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  return NextResponse.json({ authenticated: auth?.value === 'authenticated' });
}
