import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const testsFilePath = path.join(process.cwd(), "data", "tests.json");

function getTests() {
  if (!fs.existsSync(testsFilePath)) {
    fs.writeFileSync(testsFilePath, JSON.stringify([]));
  }
  const fileBuffer = fs.readFileSync(testsFilePath);
  return JSON.parse(fileBuffer.toString());
}

function saveTests(tests: any[]) {
  fs.writeFileSync(testsFilePath, JSON.stringify(tests, null, 2));
}

export async function GET() {
  try {
    const tests = getTests();
    return NextResponse.json(tests);
  } catch (error) {
    console.error("Error fetching diagnostic tests:", error);
    return NextResponse.json({ error: "Failed to fetch diagnostic tests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, message: "Name and code are required." }, { status: 400 });
    }

    const tests = getTests();
    const newTest = {
      id: crypto.randomUUID(),
      name,
      code,
      createdAt: new Date().toISOString()
    };

    tests.unshift(newTest); // Add to beginning
    saveTests(tests);

    return NextResponse.json({ success: true, test: newTest });
  } catch (error) {
    console.error("Error saving test:", error);
    return NextResponse.json({ success: false, message: "Error saving test" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, code } = body;

    if (!id || !name || !code) {
      return NextResponse.json({ success: false, message: "ID, name, and code are required." }, { status: 400 });
    }

    const tests = getTests();
    const testIndex = tests.findIndex((t: any) => t.id === id);

    if (testIndex === -1) {
      return NextResponse.json({ success: false, message: "Test not found." }, { status: 404 });
    }

    tests[testIndex] = {
      ...tests[testIndex],
      name,
      code,
      updatedAt: new Date().toISOString()
    };

    saveTests(tests);
    return NextResponse.json({ success: true, test: tests[testIndex] });
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json({ success: false, message: "Error updating test" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Test ID is required." }, { status: 400 });
    }

    let tests = getTests();
    const initialLength = tests.length;
    tests = tests.filter((t: any) => t.id !== id);

    if (tests.length === initialLength) {
      return NextResponse.json({ success: false, message: "Test not found." }, { status: 404 });
    }

    saveTests(tests);
    return NextResponse.json({ success: true, message: "Test deleted successfully." });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json({ success: false, message: "Error deleting test" }, { status: 500 });
  }
}
