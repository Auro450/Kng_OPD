import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataFilePath = path.join(process.cwd(), 'data', 'gallery.json');

const readGallery = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

const writeGallery = (gallery: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(gallery, null, 2));
};

export async function GET() {
  try {
    const gallery = readGallery();
    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to read gallery' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let title, description, src;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      description = (formData.get("description") as string) || '';
      
      const file = formData.get("image") as File;
      if (file && file.size > 0) {
        const uploadDir = path.join(process.cwd(), "public", "gallery");
        await fs.promises.mkdir(uploadDir, { recursive: true });
        
        const ext = file.name.split('.').pop() || 'png';
        const filename = `gal_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(filePath, buffer);
        
        src = `/gallery/${filename}`;
      }
    } else {
      const data = await request.json();
      title = data.title;
      description = data.description || '';
      src = data.src;
    }

    if (!title || !src) {
        return NextResponse.json({ success: false, message: 'Title and image are required' }, { status: 400 });
    }

    const gallery = readGallery();

    const newItem = {
      id: crypto.randomUUID(),
      title: title,
      description: description,
      src: src,
      createdAt: new Date().toISOString()
    };

    gallery.unshift(newItem);
    writeGallery(gallery);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to add gallery item' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let id, title, description, src;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      id = formData.get("id") as string;
      title = formData.get("title") as string;
      description = (formData.get("description") as string) || '';
      
      const file = formData.get("image") as File;
      if (file && file.size > 0) {
        const uploadDir = path.join(process.cwd(), "public", "gallery");
        await fs.promises.mkdir(uploadDir, { recursive: true });
        
        const ext = file.name.split('.').pop() || 'png';
        const filename = `gal_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(filePath, buffer);
        
        src = `/gallery/${filename}`;
      }
    } else {
      const data = await request.json();
      id = data.id;
      title = data.title;
      description = data.description || '';
      src = data.src;
    }

    if (!id || !title) {
        return NextResponse.json({ success: false, message: 'ID and title are required' }, { status: 400 });
    }

    const gallery = readGallery();
    const itemIndex = gallery.findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
        return NextResponse.json({ success: false, message: "Gallery item not found" }, { status: 404 });
    }

    gallery[itemIndex] = {
        ...gallery[itemIndex],
        title,
        description,
        ...(src && { src }),
        updatedAt: new Date().toISOString()
    };

    writeGallery(gallery);

    return NextResponse.json({ success: true, item: gallery[itemIndex] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Gallery item ID required' }, { status: 400 });
    }

    const gallery = readGallery();
    const filtered = gallery.filter((d: any) => d.id !== id && String(d.id) !== id);
    
    writeGallery(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete gallery item' }, { status: 500 });
  }
}
