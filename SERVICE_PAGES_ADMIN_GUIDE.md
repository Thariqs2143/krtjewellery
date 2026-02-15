# Service Pages Admin Management System

This document covers the real-time editable service pages system implemented for KRT Jewels.

## Overview

You now have a complete system to manage three service pages through the admin panel:
- 15-Day Returns & Exchanges
- Resize & Repair Services  
- Lifetime Exchange & Buyback

All content is stored in the database and can be updated in real-time without code changes.

## Database Setup

### Migration

The migration file `20260214_service_pages.sql` creates:
- `service_pages` table with columns for slug, title, subtitle, hero description, and JSON content
- RLS policies (public read, admin update)
- Automatic `updated_at` timestamp trigger
- Default data for all three service pages

### To Deploy the Migration

**Option 1: Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy the contents of `supabase/migrations/20260214_service_pages.sql`
3. Paste and execute in SQL Editor
4. Migration is now live

**Option 2: Supabase CLI**
```bash
supabase db push
```

## Admin Features

### Accessing Service Pages Admin

1. **URL**: `/admin/service-pages`
2. **Menu**: "Service Pages" in Admin Sidebar (FileText icon)
3. **Requirements**: Must be logged in as admin user

### Admin Panel Features

#### For Each Service Page:

1. **Basic Information Tab**
   - Page Title: Main heading (e.g., "15-Day Returns & Exchanges")
   - Page Subtitle: Hero badge text (e.g., "Peace of Mind")
   - Hero Badge Text: Small label (appears uppercase)
   - Hero Description: Paragraph text for hero section

2. **Content Structure (JSON Editor)**
   - Full JSON editing capability
   - Real-time validation
   - Organize content hierarchically:
     - Features/sections
     - Process steps
     - Service offerings
     - Terms and conditions

3. **Metadata Display**
   - Created timestamp
   - Last updated timestamp
   - Auto-generated on changes

### Content Structure

#### Returns Exchange Page
```json
{
  "features": [
    { "icon": "clock", "title": "15 Days", "description": "..." },
    { "icon": "package", "title": "Free Shipping", "description": "..." },
    { "icon": "shield", "title": "No Questions", "description": "..." }
  ],
  "process": [
    { "step": 1, "title": "Initiate Return", "desc": "..." },
    { "step": 2, "title": "Schedule Pickup", "desc": "..." },
    { "step": 3, "title": "Inspection", "desc": "..." },
    { "step": 4, "title": "Refund/Exchange", "desc": "..." }
  ],
  "eligible": ["Within 15 days...", "Original packaging...", ...],
  "notEligible": ["Beyond 15 days...", "Signs of wear...", ...]
}
```

#### Resize Repair Page
```json
{
  "services": [
    {
      "icon": "wrench",
      "title": "Ring Resizing",
      "description": "...",
      "features": ["Size adjustments...", "Expert craftsmen...", ...],
      "price": "Starting ₹500"
    },
    {
      "icon": "zap",
      "title": "General Repair",
      "description": "...",
      "features": ["Prong resetting...", "Stone replacement...", ...],
      "price": "Starting ₹1,000"
    }
  ],
  "process": [
    { "step": 1, "title": "Assessment", "desc": "..." },
    { "step": 2, "title": "Approval", "desc": "..." },
    { "step": 3, "title": "Execution", "desc": "..." },
    { "step": 4, "title": "Quality Check", "desc": "..." }
  ],
  "repairTypes": ["Ring Resizing", "Prong Resetting", ...]
}
```

#### Lifetime Exchange Page
```json
{
  "exchange": {
    "icon": "gift",
    "title": "Lifetime Exchange",
    "description": "...",
    "features": ["Exchange anytime...", "100% gold value...", ...]
  },
  "buyback": {
    "icon": "trending-up",
    "title": "Buyback Program",
    "description": "...",
    "features": ["Best rates...", "Instant appraisal...", ...]
  },
  "why": [
    { "icon": "award", "title": "30+ Years Trust", "desc": "..." },
    { "icon": "shield", "title": "BIS Hallmarked", "desc": "..." },
    { "icon": "trending-up", "title": "Live Gold Rates", "desc": "..." }
  ],
  "exchangeProcess": [
    { "step": 1, "title": "Bring Item", "desc": "..." },
    ...
  ],
  "buybackProcess": [
    { "step": 1, "title": "Appraisal", "desc": "..." },
    ...
  ]
}
```

## Frontend Implementation

### Service Page Components

All three pages fetch content from the database:
- `/src/pages/ReturnsExchange.tsx`
- `/src/pages/ResizeRepair.tsx`
- `/src/pages/LifetimeExchange.tsx`

Each page:
- Loads content from `service_pages` table
- Displays a loader while fetching
- Uses the admin-configured title, badges, and descriptions
- Renders content dynamically from JSON

### Real-Time Updates

Changes made in the admin panel are reflected on the public pages in real-time via:
- React Query automatic invalidation
- Supabase real-time subscriptions (in hooks)
- No page reload required

### Custom Hook

Optional: Use the provided hook for cleaner code:

```typescript
import { useServicePage } from '@/hooks/useServicePages';

export default function MyComponent() {
  const { data: page, isLoading } = useServicePage('returns-exchange');
  
  // Use page.page_title, page.content, etc.
}
```

## Icon Mapping

The JSON uses string icons that map to React components:

| Icon String | Component | Use |
|-------------|-----------|-----|
| `clock` | Clock | Time-related features |
| `package` | Package | Shipping/delivery |
| `shield` | Shield | Security/safety |
| `wrench` | Wrench | Repair services |
| `zap` | Zap | Quick/efficient services |
| `gift` | Gift | Exchange programs |
| `trending-up` | TrendingUp | Growth/buyback |
| `award` | Award | Trust/reputation |

Add more icons by updating the component mapping in the service pages.

## Editing Workflow

### Daily Updates

1. Go to Admin → Service Pages
2. Select page from tabs (Returns, Repair, Lifetime)
3. Edit desired fields
4. Click "Save Changes"
5. Changes appear on public site instantly

### Common Edits

**Change prices:**
Edit the `price` field in services JSON

**Update process steps:**
Modify the `process` array with new step descriptions

**Add new features:**
Add objects to `features` or `eligible` arrays

**Update eligibility rules:**
Modify `eligible` and `notEligible` arrays

## Database Queries

### View all service pages
```sql
SELECT * FROM service_pages;
```

### Update specific page
```sql
UPDATE service_pages 
SET page_title = 'New Title', content = '...'
WHERE page_slug = 'returns-exchange';
```

### Reset to defaults
```sql
DELETE FROM service_pages;
-- Then re-run the INSERT statements from migration
```

## Troubleshooting

### Changes not showing up
1. Clear browser cache
2. Check Save button showed success message
3. Verify you're logged in as admin
4. Check browser console for errors

### JSON validation errors
- Ensure all quotes are proper JSON format
- Arrays use `[]`, objects use `{}`
- Commas between items (no trailing comma)
- Use JSON formatter: https://jsonlint.com

### Missing icons
Add icon mapping in service page JSX:
```tsx
{feature.icon === 'your-icon' && <YourIcon ... />}
```

## Security

- Service pages are publicly readable
- Only admins can update (RLS policy enforced)
- All updates trigger automatic `updated_at` timestamp
- Edit history not tracked (can be added later)

## Future Enhancements

Consider adding:
- Edit history/version control
- Preview mode before publishing
- Markdown support for rich text
- Bulk import/export
- A/B testing variants
- Translation support for multi-language
