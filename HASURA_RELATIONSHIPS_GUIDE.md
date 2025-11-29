# 🔧 Hasura Relationship Pattern - M:N Tables

## The Issue

In Hasura, many-to-many relationships go through junction tables. Your old custom GraphQL schema hid this complexity, but Hasura exposes it.

## Example: Project ↔ Member Relationship

### Database Structure

```sql
Table: _ProjectMembers
├── A (FK to Member.id)
└── B (FK to Project.id)
```

### Hasura GraphQL Query

```graphql
query GetProjects {
  Project {
    id
    title
    ProjectMembers {     # ← Array relationship to junction table
      Member {           # ← Object relationship to actual Member
        id
        name
      }
    }
  }
}
```

### Response Structure

```json
{
  "Project": [
    {
      "id": "proj_1",
      "title": "Genome Sequencing",
      "ProjectMembers": [
        { "Member": { "id": "m1", "name": "Sarah" } },
        { "Member": { "id": "m2", "name": "Michael" } }
      ]
    }
  ]
}
```

### Frontend Transformation

To keep your existing TypeScript types working, transform the response:

```typescript
// Transform Hasura response to match expected format
const projects = (data?.Project || []).map((project: any) => ({
  ...project,
  members: project.ProjectMembers?.map((pm: any) => pm.Member) || [],
}))
```

Now `project.members` works as expected!

## Applied to Projects Page

✅ **Fixed**: `/src/app/(dashboard)/projects/page.tsx`
- Added `ProjectMembers` array relationship in Hasura
- Updated GraphQL query to use junction table
- Added data transformation to flatten structure

## Other Pages That Need Similar Fixes

The following pages likely have similar issues with M:N relationships:

### 1. **Members Page** - Member ↔ Project
```graphql
Member {
  ProjectMembers {
    Project { id title }
  }
}
```

### 2. **Events Page** - Event ↔ Member
```graphql
Event {
  _EventMembers {
    Member { id name }
  }
}
```

### 3. **Publications Page** - Publication ↔ Member
```graphql
Publication {
  _PublicationMembers {
    Member { id name }
  }
}
```

### 4. **Grants Page** - Grant ↔ Project
```graphql
Grant {
  _GrantProjects {
    Project { id title }
  }
}
```

## Next Steps

When you encounter similar errors on other pages:

1. **Identify the M:N relationship** in the error message
2. **Update the GraphQL query** to include the junction table
3. **Transform the response** to flatten the nested structure
4. **Refresh the browser**

## Alternative: Update TypeScript Types

Instead of transforming data, you could update all TypeScript interfaces to match Hasura's structure:

```typescript
interface Project {
  id: string
  title: string
  ProjectMembers: Array<{
    Member: {
      id: string
      name: string
    }
  }>
}
```

Then update all code references from `project.members` to `project.ProjectMembers.map(pm => pm.Member)`.

**Recommendation**: Stick with data transformation (current approach) for now. It's less invasive and keeps your codebase consistent.

---

**Status**: Projects page fixed! Other pages will need similar fixes as you encounter them.

