# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single non-develop branch (i.e. docs|chore|refactor|feature|fix branch):

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create new branch for feature, fix, etc
3. **Implement** - Implement the feature/fix that I create in @context/current-feature.md
4. **Build** - verify the code changes don't break the application. Implement unit testing later. Run `npm run lint` and `npm run build` and fix any errors or warnings
5. **Check in the browser** - Run `npm run dev` (with the backend API running) and tell me what to click to see the change working
6. **Iterate** - Iterate and change things if needed
7. **Commit** - Only after lint and build pass and everything works
8. **Merge** - Merge to develop branch
9. **Delete Branch** - Delete branch after merge
10. **Review** - Review AI-generated code periodically and on demand.
11. Mark as completed in @context/current-feature.md and add to history

Do NOT commit without permission and until lint and build pass. If either fails, fix the issues first.

## Branching

We will create a new branch for every feature/fix. Name branch **feature/[feature]** or **fix/[fix]**, etc. Ask to delete the branch once merged.

## Commits

- Ask before committing (don't auto-commit)
- Use the commit message format from the root `CLAUDE.md` § 11: `[frontend] <Component>: <what you did>`
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Claude" in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase
- Follow the frontend `CLAUDE.md` (plain JSX, basic CSS, Fetch API, no extra libraries beyond Chart.js)

## Code Review

Review AI-generated code periodically, especially for:

- Correctness (loading, empty and error states; money and date handling)
- React hooks (effect dependencies, stale state, cleanup on unmount)
- Accessibility (labels on inputs, keyboard use, focus in the modal)
- Patterns (if it doesn't match with the existing codebase)
