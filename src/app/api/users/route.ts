import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "users.json");

    let users: any[] = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      users = JSON.parse(fileData);
    } catch (e) {
      // File doesn't exist yet, return empty
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone are required." },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "users.json");
    
    await fs.mkdir(dataDir, { recursive: true });

    let users: any[] = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      users = JSON.parse(fileData);
    } catch (e) {
      // File doesn't exist
    }

    const existingUserIndex = users.findIndex(u => u.phone === phone);
    const timestamp = new Date().toISOString();

    if (existingUserIndex >= 0) {
      // Update last login
      users[existingUserIndex].lastLogin = timestamp;
      // Optionally update name if it changed
      users[existingUserIndex].name = name;
    } else {
      // Create new user
      users.push({
        id: crypto.randomUUID(),
        name,
        phone,
        createdAt: timestamp,
        lastLogin: timestamp
      });
    }

    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save user." },
      { status: 500 }
    );
  }
}
