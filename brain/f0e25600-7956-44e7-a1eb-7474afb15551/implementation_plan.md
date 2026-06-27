# Admin Dashboard - Booking History Integration

This plan details how we will map the booking systems to the new Admin Dashboard, displaying incoming requests for both Doctor Appointments and Pathology Services.

## User Review Required

> [!IMPORTANT]
> Since we do not have a full SQL/Postgres database configured for this project, I will build a secure local JSON database to act as the backend. This is perfect for the current stage of development, but let me know if you plan to attach a real database like Firebase or Postgres later!

## Proposed Changes

---

### Backend API

#### [MODIFY] [route.ts](file:///Users/macofdevil/Ray%27s%20medical/src/app/api/submit/route.ts)
- Modify the existing booking submission API.
- Generate a unique, readable `bookingNumber` (e.g., `RM-A8X92`) for every new request.
- Ensure `gender` is properly passed and saved along with the other data.

#### [NEW] [route.ts](file:///Users/macofdevil/Ray%27s%20medical/src/app/api/admin/bookings/route.ts)
- Create a new secure GET endpoint exclusively for the admin panel.
- This endpoint will read from the `data/bookings.json` database.
- It will sort bookings from newest to oldest and return them to the Admin Dashboard.

---

### Frontend Dashboard

#### [MODIFY] [page.tsx](file:///Users/macofdevil/Ray%27s%20medical/src/app/admin/dashboard/page.tsx)
- Rebuild the empty dashboard into a full data-management interface.
- Implement two primary tabs/sections: **Doctor Appointments** and **Home Collections**.
- **Doctor Appointments Table:** Display Booking Number, Patient Name, Gender, Phone, Date, Doctor, and Reason.
- **Home Collections Table:** Display Booking Number, Patient Name, Gender, Phone, Date, Address, Tests Selected, and Referral Doctor.
- Implement real-time data fetching so the admin sees new bookings pop up immediately upon loading.

## Verification Plan
### Automated Tests
None

### Manual Verification
1. I will log in to the admin panel.
2. I will submit a test Doctor Appointment and a test Home Collection request from the public website.
3. I will verify that both requests instantly appear in the correct tables on the Admin Dashboard with all the mapped fields (including Gender and Booking Number).
