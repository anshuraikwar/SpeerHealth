# ARCHITECTURE.md

# Insight Board - Architecture Overview

## Overview

Insight Board is a mobile-first application built using Expo and React Native.  
The application uses GraphQL as the data access layer and Supabase as the backend platform for authentication, database management, and real-time capabilities.

The architecture focuses on:

- Rapid prototyping
- Clean UI interactions
- Real-time collaborative updates
- Strong client-side validation
- Mobile-first UX

---

# High-Level Architecture

```text
┌─────────────────────┐
│     Mobile App      │
│   (Expo / React)    │
└──────────┬──────────┘
           │
           │ GraphQL Queries & Mutations
           │
┌──────────▼──────────┐
│   Apollo Client     │
│  State + Networking │
└──────────┬──────────┘
           │
           │
┌──────────▼──────────┐
│      GraphQL API    │
│   (Supabase GraphQL)│
└──────────┬──────────┘
           │
           │
┌──────────▼──────────┐
│      Supabase       │
│ Auth + Postgres DB  │
│ Realtime + Storage  │
└─────────────────────┘
```

---

# Technology Stack

| Layer | Technology |
|---|---|
| Mobile Framework | Expo + React Native |
| Language | TypeScript |
| API Layer | GraphQL |
| Backend | Supabase |
| State & Data Fetching | Apollo Client |
| Forms | React Hook Form |
| Validation | Zod |
| UI Components | React Native Paper |
| Bottom Sheets | Gorhom Bottom Sheet |
| Charts | react-native-chart-kit |
| Animations | Reanimated |
| Local Storage | AsyncStorage |

---

# Application Structure

```text
src/
├── components/
├── constants/
├── screens/
├── graphql/
│   ├── queries/
│   ├── mutations/
├── hooks/
├── lib/
├── services/
├── styles/
├── types/
├── utils/
```

---

# Core Architectural Decisions

## 1. Expo Managed Workflow

### Why It Was Chosen

Expo enables rapid development and simplified mobile deployment workflows.

Benefits:
- Fast onboarding
- QR-based testing using Expo Go
- Simplified native dependency management
- Easier cross-platform development

### Trade-Offs

#### Prototype Advantage
Excellent for rapid iteration and MVP development.

#### Production Considerations
Large-scale production apps may eventually migrate to:
- Expo prebuild workflow
- Bare React Native workflow

Reasons:
- Greater native customization
- Fine-grained performance tuning
- Easier integration of unsupported native modules

---

# Form Management

## React Hook Form + Zod

### Why It Was Chosen

Benefits:
- High performance form handling
- Minimal re-renders
- Type-safe validation
- Excellent TypeScript support

### Architecture

```text
Form Input
    ↓
React Hook Form
    ↓
Zod Validation
    ↓
Inline Errors
    ↓
GraphQL Mutation
```

### Trade-Offs

#### Prototype Advantage
Fast form development with minimal boilerplate.


---

# UI Architecture

## React Native Paper

Used as the primary UI component library.

### Why It Was Chosen

Benefits:
- Material Design support
- Fast UI assembly
- Consistent component behavior
- Good Expo compatibility

### Trade-Offs

#### Prototype Advantage
Accelerates UI development significantly.

#### Production Considerations

Larger apps may eventually:
- Build fully custom design systems
- Replace Paper components selectively
- Use token-driven theming systems

---

# State Management

## Current Approach

The app primarily relies on:
- Apollo Client cache
- Local component state
- React hooks

### Why It Was Chosen

Avoids unnecessary complexity during the prototype stage.

### Trade-Offs

#### Prototype Advantage
Simple mental model and reduced boilerplate.

#### Production Considerations

As complexity grows, production apps may adopt:
- Zustand
- Redux Toolkit

Especially for:
- Offline support
- Complex synchronization
- Cross-screen shared state
- Background task coordination

---

# Analytics Layer

## Current Implementation

Charts implemented using:
- react-native-chart-kit
- react-native-svg

### Trade-Offs

#### Prototype Advantage
Quick integration and lightweight setup.

#### Production Considerations

For advanced analytics dashboards:
- Victory Native
- Recharts (web)
- Custom D3 visualizations
- Server-side aggregation pipelines

may provide better flexibility and scalability.

---

# Local Persistence

## AsyncStorage

Used for lightweight local persistence.

### Trade-Offs

#### Prototype Advantage
Simple key-value storage solution.

#### Production Considerations

Production apps may require:
- Encrypted storage
- SQLite
- WatermelonDB
- Realm
- MMKV

depending on:
- Offline-first requirements
- Large local datasets
- Performance needs
- Security requirements

---

# Performance Considerations

Current optimizations include:
- Debounced search
- Optimistic UI updates
- Minimal form re-renders

Potential future optimizations:
- Pagination / infinite scroll
- Virtualized lists
- Memoized GraphQL fragments
- Image optimization
- Offline caching
- Background synchronization

---

# Summary

This architecture prioritizes:
- Rapid iteration
- Clean mobile UX
- Developer productivity

The current stack is well-suited for:
- MVPs
- Internal tools
- Early-stage production applications

As the platform scales, the architecture can evolve incrementally toward:
- Dedicated backend services
- Advanced caching layers
- Offline-first support
- More sophisticated state management
- Enterprise-grade infrastructure