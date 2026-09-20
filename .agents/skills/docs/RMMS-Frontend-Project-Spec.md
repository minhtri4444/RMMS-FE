# RMMS Frontend Project Specification

> Project: **Robot Mission Management System for Autonomous Mobile Robots (RMMS)**
>
> Vietnamese: **Hệ thống quản lý nhiệm vụ cho hệ thống robot tự hành**
>
> Frontend decision for this project: **ReactJS (JavaScript)**.

---

## 1. Document purpose

This document is the frontend source-of-truth for the RMMS web control center. It defines:

- frontend stack and coding standards;
- project architecture and folder structure;
- UI/UX direction and design system;
- roles, permissions, and navigation behavior;
- data/mock-data conventions;
- state management with Redux Toolkit + Redux-Saga;
- API/realtime boundaries;
- quality, testing, accessibility, and responsive rules;
- rules that the AI coding agent must follow when generating or modifying the UI.

This specification is based primarily on:

1. `FA26SE205_ROBOT_MISSION_MANAGEMENT_SYSTEM_FOR_AUTO_tampm.docx`
2. `RMMS — Kế hoạch tuần 2 & nền tảng dự án (18_09_2026).docx`
3. The RMMS use-case diagram supplied with the project.

Where the project documents leave implementation details open, the choices below are **frontend engineering decisions/recommendations**, not claims that those details were mandated by the capstone brief.

---

# 2. Product context

## 2.1 Product goal

RMMS is a web-based control center for a heterogeneous fleet of Autonomous Mobile Robots (AMRs). The platform is intended to:

- manage robots and their capabilities;
- create, schedule, assign, and track missions;
- monitor the fleet in real time;
- support automatic mission priority prediction and robot assignment;
- show activity history;
- handle alerts and recovery;
- provide statistical reporting.

Robots are simulated rather than physical robots for the project. The project proposal allows a simulator such as Webots, with an integration/bridge into the platform.

## 2.2 Current reference scenario

The current planning document proposes a **single-floor hospital ground-floor service area**.

Reference map:

- approximately 22 map points;
- Pharmacy Warehouse;
- Laboratory;
- Central Supply Warehouse;
- Emergency;
- Internal Medicine A;
- Internal Medicine B;
- Pediatrics;
- Nutrition Kitchen;
- Linen Store;
- 2 nursing desks;
- 3 charging stations;
- waiting area;
- corridor nodes.

Reference robot types:

- `MED_CART` — lockable compartments, maximum 30 kg;
- `SUPPLY_CART` — maximum 100 kg;
- `PATROL_BOT` — no cargo transport; sensor-equipped.

Reference mission types:

- `STAT_MEDICINE` — urgent medicine delivery, target deadline 15 minutes;
- `SPECIMEN_TRANSPORT` — specimen transport, target deadline 30 minutes;
- `ROUTINE_SUPPLY` — routine supplies;
- `STOCK_CHECK` — warehouse shelf inventory check;
- `CORRIDOR_PATROL` — scheduled night patrol.

Default priority order in the planning document:

`STAT_MEDICINE > SPECIMEN_TRANSPORT > ROUTINE_SUPPLY > STOCK_CHECK > CORRIDOR_PATROL`

The queue also considers remaining deadline time and waiting time.

Capability constraints:

- medicine → `MED_CART`;
- supplies/linen → `SUPPLY_CART`;
- `PATROL_BOT` cannot accept cargo transport missions.

---

# 3. Primary actors and frontend authorization

## 3.1 Human actors

### Administrator

Responsible for:

- login/logout;
- user and role management;
- activity log;
- robot registration/capabilities;
- robot zone assignment;
- home charging station assignment;
- site configuration.

### Operator

Responsible for daily control operations:

- login/logout;
- view mission queue;
- create missions;
- manually override assignment when needed;
- view assignment explanation;
- monitor the real-time fleet map;
- track mission progress;
- acknowledge and resolve alerts;
- set robot maintenance / return to service.

### Supervisor

Responsible for:

- all operational monitoring available to the supervisor;
- view mission queue;
- create scheduled/recurring missions;
- override mission priority with a required reason;
- acknowledge and resolve alerts;
- review performance reports.

## 3.2 System actors

### AI Scheduler

System actor responsible for:

