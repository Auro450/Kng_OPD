const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ORIGINAL_GALLERY = [
  {
    title: "Clinic Interior",
    description: "A calming space designed to provide a frictionless experience.",
    src: "/gallery/clinic_1.jpeg"
  },
  {
    title: "Waiting Area",
    description: "Comfortable seating area for patients and visitors.",
    src: "/gallery/clinic_2.jpeg"
  },
  {
    title: "Medical Facility",
    description: "Equipped with state-of-the-art infrastructure.",
    src: "/gallery/clinic_3.jpeg"
  },
  {
    title: "Consultation Room",
    description: "Quiet and secure spaces for detailed patient-doctor interactions.",
    src: "/gallery/clinic_4.jpeg"
  },
  {
    title: "Clinic Entrance",
    description: "Welcoming entrance to Ray's Medical centre.",
    src: "/gallery/clinic_5.jpeg"
  }
];

const galleryWithIds = ORIGINAL_GALLERY.map(item => ({ id: crypto.randomUUID(), ...item }));
fs.writeFileSync(path.join(__dirname, 'data', 'gallery.json'), JSON.stringify(galleryWithIds, null, 2));
console.log('Created gallery.json!');
