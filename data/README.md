# Member Data Template

This directory contains JSON templates for seeding the database with member data.

## Usage

1. **Edit the template file**: Open `members-template.json` and fill in your member details
2. **Reset and seed the database**: Run the following command:

```bash
npm run db:seed:reset
```

Or specify a custom JSON file:

```bash
npm run db:seed:reset -- data/your-members.json
```

## JSON Structure

Each member object should have the following structure:

```json
{
  "name": "Full Name",
  "rank": "PROFESSOR | DOCTOR | POSTDOC | MSc | BSc | Mr | Mrs",
  "status": "ACTIVE | ALUMNI | INACTIVE",
  "role": "PI | STUDENT | LAB_MANAGER | RESEARCHER | ADVISOR | INTERN | CONTRACTOR | GUEST | ALUMNI | OTHER",
  "scholarship": 25000,  // Optional: number or null
  "academicInfo": [       // Optional: array of academic degrees
    {
      "degree": "PhD",
      "field": "Bioinformatics",
      "institution": "Stanford University",
      "graduationYear": 2010
    }
  ]
}
```

## Field Descriptions

- **name** (required): Full name of the member
- **rank** (optional): Academic rank or title
  - `PROFESSOR`, `PhD`, `POSTDOC`, `MSc`, `BSc`, `Mr`, `Mrs`
- **status** (optional): Current status
  - `ACTIVE`, `ALUMNI`, `INACTIVE`
- **role** (optional): Role in the lab
  - `PI`, `STUDENT`, `LAB_MANAGER`, `RESEARCHER`, `ADVISOR`, `INTERN`, `CONTRACTOR`, `GUEST`, `ALUMNI`, `OTHER`
- **scholarship** (optional): Scholarship amount in dollars (number or null)
- **photoUrl** (optional): URL to profile photo (string or null)
- **academicInfo** (optional): Array of academic degrees
  - **degree** (required): Degree type (e.g., "PhD", "MS", "BS")
  - **field** (optional): Field of study
  - **institution** (optional): Institution name
  - **graduationYear** (optional): Year of graduation

## Example

See `members-template.json` for a complete example with multiple members.

## Commands

- `npm run db:reset` - Reset the database (drops all data and runs migrations)
- `npm run db:seed` - Seed with default test data (won't run if data exists)
- `npm run db:seed:json` - Seed from JSON file (won't run if data exists)
- `npm run db:seed:reset` - Reset database and seed from JSON file