- predicting mission priority;
- filtering eligible robots;
- scoring candidates;
- automatic robot assignment;
- running the configured optimization/assignment logic.

### Robot Simulator

System actor responsible for:

- robot telemetry;
- heartbeat/state messages;
- mission state confirmation;
- simulated robot behavior.

## 3.3 Frontend permission principle

Frontend permissions are for **UX visibility and route protection only**. The backend remains the final authority.

Do not spread role checks everywhere like:

```js
if (role === "ADMIN") ...
```

Prefer a centralized permission model:

```js
const PERMISSIONS = {
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  VIEW_MISSION_QUEUE: "VIEW_MISSION_QUEUE",
  CREATE_MISSION: "CREATE_MISSION",
  OVERRIDE_ASSIGNMENT: "OVERRIDE_ASSIGNMENT",
  OVERRIDE_PRIORITY: "OVERRIDE_PRIORITY",
  ACKNOWLEDGE_ALERT: "ACKNOWLEDGE_ALERT",
  MANAGE_ROBOTS: "MANAGE_ROBOTS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_SITE_CONFIG: "MANAGE_SITE_CONFIG",
  VIEW_REPORTS: "VIEW_REPORTS",
};
```

Map roles to permissions in one place.

---

# 4. Frontend technology stack

## 4.0 Frontend AI Skill stack and execution rules

The project uses five workspace-local AI skills as **design/engineering aids**. They do not replace this specification or the capstone source documents.

Expected workspace layout:

```text
.agents/
└── skills/
    ├── taste-skill/
    │   └── SKILL.md
    ├── frontend-design/
    │   └── SKILL.md
    ├── emil-design-eng/
    │   └── SKILL.md
    ├── pick-ui-library/
    │   └── SKILL.md
    └── prototype/
        └── SKILL.md
```

### Skill responsibilities

| Skill | Required use in RMMS |
|---|---|
| `taste-skill` | Visual-quality critique and anti-generic design gate. Use it to challenge weak hierarchy, spacing, visual noise, templated layouts, and inconsistent visual decisions. Follow the actual `SKILL.md` instructions in the workspace. |
| `frontend-design` | Distinctive, intentional visual direction for each new UI. Use it to make deliberate palette, typography, composition, density, and layout choices rather than default/template-looking screens. The RMMS product direction remains the source of truth. |
| `emil-design-eng` | Design-engineering workflow: translate the product brief into reusable, implementation-ready components, tokens, states, and interactions. Follow the actual workspace skill rather than recreating it manually in prompts. |
| `pick-ui-library` | Evaluate the existing UI stack and decide whether an existing component library/primitives should be reused, extended, or introduced. Do not add a dependency automatically; inspect the repo first and preserve the simplest maintainable choice. |
| `prototype` | Define and validate page interaction flows, states, drawers/modals, feedback, and cross-page navigation before polishing implementation. Use this especially for the five first milestone screens. |

### Skill precedence

When instructions overlap or conflict, use this order:

1. **Capstone/project requirements and documented RMMS business rules**.
2. **`RMMS-Frontend-Project-Spec.md`**.
3. **The actual contents of the workspace-local skills**.
4. Existing repository conventions, where they do not conflict with the above.
5. General frontend conventions or model defaults.

A skill must **never override** a documented RMMS business rule, permission rule, route, data vocabulary, or scope boundary.

### Required skill workflow for AI agents

Before implementing a new screen, the agent must:

1. Read all five skill files from `.agents/skills/`.
2. Inspect the existing repository and installed dependencies.
3. Identify reusable components before adding new ones.
4. Produce an internal design plan covering visual intent, layout, component composition, interaction states, responsive behavior, and data/state boundaries.
5. Apply `frontend-design` + `taste-skill` as the visual-quality gates.
6. Apply `emil-design-eng` to translate the design into reusable React components and tokens.
7. Apply `pick-ui-library` before introducing any UI package or duplicating primitives.
8. Apply `prototype` to the interaction model and state transitions.
9. Implement the smallest coherent change.
10. Perform a final visual/interaction review against both the five skills and this specification.

The agent should explicitly state which skill(s) influenced a significant design or architecture decision in its implementation summary, but it must not paste or reproduce entire skill files into source code or documentation.

### Do not optimize for “using all five skills everywhere”

