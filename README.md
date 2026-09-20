# RMMS — Robot Mission Management System for Autonomous Mobile Robots

> **Capstone Project:** Robot Mission Management System for Autonomous Mobile Robots (RMMS)  
> **Vietnamese:** Hệ thống quản lý nhiệm vụ cho hệ thống robot tự hành  
  

## 1. Overview

RMMS is a web-based mission management and fleet control center for a heterogeneous fleet of Autonomous Mobile Robots (AMRs).

The system is designed to manage and coordinate simulated robots performing operational missions such as medicine delivery, specimen transport, supply transport, inventory checking, and corridor patrol.

The platform brings robot and mission operations into one control center so operators and supervisors can:

- monitor robot positions and operating state in real time;
- create, schedule, prioritize, assign, and track missions;
- understand why a mission was prioritized or why a robot was selected;
- handle robot and mission alerts and coordinate recovery actions;
- review fleet and mission activity;
- support administration and configuration;
- use an AI Scheduler to assist priority prediction and robot assignment.

Robots are simulated for the project; the system does not depend on physical robot hardware.

---

## 2. Project Context

The current reference scenario is a **single-floor hospital ground-floor service area**.

The planning baseline contains approximately 22 map points, including:

- Pharmacy Warehouse
- Laboratory
- Central Supply Warehouse
- Emergency
- Internal Medicine A
- Internal Medicine B
- Pediatrics
- Nutrition Kitchen
- Linen Store
- Nursing Desk 1
- Nursing Desk 2
- Charging Station 1
- Charging Station 2
- Charging Station 3
- Waiting Area
- Corridor nodes

The hospital scenario is used as the project's current reference data and demonstration context. The underlying workflows and use cases are intended to remain reusable if the scenario changes.

---

## 3. Product Goals

RMMS is intended to provide a central software control center for a heterogeneous AMR fleet.

The product focuses on:

1. Robot fleet management
2. Mission management
3. Real-time fleet monitoring
4. Mission priority prediction
5. Automatic robot assignment
6. Alert and recovery management
7. Activity history
8. Scheduling
9. Performance reporting
10. Administration and site configuration

The frontend is designed as an operational control-center interface rather than a marketing or consumer application.

---

## 4. Current Project Status

### Current frontend milestone

The first five priority UI pages have been implemented:

| # | Screen | Route | Status |
|---|---|---|---|
| 1 | Login | `/login` | Implemented |
| 2 | Dashboard / Real-Time Fleet Map | `/dashboard` | Implemented |
| 3 | Mission Queue | `/missions` | Implemented |
| 4 | Create Mission | `/missions/create` | Implemented |
| 5 | Alerts Center | `/alerts` | Implemented |

The implementation includes the current UI architecture, mock-data flow, Redux/Saga orchestration, simulated realtime behavior, cross-page data consistency work, browser-based UI review, and build/lint verification.

### Planned screens

The remaining product screens are planned as:

6. Mission Detail + Assignment Explanation  
7. Robot List + Robot Registration  
8. Mission Schedule  
9. Reports  
10. Administration

The full product is still under development.

---

## 5. Actors

### Human Actors

#### Administrator

Responsible for:

- login/logout;
- user management;
- role management;
- activity log;
- robot registration and capabilities;
- robot zone assignment;
- home charging-station assignment;
- site configuration.

#### Operator

Responsible for daily fleet operations:

- login/logout;
- mission queue;
- mission creation;
- manual assignment override when needed;
- assignment explanation;
- real-time fleet monitoring;
- mission progress tracking;
- alert acknowledgement and resolution;
- robot maintenance / return-to-service actions.

#### Supervisor

Responsible for:

- operational monitoring;
- mission queue;
- scheduled and recurring missions;
- mission-priority override with a required reason;
- alert acknowledgement and resolution;
- performance reporting.

### System Actors

#### AI Scheduler

Responsible for:

- mission priority prediction;
- filtering eligible robots;
- candidate scoring;
- automatic robot assignment;
- configured optimization / assignment logic.

#### Robot Simulator

Responsible for:

- telemetry;
- heartbeat/state messages;
- mission-state confirmation;
- simulated robot behavior.

---

## 6. Robot Types

### `MED_CART`

- Used for medicine transport.
- Lockable compartments.
- Maximum payload: 30 kg.

### `SUPPLY_CART`

