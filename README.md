# Momentum

A calm, offline-first habit and goal tracker built with React Native and Expo. Momentum turns big goals into small daily wins: create a habit, get one gentle reminder, tap once to check it off, and watch your progress build.

<!-- Add a short demo video or GIF here -->

## Screenshots

| Today                                | Habit detail                                       | Progress                                   | Weekly review                                        |
| ------------------------------------ | -------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| ![Today](docs/screenshots/today.png) | ![Habit detail](docs/screenshots/habit-detail.png) | ![Progress](docs/screenshots/progress.png) | ![Weekly review](docs/screenshots/weekly-review.png) |

## Features

- **One-tap check-ins** with an animated check, particle burst, progress ring and haptics
- **Flexible schedules:** every day, chosen weekdays, or a target such as 3 times per week
- **Streaks you can trust:** calculated from dated completion records, never a fragile counter
- **Streak freeze and midnight grace period:** two freezes a month protect a missed day, and check-ins before 3 AM still count for the previous day
- **Calendar heatmap** for every habit, with tap-to-fix for forgotten days
- **Goals** linked to habits, with progress measured across the whole goal period
- **Weekly review** with completion rate, strongest habit, best day and a gentle suggestion
- **Smart local reminders** that cancel themselves once you have done the habit
- **Celebrations and badges** for real milestones only (3, 7, 14, 30, 100 and 365 day streaks)
- **Onboarding**, a personal greeting, light, dark and system themes
- **Swipe to archive or delete**, with archived habits restorable from Profile
- **Fully offline:** all data lives in a local SQLite database on the device

## Tech stack

- Expo (React Native) with TypeScript and Expo Router
- `expo-sqlite` for local storage and versioned migrations
- `react-native-reanimated`, `react-native-svg` and `react-native-gesture-handler` for animation and gestures
- `@gorhom/bottom-sheet` for the create sheet
- `expo-notifications` for local reminders
- Urbanist and Inter via `@expo-google-fonts`

## Engineering notes

- **Derived state over stored state.** Streaks, heatmaps, goal progress and the weekly review are all computed from completion records by pure functions in `src/lib`, which keeps them easy to reason about and test.
- **Local day keys.** Every date is a local `YYYY-MM-DD` key, so a Monday, Wednesday and Friday habit never breaks on a Tuesday, and timezone changes stay correct.
- **Rolling reminder window.** Reminders are scheduled one day at a time for the next 7 days. A single sync function diffs what should exist against what is pending, so finishing a habit cancels that day's reminder and editing a habit reschedules it.
- **Versioned migrations** using `PRAGMA user_version`, so new tables ship without wiping user data.
- **Design tokens.** One theme file drives light and dark mode, with a separate palette for habit colors.

## Getting started

```powershell
npm install
npx expo start -c
```

Open the project in Expo Go on a phone or an emulator. SQLite does not run in the web build, so use a device.

### Try it with sample data

Open **Profile**, then **Demo tools**, then **Load sample data**. It adds a few habits with about ten weeks of history, a goal and some badges, which makes every screen easy to explore. The same menu previews the celebrations without waiting for a long streak.

## Project structure

```
src/
  app/            Expo Router screens: (tabs), (onboarding), habit, goal, weekly review
  components/     UI building blocks: HabitRow, Heatmap, ProgressRing, GoalCard and more
  db/             SQLite client, migrations and queries
  hooks/          Data hooks for each screen
  lib/            Pure logic: schedule, streaks, stats, goal progress, weekly review, reminders
  theme/          Colors, habit color palette and theme provider
```

## Roadmap

Ideas from the original product brief that are not built yet: cloud sync and backup, home screen widgets, shared challenges, and AI habit suggestions.