Use only the parts of each skill that are relevant to the task. The goal is **coherent design**, not visible skill stacking. For example, `prototype` is highly relevant to login/error/loading and mission/alert interactions, while `pick-ui-library` is most relevant when choosing or extending component primitives.

### UI library decision rule

The project does not mandate a specific third-party component library. Before installing one, the agent must inspect the existing project and apply `pick-ui-library`. Prefer a small, accessible primitive set that works cleanly with Tailwind and the RMMS design tokens. Do not introduce multiple overlapping UI libraries.

## 4.1 Required choices

| Area | Decision |
|---|---|
| Language | JavaScript |
| Framework | ReactJS |
| Build tool | Vite |
| Global state | Redux Toolkit |
| Async side effects | Redux-Saga |
| Routing | React Router |
| HTTP | Axios |
| UI styling | Tailwind CSS + CSS variables/tokens |
| Icons | Lucide React |
| Forms | React Hook Form |
| Validation | Zod |
| Maps | React-Leaflet / Leaflet for prototype |
| Charts | Recharts |
| Unit/component testing | Vitest + React Testing Library |
| Code quality | ESLint + Prettier |
| Package manager | npm |
| i18n | i18next + react-i18next |

### Notes

The capstone registration explicitly permits a JavaScript/ReactJS web client. The stack above is a frontend architecture choice designed to keep the implementation modular and ready for real APIs.

Do not add another state-management library unless there is a documented reason.

---

# 5. UI/UX design direction

## 5.0 Design-skill application rule

The visual system below defines the **RMMS product identity**. The five AI skills should improve how the system is designed and implemented, not replace the product identity with a generic style.

- Use `frontend-design` to make intentional choices in composition, hierarchy, typography, and page-specific visual emphasis.
- Use `taste-skill` as a critique pass: remove generic template patterns, weak hierarchy, unnecessary decoration, and inconsistent visual language.
- Use `emil-design-eng` to turn those choices into reusable, maintainable React components and design tokens.
- Use `pick-ui-library` when deciding whether controls should come from an existing library/primitives instead of being recreated.
- Use `prototype` to verify interaction flows, feedback, overlays, and state transitions before final polish.

**Do not change the RMMS semantic color meanings, domain terminology, permissions, or operational density simply to satisfy a generic visual trend.**

## 5.1 Product style

**Modern industrial control center + healthcare operations dashboard.**

The interface should feel:

- professional;
- calm;
- highly readable;
- information-dense without becoming cluttered;
- operational rather than decorative;
- suitable for long monitoring sessions;
- trustworthy and precise.

Avoid a generic startup/SaaS landing-page aesthetic.

## 5.2 Visual principles

### Use

- clean 8px spacing rhythm;
- strong hierarchy;
- compact but comfortable data tables;
- restrained borders;
- medium-radius cards;
- clear status chips;
- persistent sidebar;
- sticky top header;
- data-first dashboards;
- subtle elevation;
- map-centered monitoring.

### Avoid

- excessive glassmorphism;
- giant hero sections inside the application;
- excessive gradients;
- huge rounded “pill everything” UI;
- random colors per card;
- neon decorative effects;
- too many shadows;
- emoji used as primary UI icons.

## 5.3 Color system

The palette is a recommended product-design decision.

### Core

```text
--color-bg:            #F8FAFC   /* application background */
--color-surface:       #FFFFFF   /* cards / panels */
--color-sidebar:       #0B1220   /* navigation */
--color-text:          #0F172A   /* primary text */
--color-text-muted:    #64748B   /* secondary text */
--color-border:        #E2E8F0   /* borders */
--color-primary:       #2563EB   /* primary actions */
--color-primary-soft:  #DBEAFE   /* selected/soft blue */
--color-accent:        #0EA5A4   /* live/realtime accent */
```

### Semantic

```text
--color-success:       #16A34A
--color-success-soft:  #DCFCE7

--color-warning:       #D97706
--color-warning-soft:  #FEF3C7

--color-danger:        #DC2626
--color-danger-soft:   #FEE2E2

--color-info:          #0284C7
--color-info-soft:     #E0F2FE
```

### Color rule

The palette is intentionally restrained because RMMS is an operational control center. Distinctiveness should come from **composition, hierarchy, spacing, typography, map/data presentation, and page-specific emphasis**, not from adding random colors.