- Used for supplies and linen.
- Maximum payload: 100 kg.

### `PATROL_BOT`

- Used for patrol and monitoring.
- Sensor-equipped.
- Does not transport cargo.

---

## 7. Mission Types

### `STAT_MEDICINE`

Urgent medicine delivery.

Reference target deadline: 15 minutes.

### `SPECIMEN_TRANSPORT`

Specimen transport.

Reference target deadline: 30 minutes.

### `ROUTINE_SUPPLY`

Routine supply transport.

### `STOCK_CHECK`

Warehouse shelf inventory checking.

### `CORRIDOR_PATROL`

Scheduled night corridor patrol.

### Default Priority Order

```text
STAT_MEDICINE
    >
SPECIMEN_TRANSPORT
    >
ROUTINE_SUPPLY
    >
STOCK_CHECK
    >
CORRIDOR_PATROL
```

The queue also considers remaining time to deadline and waiting time.

### Capability Rules

```text
Medicine
  -> MED_CART

Supplies / linen
  -> SUPPLY_CART

PATROL_BOT
  -> cannot accept cargo transport missions
```

Robot type, mission type, zone, priority rules, and recovery rules are intended to be data-driven rather than hard-coded business configuration.

---

## 8. Core Workflows

## WF-01 — Create Mission, Predict Priority, and Auto-Assign

The core mission workflow is:

```text
Operator creates mission
        ↓
System validates mission data
        ↓
Mission enters PENDING
        ↓
AI Scheduler predicts priority
        ↓
Queue is reordered with explanation
        ↓
Eligible robots are filtered
        ↓
Candidates are scored
        ↓
Robot is selected
        ↓
Mission is assigned
        ↓
Robot receives order
        ↓
Robot confirms mission state
        ↓
Assignment reasoning is logged
```

Important rules include:

- pickup and destination must exist on the configured map;
- deadline must be in the future;
- payload must respect capacity/capability constraints;
- missions initially enter `PENDING`;
- Supervisor priority override requires a reason;
- manual assignment override requires a reason;
- if no suitable robot exists, the mission remains `PENDING`;
- if AI scheduling fails, the configured rule fallback can be used.

## WF-02 — Mission Execution and Real-Time Monitoring

Robots provide simulated telemetry including:

- position;
- battery;
- speed;
- nearest location;
- mission progress;
- error state;
- heartbeat timestamp.

The frontend presents the information through the real-time fleet dashboard.

## WF-03 — Incident, Recovery, and Alerts

The monitoring workflow can produce alerts for conditions such as:

- low battery;
- robot offline;
- mission timeout;
- robot error;
- collision warning;
- mission completion.

Recovery actions include:

```text
PAUSE
CANCEL
REASSIGN
RETURN-TO-CHARGE
```

For reassignment, the mission returns to `PENDING`, its priority is preserved, the failed robot is excluded, and assignment is evaluated again.

## WF-04 — Robot Onboarding and Commissioning

The administrator registers a robot, configures its capabilities, assigns its zone and home charging station, and commissions it.

## WF-05 — Scheduled / Recurring Missions

The Supervisor can create recurring schedules.

Examples include:

- corridor patrol at 22:00 every night;
- inventory checking at 06:00 every Monday.

Scheduled missions are generated into the normal mission workflow.

---

## 9. Mission and Robot States

### Robot States

The project uses states such as:

```text
AVAILABLE
BUSY / IN_PROGRESS
CHARGING
MAINTENANCE
COMMISSIONING
OFFLINE
```

### Mission States

At minimum:

```text
PENDING
IN_PROGRESS
COMPLETED
FAILED
CANCELLED
```

### Alert Categories

```text
LOW_BATTERY
ROBOT_OFFLINE
MISSION_TIMEOUT
ROBOT_ERROR
COLLISION_WARNING
MISSION_COMPLETED
```

---

## 10. Frontend Technology Stack

The frontend is intentionally implemented with a ReactJS + JavaScript stack.

| Area | Technology |
|---|---|
| Framework | ReactJS |
| Language | JavaScript / JSX |
| Build Tool | Vite |
| State Management | Redux Toolkit |
| Async / Side Effects | Redux-Saga |
| Routing | React Router |
| HTTP Layer | Axios |
| Styling | Tailwind CSS + centralized CSS variables |
| Icons | Lucide React |
| Forms | React Hook Form |
| Validation | Zod |
| Map Prototype | Leaflet + React-Leaflet |
| Charts | Recharts |
| Testing | Vitest + React Testing Library |
| Code Quality | ESLint + Prettier |
| Package Manager | npm |
| i18n | i18next + react-i18next |

