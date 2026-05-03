# MBE Order Detail Error Handling

## Overview

The MBE order detail screen now displays appropriate toast notifications when errors occur or when displaying cached data due to MBE API unavailability.

## Implementation

### Modified Files

1. **`features/mbe-orders/use-cases/UpdateMbeOrderUseCase.ts`**
   - Returns error message when falling back to database
   - Error: "Unable to fetch fresh data from MBE API. Displaying cached data from database."

2. **`app/[locale]/b2b/mbe-orders/[id]/_components/MbeOrderDetailClient.tsx`**
   - Detects if error is a cached data warning vs critical error
   - Shows warning toast (yellow) for cached data
   - Shows error toast (red) for critical errors

3. **`messages/en.json` & `messages/fr.json`**
   - Added `mbeApiUnavailable` translation
   - Added `cachedDataWarning` translation

## Toast Behavior

### Scenario 1: MBE API Available (Success)

```
✓ Order fetched from MBE API
✓ Order saved to database
✓ Order displayed
✗ No toast shown
```

### Scenario 2: MBE API Unavailable (Cached Data)

```
✗ MBE API request fails
✓ Order loaded from database
✓ Order displayed
⚠️ Warning toast shown:
   Title: "MBE API Unavailable"
   Description: "Unable to fetch fresh data from MBE API.
                 Displaying cached data from database."
   Duration: 6 seconds
   Color: Yellow/Warning
```

### Scenario 3: Order Not Found Anywhere

```
✗ MBE API request fails
✗ Order not in database
✗ Order not displayed (404)
🔴 Error toast shown:
   Title: "Failed to load order"
   Description: "Order with id XXX not found in MBE API or database."
   Duration: 5 seconds
   Color: Red/Error
```

### Scenario 4: MBE API Returns Empty (Order Deleted)

```
✓ MBE API responds
✗ Order not in response (deleted from MBE)
✓ Order deleted from database
✗ Order not displayed (404)
🔴 Error toast shown:
   Title: "Failed to load order"
   Description: "Order with id XXX not found in MBE API.
                 Order deleted from database."
   Duration: 5 seconds
   Color: Red/Error
```

## Toast Detection Logic

The client component detects the type of error by checking the error message content:

```typescript
const isCachedDataWarning = error.includes('cached data') || error.includes('données en cache')
```

**Warning toast:** Cached data scenarios (yellow)
**Error toast:** All other errors (red)

## User Experience

### Warning Toast (Cached Data)

```
┌─────────────────────────────────────┐
│  ⚠️ MBE API Unavailable             │
│  Unable to fetch fresh data from    │
│  MBE API. Displaying cached data    │
│  from database.                     │
└─────────────────────────────────────┘
```

### Error Toast (Critical)

```
┌─────────────────────────────────────┐
│  🔴 Failed to load order            │
│  Order with id XXX not found in     │
│  MBE API or database.               │
└─────────────────────────────────────┘
```

## Testing

### Test Cached Data Warning

1. Ensure an order exists in the database
2. Temporarily break MBE API (invalid credentials, wrong URL)
3. Navigate to order detail page
4. **Expected:** Yellow warning toast appears, order displays from database

### Test Critical Error

1. Navigate to non-existent order ID
2. **Expected:** Red error toast appears, 404 page shown

### Test Success (No Toast)

1. Ensure MBE API is working
2. Navigate to existing order
3. **Expected:** No toast, order displays normally

## Translations

### English

```json
{
  "mbeApiUnavailable": "MBE API Unavailable",
  "cachedDataWarning": "Unable to fetch fresh data from MBE API. Displaying cached data from database."
}
```

### French

```json
{
  "mbeApiUnavailable": "API MBE indisponible",
  "cachedDataWarning": "Impossible de récupérer les données à jour depuis l'API MBE. Affichage des données en cache depuis la base de données."
}
```

## Related Files

- `features/mbe-orders/use-cases/UpdateMbeOrderUseCase.ts`
- `app/[locale]/b2b/mbe-orders/[id]/_components/MbeOrderDetailClient.tsx`
- `app/[locale]/b2b/mbe-orders/[id]/_components/MbeOrderDetailScreen.tsx`
- `features/mbe-orders/repository/MbeOrdersRepository.ts`
- `messages/en.json`
- `messages/fr.json`