- Red is reserved for critical/error/timeout/collision-warning contexts.
- Amber is for warning states.
- Green is for healthy/completed/available states.
- Blue is for navigation, selected state, and primary actions.
- Teal is used sparingly for live/realtime emphasis.
- Never communicate status by color alone; pair color with text/icon.

## 5.4 Typography

Use **Inter** for the product UI.

Recommended hierarchy:

- page title: 24–28px, semibold;
- section title: 16–18px, semibold;
- body: 14px;
- table/meta text: 12–13px;
- KPI numbers: 24–32px, semibold/bold.

Numbers and operational labels should use tabular/monospaced-friendly rendering where useful for:

- timers;
- robot IDs;
- mission IDs;
- battery percentages;
- heartbeat timestamps.

---

# 6. Global application shell

## 6.1 Desktop-first frame

Primary design target:

`1440 × 900`

Supported practical breakpoints:

- 1280+ desktop;
- 1024–1279 compact desktop/tablet landscape;
- 768–1023 tablet;
- under 768 mobile fallback.

The first five priority screens are expected to be used mainly on desktop.

## 6.2 Shell structure

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

## 6.3 Sidebar navigation

Recommended navigation order:

1. Dashboard
2. Mission Queue
3. Create Mission
4. Alerts
5. Robots
6. Schedule
7. Reports
8. Administration

Bottom area:

- signed-in user;
- role label;
- settings/profile entry if later required;
- logout.

Navigation items should be permission-aware.

## 6.4 Top header

Desktop header should contain:

- breadcrumb or current section label;
- realtime connection indicator;
- alert bell with unread count;
- current user;
- optional command/search affordance;
- page-level action slot.

---

# 7. Core reusable component system

Create reusable components before duplicating UI.

## 7.1 Primitive UI

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

## 7.2 Layout components

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

## 7.3 RMMS domain components

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

# 8. React project structure

Use a **feature-first architecture**.

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
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── authSlice.js
│   │   │   ├── authSaga.js
│   │   │   ├── authSelectors.js
│   │   │   └── authService.js
│   │   │
│   │   ├── dashboard/
│   │   ├── missions/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── missionSlice.js
│   │   │   ├── missionSaga.js
│   │   │   ├── missionSelectors.js
│   │   │   └── missionService.js
│   │   │
│   │   ├── alerts/
│   │   ├── robots/
│   │   ├── schedules/
│   │   ├── reports/
│   │   └── administration/
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePermission.js
│   │   ├── useDebounce.js
│   │   └── useRealtime.js
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── permissionRoutes.js
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── axiosClient.js
│   │   │   └── endpoints.js
│   │   └── realtime/
│   │       ├── mqttClient.js
│   │       └── signalRClient.js
│   │
│   ├── store/
│   │   ├── rootReducer.js
│   │   ├── rootSaga.js
│   │   └── store.js
│   │
│   ├── constants/
│   │   ├── missionTypes.js
│   │   ├── robotTypes.js
│   │   ├── statuses.js
│   │   ├── permissions.js
│   │   └── navigation.js
│   │
│   ├── mocks/
│   │   ├── robots.js
│   │   ├── missions.js
│   │   ├── alerts.js
│   │   ├── locations.js
│   │   └── dashboard.js
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── formatDuration.js
│   │   ├── formatBattery.js
│   │   └── missionRules.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── tokens.css
│   │
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/
│   │
│   └── main.jsx
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .agents/
│   └── skills/
│
├── .env.example
├── eslint.config.js
├── package.json
├── prettier.config.js
└── README.md
```

## Structure rules

1. A feature owns its page, feature components, state, selectors, saga, and API service when those are feature-specific.
2. Truly generic UI belongs in `components/ui`.
3. Global API configuration belongs in `services/api`.
4. Domain constants belong in `constants`.
5. Mock data must live in `mocks`, never inline inside large JSX files.
6. Do not create a 1,000+ line page component.
7. Extract repeated blocks into components.
8. Selectors should keep UI components from knowing the Redux state tree.
9. Sagas handle orchestration/async workflows; components dispatch actions and render state.
10. Do not call Axios directly from JSX components.

---

# 9. Redux Toolkit + Redux-Saga rules

## 9.1 Recommended flow

```text
UI event
  ↓