### Architecture Principle

The frontend keeps API and realtime concerns behind service boundaries.

The preferred flow is:

```text
React UI
   ↓
Redux action
   ↓
Redux-Saga
   ↓
Service / API / Realtime layer
   ↓
Success / Failure action
   ↓
Redux reducer
   ↓
Selector
   ↓
React UI
```

Components should not call Axios directly for asynchronous domain operations.

---

## 11. Realtime and Telemetry

The dashboard is designed as a real-time fleet monitoring surface.

Telemetry can contain:

```text
robotId
timestamp
status
position
battery
speed
nearestLocation
missionId
missionProgress
error
heartbeatAt
```

The UI should clearly show stale or offline state when heartbeat becomes too old.

### Offline Threshold

The current operational threshold for the frontend demo is:

```text
5 seconds
```

Conceptually:

```text
heartbeat age < 5s
    → healthy/fresh

heartbeat age approaching threshold
    → stale/warning indication

heartbeat age >= 5s
    → OFFLINE
```

The threshold should be centralized and must not be duplicated as unrelated hard-coded literals.

For the mock realtime demo, heartbeat updates should occur frequently enough to avoid falsely marking a healthy robot offline merely because the mock ticker waited too long.

---

## 12. Data Consistency Rules

Dashboard, Mission Queue, Create Mission, and Alerts Center are intended to behave as one coherent operational system.

The same domain entity must use the same stable identifier everywhere.

### Robot

```text
robotId
```

### Mission

```text
missionId
assignedRobotId
```

### Alert

```text
alertId
robotId
missionId
```

Examples:

```text
Dashboard
MED-01 → MIS-1042

Mission Queue
MIS-1042 → MED-01

Alert
A-203 → MED-01 → MIS-1042
```

The same current robot should not show different battery, status, mission, or heartbeat information on different pages unless the UI explicitly represents historical data.

The same mission should not appear as `PENDING` on one page and `IN_PROGRESS` on another page without an explicit historical/time-state explanation.

Dashboard counters, Mission Queue counters, and Alert Center counters should be derived from the underlying state rather than maintained as unrelated hard-coded numbers.

---

## 13. AI Scheduler

The AI Scheduler assists with:

### Priority Prediction

The frontend should expose explainable factors such as:

- mission type weight;
- time remaining to deadline;
- waiting time;
- area/context.

The UI should not describe the scheduler as infallible or “always correct”.

### Robot Assignment

The assignment explanation can include:

- capability match;
- battery margin;
- distance;
- current load/state.

Candidate robots that are not eligible should show a clear reason.

Example:

```text
SUP-01
Not eligible

Reason:
Locked medicine compartment required
```

### Fallback

If AI scheduling fails, the project can use a configured static rule fallback.

---

## 14. UI / UX Design System

The product is designed as a:

> **Modern industrial control center + healthcare operations dashboard**

The interface should feel:

- professional;
- calm;
- highly readable;
- information-dense without becoming cluttered;
- operational rather than decorative;
- suitable for long monitoring sessions;
- precise and trustworthy.

### Core Visual Language

- desktop-first;
- light application background;
- dark navy sidebar;
- primary blue for actions/navigation;
- restrained teal for realtime emphasis;
- green for healthy/completed/available;
- amber for warnings;
- red for critical/error conditions;
- Inter typography;
- 8px spacing rhythm;
- medium-radius cards;
- subtle borders and shadows.

### Avoid

- excessive gradients;
- glassmorphism;
- giant marketing-style sections;
- unnecessary pill-shaped controls;
- random colors for unrelated cards;
- neon decorative effects;
- excessive shadows;
- decorative illustrations that do not help operations.

### Core Design Tokens

```text
Background: #F8FAFC
Surface:    #FFFFFF
Sidebar:    #0B1220
Text:       #0F172A
Muted:      #64748B
Border:     #E2E8F0

Primary:    #2563EB
Primary Soft: #DBEAFE
Realtime Accent: #0EA5A4

Success:    #16A34A
Warning:    #D97706
Danger:     #DC2626
Info:       #0284C7
```

