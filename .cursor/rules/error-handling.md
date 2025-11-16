# Error Handling Rules

## Automatic Error Fixing

**CRITICAL RULE**: Never submit files with linting or TypeScript errors unless the user explicitly requests it.

### Required Behavior:

1. **Always check for errors after making changes**:
   - Use `read_lints` tool to check for linting/TypeScript errors after editing files
   - Fix all errors automatically before completing the task

2. **Error types to fix automatically**:
   - ESLint warnings and errors
   - TypeScript type errors
   - Unused imports/variables
   - Type mismatches
   - Any other code quality issues

3. **Exception**: Only leave errors if:
   - User explicitly asks to leave specific errors
   - User explicitly requests to see errors before fixing
   - There's a technical reason that requires user input to resolve

4. **Verification**:
   - Always run `read_lints` on modified files before considering the task complete
   - Ensure zero linting/TypeScript errors before reporting completion

### Example Workflow:
1. Make code changes
2. Check for errors with `read_lints`
3. Fix any errors found
4. Re-check to confirm all errors are resolved
5. Report completion

