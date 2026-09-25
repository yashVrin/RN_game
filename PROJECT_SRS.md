# Software Requirements Specification (SRS) - RN Game Project

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive overview and technical details of the **RN_game** project. It serves as a single source of truth for the project's architecture, dependencies, and included modules.

### 1.2 Project Overview
**RN_game** (internal name: `RNBoilerplate`) is a React Native mobile application that acts as a gaming hub. It features a central home screen where users can navigate to various minigames built into the application.

---

## 2. Technology Stack

### 2.1 Core
- **Framework:** React Native (v0.86.2)
- **UI Library:** React (v19.2.3)
- **Language:** TypeScript
- **State Management:** Redux Toolkit & React-Redux (with Redux-Persist)
- **Navigation:** React Navigation (Native, Native-Stack, Bottom-Tabs)

### 2.2 Backend & Services (Firebase)
The app is heavily integrated with Firebase services for backend functionality, analytics, and crash reporting:
- Firebase App (`@react-native-firebase/app`)
- Firebase Crashlytics (`@react-native-firebase/crashlytics`)
- Firebase Cloud Messaging (`@react-native-firebase/messaging`)
- Firebase Machine Learning (`@react-native-firebase/ml`)
- Firebase Remote Config (`@react-native-firebase/remote-config`)

---

## 3. Application Architecture

### 3.1 Project Structure
The source code is primarily housed in the `src/` directory. The entry point of the application is `App.tsx`, which manages the state of the active view and conditionally renders the selected game component.

### 3.2 State & Navigation
Currently, `App.tsx` manages a local state (`activeView`) to switch between different screens rather than heavily relying on a stack navigator for the core game views:
- `HOME`
- `MAZE`
- `SNAKE`
- `TICTACTOE`
- `BLOCKDROP`
- `CHESS`
- `DHAGLABAJI`

---

## 4. Features & Modules (Games)

The application includes the following game modules:

1. **Home Screen (`HomeScreen`)**
   - The main landing page.
   - Provides an interface to select and launch any of the available games.

2. **Maze Game (`MazeGame`)**
   - A classic maze puzzle game.

3. **Snake Game (`SnakeGame`)**
   - A classic snake implementation.

4. **Tic-Tac-Toe (`TicTacToeGame`)**
   - A standard 3x3 grid Tic-Tac-Toe game.

5. **Block Drop (`BlockDropGame`)**
   - A block-stacking or Tetris-style falling block game.

6. **Chess (`ChessGame`)**
   - A fully functional Chess game implementation.

7. **Dhagla Baji (`DhaglaBajiGame`)**
   - A custom local/regional game implementation.

---

## 5. Key Dependencies & Packages

- **Network:** `axios`, `@react-native-community/netinfo`
- **Storage:** `@react-native-async-storage/async-storage`
- **UI/UX Utilities:**
  - `react-native-gesture-handler`
  - `react-native-safe-area-context`
  - `react-native-vector-icons`
  - `react-native-splash-screen`
  - `react-native-modal`
  - `react-native-root-toast`
- **Device Features:**
  - `@notifee/react-native` (Notifications)
  - `react-native-image-picker`
  - `react-native-permissions`

## 6. Build & Scripts
Available npm scripts:
- `npm run start`: Starts the Metro bundler.
- `npm run android`: Builds and runs the app on Android.
- `npm run ios`: Builds and runs the app on iOS.
- `npm run lint`: Runs ESLint.
- `npm run test`: Runs Jest test suite.