Status must never be communicated through color alone.

---

## 15. Global Application Shell

Authenticated pages use a shared shell:

```text
AppShell
├── Sidebar
├── MainArea
│   ├── TopHeader
│   └── PageContent
└── GlobalOverlays
    ├── ToastHost
    ├── ModalHost
    └── DrawerHost
```

### Sidebar

Navigation:

```text
Dashboard
Mission Queue
Create Mission
Alerts
Robots
Schedule
Reports
Administration
```

Navigation visibility is permission-aware.

### Top Header

The desktop header contains:

- current section / breadcrumb;
- realtime connection indicator;
- alert bell and unread count;
- current user;
- optional search/command affordance;
- page-level action slot.

---

## 16. First Five Frontend Screens

### 1. Login

Route:

```text
/login
```

Purpose:

- authenticate users;
- identify the authenticated role;
- support demo accounts;
- show validation/loading/error/success states.

### 2. Dashboard

Route:

```text
/dashboard
```

Purpose:

- fleet overview;
- real-time robot positions;
- battery;
- speed;
- mission progress;
- heartbeat;
- active missions;
- critical alerts.

The map is the primary operational visual.

### 3. Mission Queue

Route:

```text
/missions
```

Purpose:

- inspect prioritized missions;
- search/filter;
- inspect priority explanation;
- inspect assignment candidates;
- support Supervisor priority override;
- support Operator manual assignment override.

### 4. Create Mission

Route:

```text
/missions/create
```

Required mission information includes:

- mission type;
- pickup location;
- destination when applicable;
- deadline;
- load/task description.

After creation, the mission enters:

```text
PENDING
```

The AI Scheduler evaluates priority and assignment through the normal workflow.

### 5. Alerts Center

Route:

```text
/alerts
```

Purpose:

- monitor abnormal conditions;
- inspect affected robot/mission;
- acknowledge alerts;
- resolve alerts;
- coordinate recovery;
- preserve audit-friendly resolution information.

---

## 17. Planned Product Screens

The full product screen plan is:

```text
01 Login
02 Dashboard — Real-time Fleet Map
03 Mission Queue
04 Create Mission
05 Alerts Center
06 Mission Detail + Assignment Explanation
07 Robot List + Robot Registration
08 Mission Schedule
09 Reports
10 Administration
```

The first five screens are the current frontend milestone. The remaining screens will be developed in later project phases.

---

## 18. Project Structure

The frontend follows a feature-first architecture.

```text
rmms/
├── public/
│   ├── icons/
│   └── map/
│
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── AppProviders.jsx
│   │   └── routeConfig.js
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── brand/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── feedback/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── missions/
│   │   ├── alerts/
│   │   ├── robots/
│   │   ├── schedules/
│   │   ├── reports/
│   │   └── administration/
│   │
│   ├── hooks/
│   ├── routes/
│   ├── services/
│   │   ├── api/
│   │   └── realtime/
│   │
│   ├── store/
│   ├── constants/
│   ├── mocks/
│   ├── utils/
│   ├── styles/
│   └── i18n/
│
├── tests/
├── .env.example
├── .gitattributes
├── .gitignore
├── package.json
└── README.md
```

### Structure Rules

- Features own their feature-specific pages, components, state, selectors, saga, and services.
- Truly reusable UI belongs in `components/ui`.
- Global API configuration belongs in `services/api`.
- Realtime integration belongs in `services/realtime`.
- Domain constants are centralized.
- Mock data belongs in `mocks`, not large JSX files.
- Sagas handle asynchronous orchestration.
- UI components dispatch actions and render state.
- Selectors isolate React components from the Redux state tree.
- Axios should not be called directly from JSX components.
- Repeated UI should become reusable components.

---

## 19. Reusable UI and Domain Components

### UI Primitives

```text
Button
IconButton
Input
Textarea
Select
Combobox
DateTimePicker
Checkbox
Switch
Badge
StatusBadge
Tooltip
DropdownMenu
Modal
Drawer
Tabs
Pagination
Skeleton
EmptyState
ErrorState
ConfirmDialog
Toast
```

### Layout Components

```text
AppShell
Sidebar
TopHeader
PageContainer
PageHeader
Section
Panel
SplitPane
Stack
Grid
```

