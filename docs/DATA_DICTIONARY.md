# 📚 Lab CRM - Data Dictionary

This document explains the core business logic and data concepts for the Lab CRM.

## 1️⃣ Core Identity: `User`, `Account`, and `Member`

The application intentionally separates "authentication" from "lab profile data." This is a crucial distinction.

* **`User` Model:** Represents **CRM access** (authentication). It's part of the NextAuth.js schema and stores the absolute minimum for a user (email, name). A `User` can access the CRM system but may or may not be a lab member.

* **`Account` Model:** This is the **authentication method**. It's also part of NextAuth.js. This model links a `User` to an external login provider like Google or GitHub. A single `User` can have multiple `Account` records (e.g., they can log in with Google *or* GitHub).

* **`Member` Model:** This is the **lab profile**. It stores all lab-specific data: their rank (`PI`, `Student`), status (`ACTIVE`, `ALUMNI`), projects, publications, and profile photo (`photoUrl`). A `Member` represents someone who works in the lab, regardless of whether they have CRM access.

> **Rule:** `User` and `Member` have an **optional 1-to-1** relationship:
> * A `User` can exist without a `Member` (e.g., external admin, lab manager who isn't a researcher)
> * A `Member` can exist without a `User` (e.g., a student who doesn't have CRM access)
> * When a `User` is also a lab `Member`, they can be linked via `User.memberId`
> * This allows flexibility: not all lab members need CRM access, and not all CRM users are lab members

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
    * **Important Validation:** Equipment **cannot** be set to `IN_USE` status without being assigned to either a `memberId` or `projectId`. The system will automatically set status to `AVAILABLE` if a member/project is deleted while equipment is `IN_USE` (due to `onDelete: SetNull` cascade).

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