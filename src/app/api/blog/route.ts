import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Using your updated Web App URL
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzpYuGb1FPCr3JU_AZHOXzJaRt6gupkw9NX3w9Xr4I4_2O4xGBIF_G9-loZ7OGqQd5T/exec?tab=Blog";
    
    const response = await fetch(scriptUrl);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}
