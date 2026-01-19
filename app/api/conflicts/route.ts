
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'conflicts.json');

// Helper to read data
function getConflicts() {
    if (!fs.existsSync(dataFilePath)) {
        return { type: 'FeatureCollection', features: [] };
    }
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    try {
        return JSON.parse(fileContents);
    } catch (e) {
        return { type: 'FeatureCollection', features: [] };
    }
}

// GET handler
export async function GET() {
    const data = getConflicts();
    return NextResponse.json(data);
}

// POST handler
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation - ensure it's a FeatureCollection or array of features
        if (!body || (body.type !== 'FeatureCollection' && !Array.isArray(body.features))) {
            return NextResponse.json({ error: 'Invalid GeoJSON' }, { status: 400 });
        }

        fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true, count: body.features.length });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