### RMMS Domain Components

```text
RobotStatusBadge
MissionStatusBadge
MissionPriorityBadge
AlertSeverityBadge
BatteryIndicator
HeartbeatIndicator
RobotMarker
MissionRoute
MissionQueueTable
MissionQueueRow
MissionSummaryCard
AssignmentExplanationPanel
PriorityExplanation
AlertList
AlertDetailPanel
RecoveryActionMenu
FleetKpiCard
FleetStatusSummary
```

---

## 20. Mock Data Strategy

Until backend APIs are connected:

- keep mock data under `src/mocks`;
- use stable IDs;
- keep data shapes compatible with future API boundaries;
- do not regenerate random values on every render;
- simulate realtime changes through an isolated mock service / Saga;
- maintain consistent robot, mission, and alert relationships.

Reference demo entities include:

```text
Robots
MED-01
SUP-01
PAT-01

Missions
MIS-1042
MIS-1043
MIS-1044
MIS-1045

Alerts
A-203
A-204
A-205
A-206
A-207
```

---

## 21. State Management

Redux Toolkit is used for application state.

Redux-Saga is used for asynchronous orchestration such as:

- authentication;
- mission creation;
- realtime telemetry simulation;
- alert workflows;
- asynchronous service calls;
- future scheduler/API integration.

Not every piece of UI state belongs in Redux.

Local component state is appropriate for temporary UI concerns such as:

- modal open/close;
- input drafts;
- temporary selections;
- visual interaction state.

---

## 22. API / Realtime / Simulator Boundaries

The recommended product boundary is:

```text
                         React UI
                            │
              ┌─────────────┴─────────────┐
              │                           │
           REST API                 Realtime Channel
              │                           │
              │                  telemetry / heartbeat /
              │                  mission progress / alerts
              │                           │
              └─────────────┬─────────────┘
                            Backend
                              │
                    MQTT / WebSocket /
                        SignalR layer
                              │
                      Robot Simulator
                           Webots
```

The capstone proposal permits:

- server: .NET Core / Spring Boot / Node.js;
- realtime: WebSocket / MQTT;
- simulator: Gazebo / Webots / CoppeliaSim / ROS 2;
- AI scheduler: Python with FastAPI/Flask;
- database: SQL Server / MySQL / PostgreSQL.

These choices are treated as integration boundaries rather than frontend assumptions.

---

## 23. Security and Scope Rules

The frontend must:

- never hard-code secrets;
- never commit API keys;
- use environment configuration for local settings;
- treat backend authorization as the final authority;
- avoid storing unnecessary sensitive information;
- keep frontend permission checks limited to UX visibility and route protection.

The current project scope does **not** include:

- multiple floors;
- elevators;
- automatic doors;
- path planning;
- patient records;
- medical compliance claims;


---


## 24. Quality and Testing

A page is not considered complete merely because the static layout renders.

The UI should be reviewed for:

- desktop layout;
- responsive behavior;
- loading state;
- error state;
- empty state;
- success state;
- disabled state;
- permission-aware controls;
- keyboard accessibility;
- focus states;
- accessible labels;
- status semantics;
- visual consistency.

### Automated Checks

The current frontend quality gate uses:

```bash
npm run lint
npm run build
```

Vitest / React Testing Library are used for component and behavior testing where applicable.

### Browser QA

The frontend implementation is also reviewed in the browser at a primary desktop viewport around:

```text
1440 × 900
```

The review should include:

- page rendering;
- browser console;
- visual hierarchy;
- layout overflow;
- text clipping;
- broken assets;
- map rendering;
- drawers;
- dialogs;
- interactions;
- loading/error/empty states;
- cross-page consistency.

---

## 25. Development Principles

### Source of Truth

Business behavior should come from documented RMMS requirements and project specifications.

### Data-driven Domain Configuration

Robot types, mission types, zones, priority rules, and recovery rules should be represented as data/configuration wherever the backend model supports it.

### Explainability

Mission priority and robot assignment should be understandable to operators and supervisors rather than presented as an unexplained black box.

### Operational Clarity

The UI should answer quickly:

- What is happening right now?
- Which robots are available, busy, charging, or offline?
- Which missions need attention first?
- Why was a mission prioritized?
- Why was a robot selected or rejected?
- Is there an abnormal condition?
- What action can be taken next?

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
