import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');
  return auth?.value === 'authenticated';
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await turso.execute(
      'SELECT * FROM applicants ORDER BY registration_timestamp DESC'
    );
    return NextResponse.json({ applicants: result.rows });
  } catch (error: any) {
    console.error('Fetch applicants error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, selectionStatus } = await req.json();

    if (!id || !selectionStatus) {
      return NextResponse.json({ error: 'Missing id or selectionStatus' }, { status: 400 });
    }

    await turso.execute({
      sql: 'UPDATE applicants SET selection_status = ? WHERE id = ?',
      args: [selectionStatus, id]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update applicant error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing applicant id' }, { status: 400 });
    }

    await turso.execute({
      sql: 'DELETE FROM applicants WHERE id = ?',
      args: [id]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete applicant error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
