# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Text-to-Speech with auto-read toggle

### Fixed

- Impostor mode: prevent impostorPlayerId reset during accusation phase

## [1.0.0] - 2026-04-04

### Added

- Impostor game mode
- Player removal functionality
- Name blocking on game modes
- Four game modes: Never Have I Ever, Truth or Dare, Would You Rather, Who Could
- Support for 30 languages
- Clean Architecture (domain/application/infrastructure/presentation layers)
- Responsive design
- Docker deployment support

### Changed

- Split GamePresenter into focused classes
- Refactored application structure for improved maintainability
- Refactored code structure for better readability
