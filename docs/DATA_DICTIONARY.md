# 📚 Lab CRM - Data Dictionary

This document explains the core business logic and data concepts for the Lab CRM.

## 1️⃣ Core Identity: `User`, `Account`, and `Member`

The application intentionally separates "authentication" from "lab profile data." This is a crucial distinction.

* **`User` Model:** This is the core **identity**. It's part of the NextAuth.js schema and stores the absolute minimum for a user (email, name). It's the central link for both authentication and the profile.

* **`Account` Model:** This is the **authentication method**. It's also part of NextAuth.js. This model links a `User` to an external login provider like Google or GitHub. A single `User` can have multiple `Account` records (e.g., they can log in with Google *or* GitHub).

* **`Member` Model:** This is the **lab profile**. It stores all lab-specific data: their rank (`PI`, `Student`), status (`ACTIVE`, `ALUMNI`), projects, and publications.

> **Rule:** Every `User` has a **1-to-1** relationship with a `Member`. A `User` (the login) *cannot* exist without a `Member` (the profile), and vice versa.

---

## 2️⃣ The Two Hubs: `Project` and `Member`

The application doesn't have one single hub; it has two.

### 🗂️ `Project` (The "Work" Hub)
This model is the center for all *work-related* data. It tracks:
* 💰 **Funding:** `grants` (M:N)
* 📄 **Output:** `publications` (M:N)
* 💸 **Costs:** `expenses` (1:M)
* 🔬 **Owned Equipment:** `equipments` (1:M)
* 🗓️ **Scheduled Time:** `bookings` (1:M)
* 📎 **Files:** `documents` (1:M)

### 🧑‍🔬 `Member` (The "People" Hub)
This model is the center for all *people-related* data. It tracks:
* 🎓 **History:** `academicInfo` (1:M)
* 💻 **Owned Equipment:** `equipments` (1:M)
* 🗓️ **Scheduled Time:** `bookings` (1:M)
* 📄 **Publications:** `publications` (M:N)
* 📎 **Files:** `documents` (1:M)
* 🎉 **Events Attending:** `events` (M:N)

---

## 3️⃣ The 3-Part Equipment System

Equipment management is the most complex system. It's split into three distinct concepts:

### A. Allocation (Ownership)

* **What it is:** The `projectId` and `memberId` fields on the `Equipment` model itself.
* **Purpose:** Defines long-term "ownership" or assignment.
* **Rules:**
    * If `memberId` is set: The equipment is a "personal" item (e.g., a laptop).
    * If `projectId` is set: The equipment "belongs" to a project (e.g., a sequencer bought for that project).
    * If both are `null`: The equipment is in the general lab pool.

### B. Scheduling (Reservations)

* **What it is:** The `Booking` model.
* **Purpose:** Tracks a short-term, time-based reservation on the calendar.
* **Rules:**
    * A `Booking` links one `Equipment` to one `Member` for a specific `startTime` and `endTime`.
    * It can optionally be tagged to a `projectId` or `eventId` for tracking.
    * The API **must** check for scheduling conflicts before creating a new `Booking`. The `@@index([equipmentId, startTime, endTime])` is designed to make this check fast.

### C. Planning (Event Needs)

* **What it is:** The `equipments Equipment[]` field on the `Event` model.
* **Purpose:** A "shopping list" for an event.
* **Rule:** This M:N relation is for *planning only*. It lets a user list what items an event *requires* (e.g., "Lab Meeting needs 1 projector"). It does **not** book the items; that is handled by creating `Booking` records.

---

## 4️⃣ Polymorphic Model: `NoteTask`

The `NoteTask` model is a "polymorphic" entity, meaning it can attach to almost any other model.

* **How it works:** It contains many optional foreign keys (e.g., `memberId`, `projectId`, `grantId`, `equipmentId`).
* **Rule:** The application logic (your API) must enforce that **only one** of these foreign keys is set when a `NoteTask` is created. For example, a note can be for a `Project` *or* a `Member`, but not both.

## 🗺️ ERD:
<img src="prisma/ERD.svg" alt="ERD" />