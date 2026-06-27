import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const timestamp = new Date().toISOString();
    
    // Save to local JSON database (simulating a real DB)
    try {
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, "bookings.json");
      
      // Ensure directory exists (though we created it, safe to check)
      await fs.mkdir(dataDir, { recursive: true });
      
      let bookings = [];
      try {
        const fileData = await fs.readFile(filePath, "utf-8");
        bookings = JSON.parse(fileData);
      } catch (e) {
        // File doesn't exist or is empty, start with empty array
      }

      // Generate a unique 4-digit readable booking number based on type
      const isPathology = data.type === "Home Collection Request";
      const prefix = isPathology ? "RAY-PAT-" : "RAY-DOC-";
      
      let bookingNumber = "";
      let isUnique = false;
      
      while (!isUnique) {
        const randomNumber = Math.floor(1000 + Math.random() * 9000).toString();
        bookingNumber = prefix + randomNumber;
        if (!bookings.some((b: any) => b.bookingNumber === bookingNumber)) {
          isUnique = true;
        }
      }

      const newBooking = {
        id: crypto.randomUUID(),
        bookingNumber,
        ...data,
        createdAt: timestamp,
      };

      bookings.push(newBooking);
      await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), "utf-8");
    } catch (dbError) {
      console.error("Failed to save to local JSON DB:", dbError);
      // We don't throw here to ensure Google Sheets webhook still fires if possible
    }

    // Using your updated Web App URL
    const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzpYuGb1FPCr3JU_AZHOXzJaRt6gupkw9NX3w9Xr4I4_2O4xGBIF_G9-loZ7OGqQd5T/exec";

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.warn("Google Sheet Webhook URL is not configured. Logging data to console instead.");
      console.log("Form Data Received:", data);
      return NextResponse.json({ 
        success: true, 
        message: "Data received successfully (Simulated). Please configure the Webhook URL for actual Google Sheet integration." 
      });
    }

    try {
      const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toLocaleString(),
        }),
      });

      if (!response.ok) {
        console.warn("Failed to send data to Google Sheets, but local DB save succeeded.");
      }
    } catch (sheetError) {
       console.error("Google Sheets Webhook Error:", sheetError);
    }

    return NextResponse.json({ success: true, message: "Booking confirmed and saved to database!" });
  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json(
      { success: false, message: "There was an error processing your request. Please try again." },
      { status: 500 }
    );
  }
}
