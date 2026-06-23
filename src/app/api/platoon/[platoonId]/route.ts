
import { NextResponse } from 'next/server';
import { getPlatoonData } from '@/lib/firebase-data/platoon-data';

export async function GET(request: Request, { params }: { params: { platoonId: string } }) {
  try {
    const platoonData = await getPlatoonData(params.platoonId);

    if (!platoonData) {
      return NextResponse.json({ message: "Platoon not found" }, { status: 404 });
    }

    return NextResponse.json(platoonData);
  } catch (error) {
    console.error(`Error fetching data for platoon: ${params.platoonId}`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
