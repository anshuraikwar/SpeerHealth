# Insight Board App

A mobile-first insight management application built with Expo, GraphQL, and Supabase. The application enables users to manage, track, and analyze insights across different pipeline stages in real time.

---

# Tech Stack

- Expo
- React Native
- GraphQL
- Supabase
- TypeScript
- Zod Validation

---

# Setup Instructions

## Prerequisites

Before running the project, ensure the following are installed:

- Node.js
- Expo Go mobile app on your Android or iOS device

---

## Installation & Running the Project

### 1. Clone the Repository

```bash
git clone https://github.com/anshuraikwar/SpeerHealth.git
cd SpeerHealth
```

### 2. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 3. Start the Expo Development Server

```bash
npx expo start --tunnel
```

### 4. Run the App on Mobile

- Open the **Expo Go** app on your mobile device
- Scan the QR code generated in the terminal/browser after running:

```bash
npx expo start --tunnel
```

The application should now launch on your device.

---

# Implemented Features

## Module 1: Authentication

### Login Screen

- Provides email and password input fields for user authentication
- Users can securely sign in using their credentials

---

## Module 2: Insight Board

### 2.1 Stage Navigation Bar

A horizontal pipeline navigation bar containing four interactive stages:

- Observation
- Insight
- Actionable
- Impact

#### Features

- Displays the total number of insights within each stage
- Selecting a stage updates the insight list accordingly
- Active stage is visually highlighted
- Insight counts update in real time when modified locally

---

### 2.2 Insight Card List

A vertically scrollable list displaying insights for the selected stage.

Each insight card includes:

- Insight title
- HCP name
- Priority badge with color indicators:
  - P1 — Red
  - P2 — Orange
  - P3 — Yellow
  - P4 — Gray
- Category label
- Relative timestamp (e.g. “2h ago”, “Yesterday”)

#### Additional Behavior

- Empty state UI displayed when no insights exist in a stage

---

### 2.3 Swipe-to-Update Workflow

Insights can be moved between stages using swipe gestures.

#### Features

- Swipe right to move an insight forward in the pipeline
- Swipe left to move an insight backward
- Forward movement reveals a green action panel with destination stage
- Backward movement reveals an red action panel
- Backward swipe is disabled for Observation stage
- Forward swipe is disabled for Impact stage
- Uses optimistic UI updates for immediate feedback
- Failed GraphQL mutations automatically restore the card to its original position

---

### 2.4 Filter & Search System

Includes advanced filtering capabilities below the pipeline navigation bar.

#### Features

- Debounced search input (300ms) for title and description search
- Multi-select priority filters (P1, P2, P3, P4)
- “Clear all” action to reset filters

---

### 2.5 GraphQL Integration

- Insight board data is fetched using GraphQL queries with dynamic filter variables

---

## Module 3: Insight Detail & Form Management

### 3.1 Insight Detail Panel

Selecting an insight opens a bottom sheet containing:

- Complete insight information
- Linked HCP details:
  - Name
  - Specialty
  - Institution
- Activity timeline
- Action buttons:
  - Edit
  - Move (stage selector — currently non-functional)

---

### 3.2 Create & Edit Insight Form

#### Supported Fields

- Title *(required)*
- Description *(required, multiline)*
- Priority *(required)*
- Category
- Stage
- Linked HCP *(GraphQL-powered autocomplete search)*
- Drug Name
- Tags *(multi-select from existing tags)*

#### Features

- Create and update operations handled via GraphQL mutations
- Real-time Zod validation with inline error messaging
- Unsaved changes warning before dismissing the form

---

### 3.3 Activity Log

- Activity history displayed in a tabular format within the detail panel

---

## Module 4: Analytics Dashboard

Accessible through the analytics button located at the bottom-left corner of the application.

---

### 4.1 KPI Cards

Displays:

- Total insight count
- Insights grouped by stage using a mini pie chart visualization

---

### 4.2 Insights Over Time Chart

- Line chart visualization with weekly buckets
- Displays insight trends for the last 8 weeks

---

### 4.3 Analytics Data Requirements

- Analytics data is retrieved using GraphQL queries
