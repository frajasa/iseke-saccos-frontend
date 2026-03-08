# ISEKE SACCO Design System

## 🎨 Brand Overview

Based on the ISACCOS logo, this design system implements a professional, modern, and accessible interface that reflects the values of financial growth and community empowerment.

### Brand Identity
- **Primary Brand**: ISACCOS (Community Savings & Credit Cooperative)
- **Tagline**: "Empowering Financial Growth"
- **Mission**: Provide accessible financial services to empower communities

---

## 🎨 Color Palette

### Brand Colors (From Logo)

```css
/* Navy Blue - Primary */
--brand-navy: #003B73          /* Main brand color */
--brand-navy-light: #0052A3    /* Hover states, highlights */
--brand-navy-dark: #002952     /* Darker accents */

/* Emerald Green - Secondary */
--brand-green: #008751         /* Success, growth, prosperity */
--brand-green-light: #00A562   /* Lighter accents */
--brand-green-dark: #006940    /* Darker accents */
```

### Application Colors

```css
/* Backgrounds */
--background: #F8FAFB          /* Page background */
--card: #FFFFFF                /* Card backgrounds */
--secondary: #E8F4F8           /* Secondary backgrounds */
--muted: #F1F5F9              /* Subtle backgrounds */

/* Text */
--foreground: #1A202C          /* Primary text */
--muted-foreground: #64748B    /* Secondary text */

/* Interactive */
--primary: #003B73             /* Buttons, links, active states */
--primary-hover: #0052A3       /* Hover states */
--success: #008751             /* Success messages, positive actions */
--destructive: #DC2626         /* Errors, destructive actions */
--accent: #FF6B35             /* Highlights, notifications */

/* Borders */
--border: #E2E8F0             /* Default borders */
--input: #E2E8F0              /* Input borders */
```

### Usage Guidelines

