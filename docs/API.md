# Smart Campus Operations Hub — API

Base URL: `http://localhost:8080`

Authentication: `Authorization: Bearer <JWT>` for all routes except `/api/auth/**`.

## Auth

| Method | Path | Body | Roles |
|--------|------|------|-------|
| POST | `/api/auth/register` | `{ email, password, fullName }` | Public |
| POST | `/api/auth/login` | `{ email, password }` | Public |

**Response (200 / 201):** `{ token, userId, email, fullName, role }`

## Resources

| Method | Path | Query / Body | Roles |
|--------|------|--------------|-------|
| GET | `/api/resources` | `?type=&minCapacity=&location=` | Authenticated |
| GET | `/api/resources/{id}` | — | Authenticated |
| POST | `/api/resources` | `CreateResourceRequest` | ADMIN |
| PUT | `/api/resources/{id}` | `CreateResourceRequest` | ADMIN |
| DELETE | `/api/resources/{id}` | — | ADMIN |

**CreateResourceRequest:** `{ name, type, capacity, location, status }`  
`type`: `ROOM | LAB | AUDITORIUM | EQUIPMENT`  
`status`: `AVAILABLE | MAINTENANCE | UNAVAILABLE`

## Seats (auditorium)

| Method | Path | Query | Roles |
|--------|------|-------|-------|
| GET | `/api/resources/{resourceId}/seats/availability` | `start`, `end` (ISO local `yyyy-MM-dd'T'HH:mm:ss`) | Authenticated |

**Response:** `[{ id, seatLabel, availability }]` — `availability`: `AVAILABLE | BOOKED`

## Bookings

| Method | Path | Body | Roles |
|--------|------|------|-------|
| GET | `/api/bookings` | — | Authenticated (ADMIN sees all) |
| GET | `/api/bookings/{id}` | — | Owner or ADMIN |
| POST | `/api/bookings` | `CreateBookingRequest` | Authenticated |
| PUT | `/api/bookings/{id}/approve` | `{ reason }` optional | ADMIN |
| PUT | `/api/bookings/{id}/reject` | `{ reason }` optional | ADMIN |
| DELETE | `/api/bookings/{id}` | — | Owner or ADMIN (cancel) |

**CreateBookingRequest:**  
`{ resourceId, startTime, endTime, purpose?, attendees?, seatIds? }`  
- Non-auditorium: `attendees` ≥ 1, no `seatIds`.  
- Auditorium: `seatIds` required (distinct), attendees optional but must match seat count if provided.

## Tickets

| Method | Path | Body | Roles |
|--------|------|------|-------|
| GET | `/api/tickets` | — | Authenticated (scoped by role) |
| GET | `/api/tickets/{id}` | — | Access per ticket |
| POST | `/api/tickets` | `{ resourceId, description, priority }` | Authenticated |
| PATCH | `/api/tickets/{id}` | `{ status?, priority?, description? }` | ADMIN/TECHNICIAN (user: description only) |
| PUT | `/api/tickets/{id}/assign` | `{ technicianId }` | ADMIN |
| POST | `/api/tickets/{ticketId}/comments` | `{ content }` | Authenticated |
| PATCH | `/api/tickets/{ticketId}/comments/{commentId}` | `{ content }` | Comment owner |
| DELETE | `/api/tickets/{ticketId}/comments/{commentId}` | — | Comment owner |
| POST | `/api/tickets/{ticketId}/attachments` | `multipart/form-data` field `file` | Authenticated |

## Notifications

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/notifications` | Authenticated |
| PUT | `/api/notifications/{id}/read` | Authenticated |

## Audit logs

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/admin/audit-logs` | ADMIN |

## Files

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/files/{storedFilename}` | Authenticated |

## Error format

```json
{
  "timestamp": "2025-03-26T12:00:00Z",
  "status": 400,
  "message": "Validation error"
}
```
