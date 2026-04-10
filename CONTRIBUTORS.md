# Smart Campus Hub - Work Allocation & Contributions

This document outlines the division of work modules to support individual assessment for the PUF Project.

## Module Allocation

### Member 1: Facilities Catalogue & Resource Management

**Focus Areas:**

- `Resources` Management (CRUD)
- `Facilities Catalogue` (UI/UX)
- Resource Availability Endpoints

**Backend (Package: `com.campus.hub.resource`):**

- `ResourceController`
- `ResourceService`
- `CampusResource` (Model)
- `CampusResourceRepository`
- `ResourceType`, `ResourceStatus` (Enums)

**Frontend (Module: `src/features/resources`):**

- `AdminResources.jsx`
- `Resources.jsx`
- `AuditoriumPage.jsx`

---

### Member 2: Booking Workflow & Conflict Checking

**Focus Areas:**

- Booking Lifecycle (Create, Approve, Reject, Cancel)
- Conflict Checking (Room & Seat overlaps)
- Booking Calendar & Scheduling

**Backend (Package: `com.campus.hub.booking`):**

- `BookingController`
- `BookingService`
- `Booking`, `SeatBooking`, `Seat` (Models)
- `BookingRepository`, `SeatRepository`
- `BookingStatus` (Enum)

**Frontend (Module: `src/features/bookings`):**

- `Bookings.jsx`
- `BookingCalendar.jsx`
- `ResourceSchedule.jsx`

---

### Member 3: Incident Management & Technician Workflow

**Focus Areas:**

- Service Tickets (Incident Reporting)
- Attachments & File Handling
- Technician Workflow (Assignment & Status Updates)

**Backend (Package: `com.campus.hub.ticket`):**

- `TicketController`, `TechnicianWorkloadController`
- `TicketService`
- `Ticket`, `TicketAttachment` (Models)
- `TicketRepository`, `TicketAttachmentRepository`
- `TicketStatus`, `TicketPriority` (Enums)
- `TicketSlaCalculator`

**Frontend (Module: `src/features/tickets`):**

- `Tickets.jsx`
- `TechWorkload.jsx`

---

### Member 4: Authentication, Roles & Notifications

**Focus Areas:**

- JWT Authentication & Google OAuth
- Profile Management (Complete Profile/Email Verification)
- Notifications System
- Audit Logging & Role Management

**Backend (Package: `com.campus.hub.auth`, `com.campus.hub.notification`):**

- Notification module path: `backend/src/main/java/com/campus/hub/notification/`
- `AuthController`, `NotificationController`
- `AuthService`, `GoogleOAuthService`, `VerificationEmailService`, `NotificationService`
- `User`, `Role`, `AuthProvider`, `Notification` (Models)
- `UserRepository`, `NotificationRepository`
- `AuditLogController`, `AuditService`

**Frontend (Module: `src/features/auth`, `src/features/notifications`):**

- `Login.jsx`, `VerifyEmail.jsx`, `CompleteProfile.jsx`
- `Notifications.jsx`
- `context/AuthContext.jsx`

---

## Shared Infrastructure

- `src/components/ui/`: Standardized UI components (Button, Modal, Input, Badge, etc.)
- `src/theme/`: Global styles and design system.
- `src/utils/`: Common utility functions.
