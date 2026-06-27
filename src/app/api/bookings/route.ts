import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "bookings.json");

    let bookings: any[] = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      bookings = JSON.parse(fileData);
    } catch (e) {
      // If file doesn't exist, they have no bookings.
      return NextResponse.json({ success: true, bookings: [] });
    }

    // Filter bookings by phone number
    const userBookings = bookings.filter(b => b.phone === phone);

    // Sort by newest first
    userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, bookings: userBookings });
  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required." },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "bookings.json");

    let bookings: any[] = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      bookings = JSON.parse(fileData);
    } catch (e) {
      return NextResponse.json({ success: false, message: "No bookings found." }, { status: 404 });
    }

    let found = false;
    const updatedBookings = bookings.map((b: any) => {
      if (b.id === id) {
        found = true;
        return { ...b, status: "Deleted" };
      }
      return b;
    });
    
    if (!found) {
      return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
    }

    await fs.writeFile(filePath, JSON.stringify(updatedBookings, null, 2));

    return NextResponse.json({ success: true, message: "Booking cancelled successfully." });
  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel booking." },
      { status: 500 }
    );
  }
}
