import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const type = formData.get("type") as string; // 'bill' or 'report'
    const file = formData.get("file") as File;

    if (!id || !type || !file) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (type !== "bill" && type !== "report") {
      return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
    }

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate a unique file name
    const ext = file.name.split('.').pop() || 'pdf';
    const filename = `${id}-${type}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Read the file buffer and save to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // Update the database
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "bookings.json");
    
    let bookings = [];
    try {
      const dbData = await fs.readFile(dbPath, "utf-8");
      bookings = JSON.parse(dbData);
    } catch (e) {
      return NextResponse.json({ success: false, message: "Database not found" }, { status: 404 });
    }

    let found = false;
    bookings = bookings.map((b: any) => {
      if (b.id === id) {
        found = true;
        if (type === "bill") b.billUrl = fileUrl;
        if (type === "report") b.reportUrl = fileUrl;
        return b;
      }
      return b;
    });

    if (!found) {
      // If we saved the file but booking wasn't found, delete the orphaned file to save space
      await fs.unlink(filePath).catch(() => {});
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    await fs.writeFile(dbPath, JSON.stringify(bookings, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: `${type === 'bill' ? 'Bill' : 'Report'} uploaded successfully`,
      fileUrl
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