dispatch(action)
  ↓
Redux-Saga
  ↓
service/API
  ↓
success/failure action
  ↓
slice reducer
  ↓
selector
  ↓
React UI
```

## 9.2 Example mission state

```js
{
  items: [],
  selectedMission: null,
  filters: {
    search: "",
    missionType: "ALL",
    status: "ALL",
    priority: "ALL"
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  loading: false,
  error: null,
  lastUpdatedAt: null
}
```

## 9.3 Realtime state

Keep realtime telemetry separated from static CRUD state where practical.

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

Frontend should render stale/offline state clearly when heartbeat is too old.

---

# 10. Domain status vocabulary

Keep domain enums centralized.

## Robot

```text
AVAILABLE
BUSY / IN_PROGRESS
CHARGING
MAINTENANCE
COMMISSIONING
OFFLINE
```

The planning document explicitly uses:

- `COMMISSIONING`;
- `ONLINE`;
- `AVAILABLE`;
- `MAINTENANCE`;
- `CHARGING`;
- `OFFLINE`.

## Mission

At minimum, the UI should support:

```text
PENDING
IN_PROGRESS
COMPLETED
FAILED
CANCELLED
```

The planning workflow explicitly uses `PENDING`, `IN_PROGRESS`, `COMPLETED`, and `FAILED`; additional UI statuses should be treated as implementation extensions and kept consistent with the backend contract.

## Alert

Recommended UI categories:

```text
LOW_BATTERY
ROBOT_OFFLINE
MISSION_TIMEOUT
ROBOT_ERROR
COLLISION_WARNING
MISSION_COMPLETED
```

These come directly from the notification requirements.

---

# 11. Mission UI rules

The mission-creation form must reflect WF-01:

Required user input:

- mission type;
- pickup location;
- delivery/destination location;
- deadline;
- cargo/load description.

Validation:

- pickup/destination must exist on the configured map;
- deadline must be in the future;
- payload/load must be compatible with robot capacity/capability;
- show validation before submit;
- after successful creation the mission enters `PENDING`.

Do not let the create form silently perform a manual robot assignment.

Priority is computed by the scheduler. Supervisor priority override is a separate action and requires a reason.

---

# 12. AI Scheduler UI rules

The UI should show the AI Scheduler as an explainable system component.

For priority:

```text
AI Priority Score
Why this score?
- Mission type weight
- Time remaining to deadline
- Waiting time
- Area/context
```

For assignment:

```text
Selected robot
Candidate robots
Why selected?
- Capability match
- Battery margin
- Distance
- Current load/state
```

The UI must never claim the model is “certain” or “always correct”.

If the project uses the rule fallback, display a clear label such as:

`Scheduling mode: Rule fallback`

The planning document states that the fallback rule table is used if AI fails.

---

# 13. Dashboard requirements

The Dashboard is the fleet control center.

It must expose, at minimum:

- real-time robot position;
- robot status;
- battery;
- mission progress;
- current speed;
- last heartbeat;
- alerts.

Recommended information architecture:

```text
Page Header
  ↓
KPI Row
  ↓
Main Monitoring Row
  ├── Real-time Fleet Map
  └── Active Missions / Alert Summary
  ↓
Fleet / Mission Detail Table
```

Do not turn the dashboard into a collection of decorative KPI cards.

---

# 14. Alerts requirements

The alert center must support the workflow:

1. monitor detects abnormal condition;
2. alert is generated;
3. alert appears in the center and may appear as a toast;
4. configured recovery policy can be applied;
5. operator acknowledges;
6. operator resolves/closes;
7. activity log records the resolution.

Recovery actions in the source workflow:

```text
PAUSE
CANCEL
REASSIGN
RETURN-TO-CHARGE
```

For `REASSIGN`, preserve the mission priority and rerun assignment while excluding the failed robot.

---

# 15. Navigation and routing

Recommended route map:

```text
/login

/dashboard
/missions
/missions/create
/missions/:missionId
/alerts
/robots
/robots/:robotId
/schedules
/reports
/admin/users
/admin/site-config
```

Only implement the first five priority pages initially:

- `/login`
- `/dashboard`
- `/missions`
- `/missions/create`
- `/alerts`

Placeholders for later routes are acceptable, but do not fake unavailable business functionality.

---

# 16. Mock-data strategy

Until backend APIs are connected:

- keep mock data under `src/mocks`;
- use realistic RMMS data;
- make data shape match the future API contract;
- do not generate random values every render;
- use stable IDs;
- simulate time/realtime updates through a dedicated mock service/saga;
- mark mock mode clearly in developer documentation.

Recommended mock robot IDs:

```text
MED-01
SUP-01
PAT-01
```

Use the three reference robot types from the planning document.

Recommended sample mission IDs:

```text
MIS-1042
MIS-1043
MIS-1044
MIS-1045
```

Recommended sample locations should use the current hospital reference map.

---

# 17. Forms, errors, loading, and empty states

Every data-driven page must define:

### Loading

- skeletons;
- disabled submit buttons during submission;
- no layout jumping.

### Error

Show:

- what failed;
- whether the action can be retried;
- a retry button where appropriate.

### Empty

Example:

`No pending missions match the current filters.`

Do not leave blank white areas.

### Success

Use a concise toast and update the affected content immediately.

---

# 18. Responsive and accessibility rules

- Keyboard navigation must work.
- Every icon-only button needs an accessible label.
- Form controls need labels.
- Focus states must remain visible.
- Status cannot be communicated using color alone.
- Maintain readable contrast.
- Tables must remain usable at compact widths.
- Do not use hover-only access for critical actions.
- Modal/dialog close behavior must be keyboard accessible.
- Loading indicators should not rely only on animation.

---

# 19. Frontend security rules

- Never hard-code secrets.
- Never put API keys in source files.
- Use `.env` for environment configuration.
- Never trust frontend role checks as authorization.
- Sanitize/render external content safely.
- Avoid storing sensitive user data unnecessarily.
- Do not include patient health records in the mock UI because they are outside the defined project scope.

---

# 20. Coding conventions

## Files

Use:

```text
PascalCase.jsx    for React components
camelCase.js      for utilities, services, hooks, selectors
*.slice.js        for Redux slices
*.saga.js         for sagas
*.test.jsx        for tests
```

## Components

Prefer:

```jsx
export function MissionQueueTable() {
  return ...
}
```

Avoid giant default-export-only modules when named exports improve testability/readability.

## Hooks

Custom hooks must begin with:

```text
use...
```

## Constants

Use uppercase semantic names for immutable constant groups.

---

# 21. Testing baseline

For the first five pages, at minimum test:

### Login

- renders form;
- validates required fields;
- submit dispatches login;
- disabled/loading state;
- failed login displays error.

### Dashboard

- renders KPI values;
- renders robot statuses;
- renders alert count;
- renders offline indicator when heartbeat is stale.

### Mission Queue

- renders missions;
- filtering changes visible rows;
- priority badges render correctly;
- supervisor override requires a reason.

### Create Mission

- required field validation;
- invalid deadline rejected;
- valid submit dispatches create action;
- loading and success behavior.

### Alerts

- filters;
- acknowledge action;
- resolve action;
- recovery action menu;
- critical severity styling.

---

# 22. Definition of Done for each page

A page is not “done” when the static layout exists.

It is done when:

- layout follows RMMS design tokens;
- responsive desktop behavior works;
- loading/error/empty/success states exist;
- mock data is separated from components;
- state comes through Redux where global;
- async flow is saga-driven;
- controls are keyboard accessible;
- permissions are respected;
- no console errors;
- tests cover key behavior;
- UI is visually consistent with the other RMMS screens;
- the page passes a `frontend-design` visual-intent check;
- the page passes a `taste-skill` quality/anti-generic check;
- component/library choices were checked against `pick-ui-library`;
- interaction states/flows were checked with `prototype`;
- reusable implementation decisions follow `emil-design-eng` guidance.

---

# 23. AI coding-agent rules

The AI coding agent must:

1. Read this markdown before editing the frontend.
2. Preserve ReactJS + JavaScript.
3. Preserve Redux Toolkit + Redux-Saga.
4. Use the feature-first project structure.
5. Reuse existing components before creating duplicates.
6. Avoid inventing unsupported business workflows.
7. Keep mission, robot, alert, and role vocabularies consistent with the project source.
8. Use mock data only through `src/mocks` during UI-only development.
9. Keep backend integration boundaries explicit.
10. Implement visual states, not only the happy path.
11. Never silently remove an existing feature to make a page compile.
12. After major changes, run lint/tests/build when available.
13. Prefer small, reviewable changes.
14. Keep the design system centralized.
15. Ask for clarification only when a missing backend contract blocks a correct implementation; otherwise make the smallest documented frontend assumption.
16. Read and apply the five workspace-local skills before designing or implementing the first five screens.
17. Treat `frontend-design` and `taste-skill` as required visual-quality gates.
18. Use `emil-design-eng` for design-to-code/component decisions, `pick-ui-library` for UI primitive/library decisions, and `prototype` for interaction/state-flow decisions.
19. Do not add dependencies solely because a skill mentions a library; inspect the project and keep the dependency set minimal.
20. Do not claim that a skill was “used” unless the agent actually read and applied its workspace instructions.

---

# 24. Initial five-screen scope

The first UI milestone is exactly:

```text
01 Login
02 Dashboard
03 Mission Queue
04 Create Mission
05 Alerts Center
```

The remaining screens are planned later:

```text
06 Mission Detail + Assignment Explanation
07 Robot List + Robot Registration
08 Mission Schedule
09 Reports
10 Administration
```

The current planning document explicitly assigns these five screens for the present week.

---

# 25. Source alignment checklist

Before adding any RMMS-specific UI behavior, verify:

- [ ] Actor matches the use case.
- [ ] Mission type is one of the configured types or clearly marked as future configuration.
- [ ] Robot type/capability rule is respected.
- [ ] Queue behavior matches WF-01.
- [ ] Dashboard telemetry matches WF-02.
- [ ] Alerts/recovery behavior matches WF-03.
- [ ] The UI does not create patient-record functionality outside scope.
- [ ] The UI does not imply multi-floor/elevator/autonomous collision-avoidance functionality.
- [ ] AI scheduling is shown as explainable support, not as an unexplained magic black box.

---

# 26. Recommended future integration boundaries

```text
React UI
   │
   ├── REST API → users / robots / missions / alerts / reports
   │
   └── Realtime channel → telemetry / heartbeat / mission progress / alerts
             │
             └── Backend / MQTT bridge / WebSocket-or-SignalR layer

AI Scheduler
   │
   └── priority prediction + robot assignment

Webots
   │
   └── simulated robot state / telemetry
```

The capstone proposal explicitly allows .NET Core, Spring Boot, or Node.js for the server; MQTT/WebSocket for realtime communication; a Webots/Gazebo/CoppeliaSim/ROS 2 simulator; Python for the AI scheduler; and SQL Server/MySQL/PostgreSQL for the database. The frontend specification intentionally keeps these backend choices behind API/realtime boundaries.

---

# 27. Five-screen design gate

Before the first five screens are considered visually complete, the agent must review them as a single product using the five workspace skills.

### Visual gate

- `frontend-design`: Does each page make deliberate visual choices that are specific to RMMS rather than looking like a stock dashboard/template?
- `taste-skill`: Is there any weak hierarchy, visual clutter, unnecessary decoration, inconsistent spacing, or low-quality default styling?
- `emil-design-eng`: Are visual decisions expressed as reusable components/tokens rather than one-off page code?
- `pick-ui-library`: Are primitive controls consistent, accessible, and sourced from the chosen component strategy rather than duplicated ad hoc?
- `prototype`: Can a user complete the main page flow with predictable loading, error, success, overlay, and navigation states?

### Deliverable gate

Each page should have:

1. a clear operational purpose;
2. reusable components;
3. realistic stable mock data;
4. loading/error/empty/success states where relevant;
5. permission-aware actions;
6. keyboard-accessible interactions;
7. consistent RMMS tokens and shell behavior;
8. a clear next action for the operator/supervisor.

# 27. Final design objective

RMMS should look like a **real operations control center for a small hospital robot fleet**, not a generic admin template.

The visual hierarchy should make these questions answerable within seconds:

- What is happening right now?
- Which robots are available, busy, charging, or offline?
- Which missions need attention first?
- Why did the system prioritize or assign a mission?
- Is any robot or mission in an abnormal condition?
- What action can the operator take next?
