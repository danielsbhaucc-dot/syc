
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The path to the JSON file that acts as our database
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

// --- Utility Functions ---

// Read the entire database file
const readUsersData = () => {
    try {
        const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading users data file:", error);
        return {}; // Return empty object on error
    }
};

// Write data to the database file
const writeUsersData = (data: any) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing users data file:", error);
    }
};

// --- API Route Handlers ---

// GET /api/battalion/{battalionId}/users - Fetch all users for a battalion
export async function GET(request: Request, { params }: { params: { battalionId: string } }) {
    const allData = readUsersData();
    const battalionUsers = allData[params.battalionId] || [];
    return NextResponse.json(battalionUsers);
}

// POST /api/battalion/{battalionId}/users - Add a new user
export async function POST(request: Request, { params }: { params: { battalionId: string } }) {
    const { name, role } = await request.json();
    if (!name || !role) {
        return NextResponse.json({ message: 'Name and role are required' }, { status: 400 });
    }

    const allData = readUsersData();
    if (!allData[params.battalionId]) {
        allData[params.battalionId] = [];
    }

    const newUser = {
        id: `user-${new Date().getTime()}`,
        name,
        role,
    };

    allData[params.battalionId].push(newUser);
    writeUsersData(allData);

    return NextResponse.json(newUser, { status: 201 });
}

// PUT /api/battalion/{battalionId}/users - Update an existing user
export async function PUT(request: Request, { params }: { params: { battalionId: string } }) {
    const { id, name, role } = await request.json();
    if (!id || !name || !role) {
        return NextResponse.json({ message: 'User ID, name, and role are required' }, { status: 400 });
    }

    const allData = readUsersData();
    const battalionUsers = allData[params.battalionId] || [];
    
    const userIndex = battalionUsers.findIndex((u: any) => u.id === id);

    if (userIndex === -1) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatedUser = { ...battalionUsers[userIndex], name, role };
    allData[params.battalionId][userIndex] = updatedUser;
    writeUsersData(allData);

    return NextResponse.json(updatedUser);
}

// DELETE /api/battalion/{battalionId}/users - Remove a user
export async function DELETE(request: Request, { params }: { params: { battalionId: string } }) {
    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const allData = readUsersData();
    const battalionUsers = allData[params.battalionId] || [];

    const userIndex = battalionUsers.findIndex((u: any) => u.id === id);

    if (userIndex === -1) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    allData[params.battalionId].splice(userIndex, 1);
    writeUsersData(allData);

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
}
