# Teacher Onboarding System

## Overview

A persistent, toast-style onboarding component that guides new teachers through essential setup steps. The toast appears at the bottom of the screen across all classroom pages, providing contextual guidance without blocking navigation or forcing modals.

## Features

### Core Components

1. **OnboardingToast** - Compact, persistent progress indicator
   - Fixed at bottom of screen (mobile & desktop)
   - Progress bar with percentage
   - Next step with quick action button
   - Mobile-specific sidebar navigation hint
   - Dismissible but reappears until complete
   - Smooth slide-in animation

2. **OnboardingFlow** - State orchestrator
   - Manages localStorage persistence
   - Auto-detects completion via React Query
   - Handles Google Classroom imports
   - Tracks progress across all pages

## Implementation

### Integration Points

The onboarding toast is integrated into:

- `/app/(classroom)/classroom/[classId]/[teacherId]/layout.tsx` - Persists across all classroom pages

### Initial Redirect

After class creation, teachers are redirected to:

- `/classroom/{classId}/{teacherId}/roster?newClass=true` - Roster page to add/view students

### Query Parameters

- `?newClass=true` - Triggers welcome message for newly created class
- `?googleImport=true` - Marks both class creation AND roster addition as complete (Google Classroom import auto-populates roster)

### State Management

**LocalStorage Key Format:** `onboarding_{classId}`

**Storage Structure:**

```typescript
{
  classId: string;
  completedSteps: {
    createClass: boolean;
    addStudents: boolean;
    makeJot: boolean;
    assignJot: boolean;
  }
  isDismissed: boolean;
  lastUpdated: string;
}
```

### Auto-Detection

The system automatically detects completion by querying:

- **Student Count:** `/api/classrooms/get-all-students`
- **Assignment Count:** `/api/prompt-sessions/class/[classId]`
- **Jot Count:** `/api/prompts/teacher-prompts/[teacherId]`

React Query handles real-time updates with 5-minute stale time.

## User Flow

### Standard Class Creation

1. Teacher creates class manually → Redirects to `/classroom/{classId}/{teacherId}/roster?newClass=true`
2. Toast appears at bottom: "🎉 Welcome! - Next Step: Add Students to Roster"
3. Progress bar shows 25% (step 1 complete)
4. Teacher adds students → Progress updates to 50%
5. Teacher creates jot → Progress updates to 75%
6. Teacher assigns jot → Progress reaches 100%, toast disappears

### Google Classroom Import

1. Teacher imports Google Classroom → Redirects to roster page with `?newClass=true&googleImport=true`
2. Toast shows 50% progress (steps 1 & 2 complete - roster auto-populated)
3. Teacher sees imported students on roster page
4. Onboarding continues from step 3 (Make a Jot)

### Mobile Experience

- Toast includes sidebar navigation hint: "Navigate your class by tapping the sidebar icon"
- Icon displays next to instruction
- Only visible on screens ≤768px
- Menu is hidden by default on mobile, opened via sidebar trigger

## Behavior

### Visibility Rules

- **Show toast if:**
  - Setup is incomplete (any step = false)
  - Not dismissed by user
  - User is within classroom pages

- **Hide toast if:**
  - All steps completed
  - User dismissed (persists in localStorage)
  - Reappears if user opens incomplete class later

### Persistence

- Toast appears on **all classroom pages** (roster, assignments, settings, etc.)
- Fixed position at bottom center
- Floats above content with high z-index
- Persists during page navigation within classroom

### Dismissal

- Click X button to dismiss temporarily
- Onboarding reappears until all steps complete
- Per-class persistence (different classes = different progress)

## Customization

### Update Step Definitions

Edit `/lib/onboarding-utils.ts`:

```typescript
export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    id: "yourStep",
    label: "Your Step Label",
    description: "Step description",
    actionUrl: (classId, teacherId) => "/your/url",
    actionLabel: "Your CTA",
  },
  // ... more steps
];
```

### Update Completion Detection

Modify `detectCompletionState()` in `/lib/onboarding-utils.ts`

### Styling

Components use Tailwind CSS and shadcn/ui primitives. Customize in component files.

## API Endpoints

Created for onboarding:

- `GET /api/prompt-sessions/class/[classId]?teacherId={teacherId}` - Returns class assignments

Existing endpoints used:

- `GET /api/classrooms/get-all-students?classId={classId}&teacherId={teacherId}`
- `GET /api/prompts/teacher-prompts/[teacherId]`

## File Structure

```
components/onboarding/
  ├── index.ts                    # Exports
  ├── onboarding-flow.tsx         # Main wrapper with state management
  ├── onboarding-toast.tsx        # Persistent toast component
  ├── setup-progress-widget.tsx   # (Legacy) Progress visualization
  └── progress-step.tsx           # (Legacy) Individual step component

lib/
  └── onboarding-utils.ts         # State management & utilities

components/ui/
  └── progress.tsx                # Progress bar primitive

app/(classroom)/classroom/[classId]/[teacherId]/
  └── layout.tsx                  # Toast integration point

app/api/prompt-sessions/class/[classId]/
  └── route.ts                    # Assignment count API
```

## Visual Design

### Toast Layout

```
┌─────────────────────────────────────────┐
│ 🎉 Welcome!                        25%  │ [X]
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│ Next Step: Add Students to Roster      │
│                              [Add Students →] │
│                                         │
│ 📱 Navigate your class by tapping      │
│    the sidebar icon      (Mobile Only) │
└─────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Create class manually → Toast appears at bottom, redirects to roster
- [ ] Import Google Classroom → Steps 1 & 2 auto-complete, see students on roster
- [ ] Add students → Progress updates to 50%
- [ ] Create jot → Progress updates to 75%
- [ ] Assign jot → Progress reaches 100%, toast hides
- [ ] Dismiss toast → Reappears on page refresh
- [ ] Complete all steps → Toast permanently hides
- [ ] Multiple classes → Separate progress per class
- [ ] Navigate between classroom pages → Toast persists
- [ ] Mobile view → Sidebar hint appears
- [ ] Click next action button → Navigates correctly
- [ ] Responsive design → Toast fits mobile/tablet/desktop

## Best Practices

1. **Non-blocking:** Teachers can navigate freely at any time
2. **Persistent:** Appears across all classroom pages
3. **Contextual:** Guidance appears where relevant (starting at roster)
4. **Dismissible:** Teachers maintain control
5. **Progressive:** Steps unlock as previous actions complete
6. **Mobile-friendly:** Includes sidebar navigation hint
7. **Compact:** Minimal screen real estate usage
8. **Responsive:** Adapts to all screen sizes

## Future Enhancements

- Highlight next action button with glow animation
- Confetti animation on completion
- Backend persistence (currently localStorage only)
- Analytics tracking for completion rates
- A/B testing different onboarding messages
