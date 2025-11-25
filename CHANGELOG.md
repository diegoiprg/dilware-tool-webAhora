# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.0.1] - 2025-11-24

### Fixed
- Fixed 2 security vulnerabilities via `npm audit fix`.
- Removed `package-lock.json` from `.gitignore` to ensure proper CI/CD builds.

### Changed
- Refactored `SettingsContext.tsx` to include centralized `resetSettings` function.
- Improved type safety in `SettingsPanel.tsx` by removing `as any` casts and manual reset logic.
- Created `eslint.config.mjs` for ESLint 9 compatibility.

## [1.0.0] - 2025-11-24

### Added
- Initial release of **dilware-tool-webAhora**.
- Migration from previous repository.
