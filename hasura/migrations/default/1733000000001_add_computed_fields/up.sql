-- SQL Functions for Computed Fields

-- Function to calculate total investment for a project (sum of expenses)
CREATE OR REPLACE FUNCTION project_total_investment(project_row "Project")
RETURNS DOUBLE PRECISION AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM "Expense"
  WHERE "projectId" = project_row.id;
$$ LANGUAGE sql STABLE;

-- Function to calculate total spent for a grant (sum of expenses)
CREATE OR REPLACE FUNCTION grant_total_spent(grant_row "Grant")
RETURNS DOUBLE PRECISION AS $$
  SELECT COALESCE(SUM(e.amount), 0)
  FROM "Expense" e
  WHERE e."grantId" = grant_row.id;
$$ LANGUAGE sql STABLE;

-- Function to calculate remaining budget for a grant
CREATE OR REPLACE FUNCTION grant_remaining_budget(grant_row "Grant")
RETURNS DOUBLE PRECISION AS $$
  SELECT grant_row.budget - COALESCE(
    (SELECT SUM(e.amount)
     FROM "Expense" e
     WHERE e."grantId" = grant_row.id),
    0
  );
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION project_total_investment IS 'Calculates the total investment (sum of expenses) for a project';
COMMENT ON FUNCTION grant_total_spent IS 'Calculates the total spent (sum of expenses) for a grant';
COMMENT ON FUNCTION grant_remaining_budget IS 'Calculates the remaining budget for a grant (budget minus total spent)';







