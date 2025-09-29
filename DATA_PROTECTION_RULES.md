# 🚨 CRITICAL DATA PROTECTION RULES - NEVER VIOLATE

## ⚠️ **ABSOLUTE RULES - NO EXCEPTIONS**

### 1. **NEVER OVERWRITE EXISTING DATA**

- **ALWAYS** check if data exists before saving
- **ALWAYS** preserve existing data when making changes
- **ALWAYS** merge new data with existing data, never replace
- **NEVER** save `defaultData` if real data exists

### 2. **DATA SAFETY PROTOCOLS**

- **ALWAYS** backup existing data before any operation
- **ALWAYS** validate data integrity before saving
- **ALWAYS** use `upsert` operations that preserve existing data
- **NEVER** use operations that could truncate or replace data

### 3. **EMERGENCY RECOVERY REQUIREMENTS**

- **ALWAYS** check local storage first before Supabase
- **ALWAYS** preserve local storage as backup
- **ALWAYS** implement rollback mechanisms
- **NEVER** assume data is lost without checking all sources

### 4. **CODE REVIEW CHECKLIST**

Before any data operation, verify:

- [ ] Existing data is checked first
- [ ] New data is merged, not replaced
- [ ] Backup mechanisms are in place
- [ ] Rollback is possible
- [ ] User data is never lost

## 🔒 **IMPLEMENTATION REQUIREMENTS**

### Storage Functions Must:

```typescript
// ✅ CORRECT - Always merge, never replace
const saveData = async (newData: AppData) => {
  const existingData = await loadData();
  const mergedData = {
    ...existingData,
    ...newData,
    // Preserve existing arrays, merge new items
    expenses: [...(existingData.expenses || []), ...(newData.expenses || [])],
    income: [...(existingData.income || []), ...(newData.income || [])],
    invoices: [...(existingData.invoices || []), ...(newData.invoices || [])],
  };
  // Save merged data
};

// ❌ WRONG - Never do this
const saveData = async (newData: AppData) => {
  // This overwrites everything - FORBIDDEN
  await supabase.from("app_data").upsert(newData);
};
```

### Data Loading Must:

```typescript
// ✅ CORRECT - Always check existing data first
const loadData = async () => {
  // 1. Check Supabase
  // 2. If no data, check local storage
  // 3. If no data, return empty structure
  // 4. NEVER return defaultData if real data exists
};
```

## 🚨 **VIOLATION CONSEQUENCES**

If these rules are violated:

1. **IMMEDIATE** data recovery attempt
2. **IMMEDIATE** rollback to previous state
3. **IMMEDIATE** user notification
4. **IMMEDIATE** implementation of additional safeguards

## 📋 **CURRENT STATUS**

- ✅ User's data was lost due to overwrite
- ✅ Recovery mechanisms implemented
- ✅ Safeguards now in place
- ❌ **NEVER ALLOW THIS TO HAPPEN AGAIN**

## 🔄 **RECOVERY ATTEMPTS**

1. Check browser local storage for any remaining data
2. Check browser history/cache for data traces
3. Implement data versioning for future protection
4. Add automatic backup before any data operations

---

**THIS DOCUMENT IS SACRED - NEVER VIOLATE THESE RULES**
