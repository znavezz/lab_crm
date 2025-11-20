# Figma Make Prompt: Lab CRM Color Theme Update

## Design Request

Apply the provided color palette to the existing Lab CRM design system. Keep the current layout, components, and functionality exactly as they are, but update all colors throughout the application to use the new color palette. The result should be a color-themed version of the current design.

## App Overview

**Application Type:** Laboratory CRM (Customer Relationship Management) system for managing research lab operations
**Current Design:** Existing shadcn/ui based design with standard layouts and components
**Target Users:** Lab researchers, administrators, and project managers
**Current Tech Stack:** Next.js, React, Tailwind CSS, shadcn/ui components

## Current App Structure

**Main Navigation Sections:**
1. **Dashboard** - Overview with key metrics and recent activity
2. **Members** - Lab personnel management (researchers, staff, alumni)
3. **Projects** - Research project tracking and management
4. **Publications** - Academic paper and publication tracking
5. **Grants** - Funding and grant management
6. **Equipment** - Lab equipment inventory and maintenance
7. **Events** - Lab events, seminars, and meetings
8. **Protocols** - Experimental protocols and procedures
9. **Analytics** - Data visualization and reporting

**Existing Components:**
- Navigation bar with section tabs
- Dashboard stat cards (4 cards in grid)
- Data tables with filtering and search
- Detail pages with comprehensive information
- Forms for CRUD operations
- Charts and analytics visualizations
- Activity feeds and recent items

## Color Palette

Replace the current color scheme with this exact color palette:

- **Chart 1: `#5D90D4`** (Medium Blue) - Primary color for Members, navigation highlights
- **Chart 2: `#86D66F`** (Vibrant Green) - Primary color for Projects, success states
- **Chart 3: `#DEAD71`** (Warm Tan) - Primary color for Publications, neutral highlights
- **Chart 4: `#D65C5C`** (Coral Red) - Primary color for Grants, alerts/warnings
- **Chart 5: `#F2F2F2`** (Light Gray) - Primary color for Equipment, backgrounds

## Color Application Guidelines

**Do NOT change:**
- Layouts, spacing, or component structure
- Typography, font sizes, or text hierarchy
- Component shapes, borders, or shadows
- Navigation structure or information architecture
- Any functional elements or interactions

**ONLY change:**
- Color values throughout the design system
- Background colors, text colors, border colors
- Button colors, link colors, accent colors
- Chart colors and data visualization colors
- Icon colors and status indicators
- Hover states and interactive element colors

## Section-Specific Color Assignments

- **Members Section:** Use Chart 1 (Medium Blue) for highlights, icons, and accents
- **Projects Section:** Use Chart 2 (Vibrant Green) for highlights, icons, and accents
- **Publications Section:** Use Chart 3 (Warm Tan) for highlights, icons, and accents
- **Grants Section:** Use Chart 4 (Coral Red) for highlights, icons, and accents
- **Equipment Section:** Use Chart 5 (Light Gray) for highlights, icons, and accents

## Technical Requirements

**Output Format:** Generate CSS custom properties and Tailwind configuration updates that can be directly applied to the existing codebase
**Maintain Compatibility:** Ensure all colors work with both light and dark themes
**Accessibility:** Verify color contrast ratios meet WCAG standards
**Current Design System:** Keep using shadcn/ui components with updated color variables

## Deliverables

1. **Updated CSS custom properties** for the color palette (both light and dark themes)
2. **Tailwind configuration updates** to integrate the new colors
3. **Component color mapping** showing which colors to use for each UI element
4. **Theme implementation** that maintains the existing design while applying new colors
5. **CSS code snippets** that can be directly copied into the existing `globals.css` file

## Focus Areas

- **Preserve Current Design:** Maintain exact same layouts, spacing, and component structure
- **Color Consistency:** Apply the palette systematically across all sections and components
- **Theme Compatibility:** Ensure colors work well in both light and dark modes
- **Visual Hierarchy:** Maintain readability and contrast with the new color scheme
- **Brand Integration:** Create a cohesive look using the established color palette

---

**Additional Context:** The current design is already functional and well-structured. We just want to apply the new color palette to give it a fresh, professional appearance while keeping everything else exactly the same.

