// app/api/revalidate/route.js
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { tag } = await req.json();
    
    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag is required' },
        { status: 400 }
      );
    }
    console.log(tag);
    

    revalidateTag(tag);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}