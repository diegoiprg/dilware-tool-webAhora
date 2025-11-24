# Development Process & Release Workflow

This document outlines the mandatory steps to be followed for every change, feature, fix, or improvement implemented in this project.

## 1. Implementation Integrity
- **Goal**: Apply requested changes without regressing existing functionality.
- **Action**: Ensure that new code integrates seamlessly with the existing codebase.

## 2. Cross-Device Verification
- **Goal**: Ensure compatibility across a wide range of devices and browsers.
- **Target Devices**:
  - iOS (iPhone)
  - iPadOS (iPad)
  - macOS (Desktop/Laptop)
  - Android Phone (Modern & Old)
  - Android Tablet (Modern & Old)
  - **Critical Legacy Support**: Android 6 with Chrome 81.
- **Action**: Verify layout, performance, and functionality on these targets (via simulation, responsive design checks, or actual devices).

## 3. Versioning & Changelog
- **Goal**: Maintain a clear history of changes and semantic versioning.
- **Versioning Strategy** (Major.Minor.Patch):
  - **Major**: Breaking changes or significant rewrites.
  - **Minor**: New features or significant improvements.
  - **Patch**: Bug fixes, minor improvements, or adjustments.
- **Action**:
  - Update `package.json` version.
  - Update `src/lib/version.ts` constant.
  - Add a detailed entry in `CHANGELOG.md` under the new version header.

## 4. Local Verification
- **Goal**: Catch errors before deployment.
- **Action**:
  - Run `npm run dev` to check runtime behavior (if applicable).
  - Run `npm run build` to ensure the project compiles and exports correctly.
  - Run `npm run lint` to maintain code quality.

## 5. Deployment
- **Goal**: Publish the new version to production.
- **Action**:
  - Stage changes: `git add .`
  - Commit with version number: `git commit -m "vX.Y.Z"`
  - Push to trigger GitHub Actions: `git push origin main`
  - Verify the GitHub Actions workflow completes successfully.
