import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataFilePath = path.join(process.cwd(), 'data', 'doctors.json');

const readDoctors = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

const writeDoctors = (doctors: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(doctors, null, 2));
};

export async function GET() {
  try {
    const doctors = readDoctors();
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to read doctors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let name, specialty, description, experience, imageurl;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = formData.get("name") as string;
      specialty = formData.get("specialty") as string;
      description = (formData.get("description") as string) || '';
      experience = (formData.get("experience") as string) || '';
      
      const file = formData.get("image") as File;
      if (file && file.size > 0) {
        const uploadDir = path.join(process.cwd(), "public", "doctors");
        await fs.promises.mkdir(uploadDir, { recursive: true });
        
        const ext = file.name.split('.').pop() || 'png';
        const filename = `doc_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(filePath, buffer);
        
        imageurl = `/doctors/${filename}`;
      }
    } else {
      const data = await request.json();
      name = data.name;
      specialty = data.specialty;
      description = data.description || '';
      experience = data.experience || '';
      imageurl = data.imageurl;
    }

    const doctors = readDoctors();

    const newDoctor = {
      id: crypto.randomUUID(),
      name: name,
      specialty: specialty,
      description: description,
      experience: experience,
      imageurl: imageurl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmxD5QtlBvuaxjE9RyFgYHeEPJFGVX4i18ppQ6CNbIvROAey7gi6vMWqdJEO-sLTn_L1DMGV5R_DJkzd4wFKqAeCcwZJwwGKw_XeY1B2cRdfRhlxSl6KsIuuPyCmh_d86z-LMnbEztd5bKd2ai0b0Yxlkh7l8rmuYuGsq-kpce_16cOAUzYokO8y6XuQklukfPFkURThwZuKMYBmini0-C3ksQkpKsTnLe2ydERUnDA3H8FoYCH13NAmG0NfoCeOqzCWArUvicIoAJ',
      createdAt: new Date().toISOString()
    };

    doctors.unshift(newDoctor);
    writeDoctors(doctors);

    return NextResponse.json({ success: true, doctor: newDoctor });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to add doctor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Doctor ID required' }, { status: 400 });
    }

    const doctors = readDoctors();
    const filtered = doctors.filter((d: any) => d.id !== id && String(d.id) !== id);
    
    writeDoctors(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete doctor' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ success: false, message: 'Invalid content type' }, { status: 400 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Doctor ID required' }, { status: 400 });
    }

    const doctors = readDoctors();
    const doctorIndex = doctors.findIndex((d: any) => d.id === id || String(d.id) === id);

    if (doctorIndex === -1) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    const doctor = doctors[doctorIndex];
    doctor.name = formData.get("name") as string;
    doctor.specialty = formData.get("specialty") as string;
    doctor.description = (formData.get("description") as string) || '';
    doctor.experience = (formData.get("experience") as string) || '';

    const file = formData.get("image") as File;
    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "doctors");
      await fs.promises.mkdir(uploadDir, { recursive: true });
      
      const ext = file.name.split('.').pop() || 'png';
      const filename = `doc_${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, filename);
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.promises.writeFile(filePath, buffer);
      
      doctor.imageurl = `/doctors/${filename}`;
    }

    doctors[doctorIndex] = doctor;
    writeDoctors(doctors);

    return NextResponse.json({ success: true, doctor: doctor });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to update doctor' }, { status: 500 });
  }
}
