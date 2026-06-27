import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "bookings.json");

    let bookings = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      bookings = JSON.parse(fileData);
    } catch (e) {
      // If the file doesn't exist yet, just return an empty array
      return NextResponse.json({ success: true, bookings: [] });
    }

    // Sort bookings by newest first (descending order by createdAt)
    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { success: false, message: "Error retrieving booking history" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, newDate, status } = await request.json();
    if (!id || (!newDate && !status)) {
      return NextResponse.json({ success: false, message: "Missing id or update fields" }, { status: 400 });
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "bookings.json");
    
    const fileData = await fs.readFile(filePath, "utf-8");
    let bookings = JSON.parse(fileData);

    let found = false;
    bookings = bookings.map((b: any) => {
      if (b.id === id) {
        found = true;
        return { ...b, ...(newDate && { date: newDate }), ...(status && { status }) };
      }
      return b;
    });

    if (!found) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    await fs.writeFile(filePath, JSON.stringify(bookings, null, 2));

    return NextResponse.json({ success: true, message: "Booking updated successfully" });
  } catch (error) {
    console.error("Failed to update booking date:", error);
    return NextResponse.json(
      { success: false, message: "Error updating booking date" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing booking ID" }, { status: 400 });
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "bookings.json");
    
    let bookings = [];
    try {
      const fileData = await fs.readFile(filePath, "utf-8");
      bookings = JSON.parse(fileData);
    } catch (e) {
      return NextResponse.json({ success: false, message: "Database not found" }, { status: 404 });
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
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    await fs.writeFile(filePath, JSON.stringify(updatedBookings, null, 2));

    return NextResponse.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting booking" },
      { status: 500 }
    );
  }
}
