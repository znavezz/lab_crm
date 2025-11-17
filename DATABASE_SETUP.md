# Database Setup Guide

This guide explains how to reset your database and seed it with member data from a JSON file.

## Quick Start

1. **Edit the member data template**:
   ```bash
   # Open and edit the template file
   code data/members-template.json
   ```

2. **Reset and seed the database**:
   ```bash
   npm run db:seed:reset
   ```

That's it! Your database will be reset and populated with the members from the JSON file.

## Available Commands

### Database Reset
```bash
npm run db:reset
```
This will:
- Drop all tables
- Re-run all migrations
- **WARNING**: This deletes ALL data!

### Seed from JSON
```bash
# Seed from default template (won't run if data exists)
npm run db:seed:json

# Reset database and seed from JSON
npm run db:seed:reset

# Use a custom JSON file
npm run db:seed:reset -- data/my-members.json
```

### Seed with Default Test Data
```bash
# Seed with default test data (won't run if data exists)
npm run db:seed

# Reset and seed with default test data
npm run db:seed -- --reset
```

## JSON Template Structure

The `data/members-template.json` file contains a template with example members. Each member should have:

### Required Fields
- **name**: Full name of the member (string)

### Optional Fields
- **rank**: Academic rank
  - Options: `PROFESSOR`, `DOCTOR`, `POSTDOC`, `MSc`, `BSc`, `Mr`, `Mrs`
- **status**: Current status
  - Options: `ACTIVE`, `ALUMNI`, `INACTIVE`
- **role**: Role in the lab
  - Options: `PI`, `STUDENT`, `LAB_MANAGER`, `RESEARCHER`, `ADVISOR`, `INTERN`, `CONTRACTOR`, `GUEST`, `ALUMNI`, `OTHER`
- **scholarship**: Scholarship amount in dollars (number or null)
- **academicInfo**: Array of academic degrees
  - **degree**: Degree type (e.g., "PhD", "MS", "BS") - required
  - **field**: Field of study (optional)
  - **institution**: Institution name (optional)
  - **graduationYear**: Year of graduation (optional)

### Example Member Entry

```json
{
  "name": "Dr. Sarah Chen",
  "rank": "PROFESSOR",
  "status": "ACTIVE",
  "role": "PI",
  "scholarship": null,
  "academicInfo": [
    {
      "degree": "PhD",
      "field": "Bioinformatics",
      "institution": "Stanford University",
      "graduationYear": 2010
    },
    {
      "degree": "MS",
      "field": "Computer Science",
      "institution": "MIT",
      "graduationYear": 2006
    }
  ]
}
```

## Step-by-Step Instructions

1. **Open the template file**:
   ```bash
   # Using VS Code
   code data/members-template.json
   
   # Or using your preferred editor
   nano data/members-template.json
   ```

2. **Fill in your member data**:
   - Replace the example members with your actual lab members
   - Add or remove members as needed
   - Make sure the JSON is valid (use a JSON validator if unsure)

3. **Reset and seed the database**:
   ```bash
   npm run db:seed:reset
   ```

4. **Verify the data**:
   - Start your development server: `npm run dev`
   - Navigate to the Members page to see your data
   - Or use Prisma Studio: `npx prisma studio`

## Troubleshooting

### Error: DATABASE_URL not set
Make sure you have a `.env.local` or `.env` file with your database connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/lab_crm"
```

### Error: JSON file not found
Make sure the JSON file exists at the path you specified. The default path is `data/members-template.json`.

### Error: Invalid JSON
Validate your JSON file using an online JSON validator or your editor's built-in validator.

### Error: Database connection failed
- Check that your database is running
- Verify your DATABASE_URL is correct
- For Docker: Make sure containers are running (`docker-compose up -d`)

## Notes

- The seed script will **not** delete existing data unless you use the `--reset` flag
- Academic info is optional - you can omit the `academicInfo` array if not needed
- All enum values are case-sensitive - make sure they match exactly
- The script will show you a summary of created members after seeding


