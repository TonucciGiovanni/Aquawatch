# AquaWatch

A mobile app for monitoring water quality sensors in real time. Built with [Expo](https://expo.dev/) and React Native.

## Overview

AquaWatch helps you track sensor readings, view alerts, and explore sensor locations on a map. This README is a starting point—update any section below as the project evolves; changes pushed to GitHub will appear on the remote repository automatically.

## Features

- **Dashboard** — Overview of all sensors and their current status
- **Alerts** — Notifications when readings exceed thresholds
- **Map** — Geographic view of sensor locations
- **Sensor details** — Charts and history for individual sensors

## Tech stack

- [Expo SDK 54](https://docs.expo.dev/)
- React Native
- React Navigation
- Zustand (state management)
- react-native-chart-kit (charts)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm
- [Expo Go](https://expo.dev/go) on your device, or an Android/iOS emulator

### Install and run

```bash
git clone https://github.com/TonucciGiovanni/Aquawatch.git
cd Aquawatch
npm install
npm start
```

Then scan the QR code with Expo Go, or press `a` for Android / `i` for iOS in the terminal.

### Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm start`    | Start the Expo dev server |
| `npm run android` | Run on Android        |
| `npm run ios`  | Run on iOS               |
| `npm run web`  | Run in the browser       |

## Project structure

```
src/
├── api/           # API and sensor data fetching
├── components/    # Reusable UI components
├── navigation/    # App navigation
├── screens/       # Screen components
├── store/         # Zustand stores
└── theme/         # Colors and styling
```

## Updating this README

Edit `README.md` locally, commit, and push:

```bash
git add README.md
git commit -m "Update README"
git push
```

Your changes will show on GitHub at [github.com/TonucciGiovanni/Aquawatch](https://github.com/TonucciGiovanni/Aquawatch).

## License

<!-- Add your license here (e.g. MIT) -->

## Author

[TonucciGiovanni](https://github.com/TonucciGiovanni)
