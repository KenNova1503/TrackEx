# Complete Action

1. Commit changes (do not stage yet) with a descriptive message
2. Reset current-feature.md:
   - Change H1 back to `# Current Feature`
   - Clear Goals and Notes sections (keep placeholder comments)
   - Add feature summary to the END of History
3. Commit the reset: `chore: reset current-feature.md after completing [feature]`
4. Switch to develop branch and merge the feature branch (no push yet)
5. Delete the local feature branch
6. Push develop branch to origin ONCE (single push with all changes)