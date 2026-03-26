-- Smart Campus Operations Hub — reference schema (PostgreSQL-compatible)
-- Hibernate `ddl-auto=update` can create these tables; use this for manual DBA review or PostgreSQL.

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL
);

CREATE TABLE resources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    capacity INTEGER,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL
);

CREATE TABLE seats (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT NOT NULL REFERENCES resources (id) ON DELETE CASCADE,
    seat_label VARCHAR(64) NOT NULL,
    UNIQUE (resource_id, seat_label)
);

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id),
    resource_id BIGINT NOT NULL REFERENCES resources (id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    purpose VARCHAR(2000),
    attendees INTEGER,
    status VARCHAR(32) NOT NULL,
    admin_reason VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE seat_bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
    seat_id BIGINT NOT NULL REFERENCES seats (id)
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT NOT NULL REFERENCES resources (id),
    created_by_id BIGINT NOT NULL REFERENCES users (id),
    assigned_technician_id BIGINT REFERENCES users (id),
    description VARCHAR(4000) NOT NULL,
    priority VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users (id),
    content VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE ticket_attachments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    stored_filename VARCHAR(512) NOT NULL,
    original_filename VARCHAR(512) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    message VARCHAR(2000) NOT NULL,
    type VARCHAR(32) NOT NULL,
    read_flag BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_type VARCHAR(64),
    reference_id BIGINT
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users (id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details VARCHAR(2000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_bookings_resource_time ON bookings (resource_id, start_time, end_time);
CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