**Navy Blue (#003B73)**
- Primary buttons and CTAs
- Active navigation items
- Important headings
- Links and interactive elements

**Emerald Green (#008751)**
- Success states and messages
- Financial growth indicators
- Positive trends
- Confirmation actions

**Accent Orange (#FF6B35)**
- Notifications and alerts
- Important highlights
- Call-to-attention elements

**Destructive Red (#DC2626)**
- Error messages
- Destructive actions (delete, cancel)
- Warning indicators
- Overdue items

---

## 📐 Layout & Spacing

### Container Widths
- Mobile: 100% (with padding)
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px
- Max: 1440px

### Spacing Scale
```css
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-12: 3rem    (48px)
--space-16: 4rem    (64px)
```

### Border Radius
- Small: `0.5rem` (8px) - Buttons, inputs
- Medium: `0.75rem` (12px) - Cards, default
- Large: `1rem` (16px) - Modals, large cards
- Circle: `50%` - Avatars, icons

---

## 🔤 Typography

### Font Families
```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem      /* 12px - Small labels */
--text-sm: 0.875rem     /* 14px - Secondary text */
--text-base: 1rem       /* 16px - Body text */
--text-lg: 1.125rem     /* 18px - Large text */
--text-xl: 1.25rem      /* 20px - Headings */
--text-2xl: 1.5rem      /* 24px - Page titles */
--text-3xl: 1.875rem    /* 30px - Main headings */
--text-4xl: 2.25rem     /* 36px - Hero text */
```

### Font Weights
- Regular: 400 - Body text
- Medium: 500 - Subheadings, emphasis
- Semibold: 600 - Headings, labels
- Bold: 700 - Important headings

---

## 🧩 Reusable Components

### 1. PageHeader Component
Professional page headers with icon, title, description, and actions.

```tsx
import PageHeader from "@/components/ui/PageHeader";
import { Calculator } from "lucide-react";

<PageHeader
  icon={Calculator}
  title="Accounting Dashboard"
  description="Manage financial records and reports"
  iconColor="bg-primary/10"
  actions={<Button>Add Entry</Button>}
/>
```

### 2. StatCard Component
Display key metrics with icons and optional trends.

```tsx
import StatCard from "@/components/ui/StatCard";
import { TrendingUp } from "lucide-react";

<StatCard
  icon={TrendingUp}
  label="Total Members"
  value="1,234"
  subtitle="Active members"
  iconColor="text-primary"
  valueColor="text-foreground"
  trend={{ value: "+12%", isPositive: true }}
/>
```

### 3. Card Component
Flexible card container with consistent styling.

```tsx
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

<Card padding="lg" hover>
  <CardHeader>
    <CardTitle>Report Title</CardTitle>
    <CardDescription>Report details</CardDescription>
  </CardHeader>
  <div>Card content here</div>
</Card>
```

### 4. Button Component
Consistent buttons with variants and sizes.

```tsx
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

<Button
  variant="primary"
  size="md"
  icon={Plus}
  iconPosition="left"
>
  Add New
</Button>
```

**Button Variants:**
- `primary` - Main actions (Navy blue)
- `secondary` - Secondary actions (Light background)
- `outline` - Alternative actions (Outlined)
- `ghost` - Subtle actions (No background)
- `success` - Positive actions (Green)
- `destructive` - Dangerous actions (Red)

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Wide desktop */
2xl: 1536px /* Extra wide */
```

### Mobile-First Approach
All components are designed mobile-first, then enhanced for larger screens.

```tsx
// Example: Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

---

## ✨ Shadows & Effects

### Shadow Scale
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

### Hover Effects
- Cards: `hover:shadow-md transition-all duration-200`
- Buttons: `hover:bg-primary-hover transition-all duration-200`
- Navigation: `hover:scale-102 transition-all duration-200`

### Gradients
```css
/* Logo area */
bg-gradient-to-r from-primary/5 to-success/5

/* Active nav items */
bg-gradient-to-r from-primary to-primary-hover

/* User profile */
bg-gradient-to-br from-primary to-success
```

---

## 🎯 UI Patterns

### Page Structure
```tsx
<div className="space-y-6">
  {/* Page Header */}
  <PageHeader ... />

  {/* Filters / Controls */}
  <Card padding="lg">
    {/* Filter components */}
  </Card>

  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <StatCard ... />
  </div>

  {/* Main Content */}
  <Card>
    {/* Tables, lists, etc */}
  </Card>
</div>
```

### Form Layout
```tsx
<Card padding="lg">
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
    <CardDescription>Form description</CardDescription>
  </CardHeader>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Form fields */}
  </div>

  <div className="flex justify-end gap-2 mt-6">
    <Button variant="outline">Cancel</Button>
    <Button variant="primary">Submit</Button>
  </div>
</Card>
```

### Table Layout
```tsx
<Card padding="none">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-muted/50 border-b border-border">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-semibold">
            Header
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        <tr className="hover:bg-secondary/50 transition-colors">
          <td className="px-4 py-3 text-sm">Data</td>
        </tr>
      </tbody>
    </table>
  </div>
</Card>
```

---

## 🌓 Dark Mode Support

The design system includes full dark mode support:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0F1419
    --card: #1A202C
    --primary: #0052A3
    --success: #00A562
    /* etc */
  }
}
```

---

## ♿ Accessibility

### Best Practices
- Minimum contrast ratio: 4.5:1 for normal text
- Focus indicators on all interactive elements
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support

### Focus States
```css
focus:ring-2 focus:ring-primary focus:border-transparent
```

---

## 📊 Data Visualization

### Color Assignments
- **Assets**: Blue (#003B73)
- **Liabilities**: Red (#DC2626)
- **Equity**: Purple (#8B5CF6)
- **Income**: Green (#008751)
- **Expenses**: Orange (#FF6B35)

### Chart Colors
```tsx
const chartColors = {
  primary: '#003B73',
  success: '#008751',
  warning: '#FF6B35',
  danger: '#DC2626',
  info: '#0052A3',
};
```

---

## 🚀 Usage Examples

### Complete Page Example
```tsx
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Calculator, Plus, TrendingUp } from "lucide-react";

export default function ExamplePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calculator}
        title="Financial Dashboard"
        description="Overview of financial metrics"
        actions={
          <Button variant="primary" icon={Plus}>
            New Transaction
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value="TZS 1.2M"
          iconColor="text-success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        {/* Content */}
      </Card>
    </div>
  );
}
```

---

## 📝 Component Library

All components are located in `components/ui/`:
- `PageHeader.tsx` - Page headers
- `StatCard.tsx` - Statistic cards
- `Card.tsx` - Generic cards
- `Button.tsx` - Buttons
- More to come...

---

## 🎯 Design Principles

1. **Consistency** - Use established patterns across all pages
2. **Clarity** - Clear visual hierarchy and readable typography
3. **Efficiency** - Quick to scan and understand
4. **Accessibility** - Usable by everyone
5. **Professionalism** - Reflects financial institution standards
6. **Brand Alignment** - Consistent with ISACCOS identity

---

## 📱 Implementation Checklist

- ✅ Brand colors implemented
- ✅ Logo integrated
- ✅ Reusable components created
- ✅ Sidebar updated with brand styling
- ✅ Responsive design system
- ✅ Dark mode support
- ✅ Accessibility features
- ⏳ All pages using new components (in progress)

---

## 🔄 Next Steps

1. Update all existing pages to use new components
2. Create additional UI components as needed
3. Implement data visualization library
4. Add animation library for smooth transitions
5. Create component storybook for reference

---

**Design System Version**: 1.0.0
**Last Updated**: October 2025
**Status**: ✅ Active & Ready to Use
