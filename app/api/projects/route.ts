
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'projects.json');

// Helper to read data
function readProjects() {
    if (!fs.existsSync(dataFilePath)) {
        return [];
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    try {
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error parsing projects JSON:', error);
        return [];
    }
}

// Helper to write data
function writeProjects(projects: any[]) {
    // Ensure directory exists
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(projects, null, 2), 'utf-8');
}

export async function GET() {
    const projects = readProjects();
    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    try {
        const newProject = await request.json();

        // Basic validation
        if (!newProject.name || !newProject.coords) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const projects = readProjects();

        // Simple ID generation if not provided (not robust for concurrent use but fine for this demo)
        if (!newProject.id) {
            newProject.id = Date.now().toString();
        }

        projects.push(newProject);
        writeProjects(projects);

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Error adding project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
