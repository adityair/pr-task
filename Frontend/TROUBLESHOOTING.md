# Troubleshooting Frontend Purchase Request System

## Error yang Sering Ditemui dan Solusinya

### 1. Environment Variable Error

**Error:** `process.env.REACT_APP_API_URL is undefined`

**Solusi:**

1. Buat file `.env` di root folder Frontend:

```bash
REACT_APP_API_URL=http://localhost:5000/
```

2. Restart development server:

```bash
npm start
```

### 2. ESLint Warnings

**Warning:** `React Hook useEffect has missing dependencies`

**Solusi:**

- Gunakan `useCallback` untuk function yang dipanggil di useEffect
- Atau tambahkan `// eslint-disable-next-line react-hooks/exhaustive-deps` jika memang tidak perlu dependency

**Contoh perbaikan:**

```javascript
const fetchData = useCallback(async () => {
  // fetch logic
}, [dependency]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 3. Import Error

**Error:** `Cannot resolve module`

**Solusi:**

1. Pastikan file yang diimport ada
2. Periksa path import (relative path)
3. Install dependency yang diperlukan:

```bash
npm install
```

### 4. API Connection Error

**Error:** `Failed to fetch` atau `Network Error`

**Solusi:**

1. Pastikan backend server berjalan di port 5000
2. Periksa CORS configuration di backend
3. Periksa environment variable `REACT_APP_API_URL`
4. Periksa koneksi internet

### 5. Authentication Error

**Error:** `401 Unauthorized` atau `Token expired`

**Solusi:**

1. Clear localStorage:

```javascript
localStorage.clear();
```

2. Login ulang
3. Periksa token di localStorage:

```javascript
console.log(localStorage.getItem("token"));
```

### 6. Component Not Rendering

**Error:** Component tidak muncul atau blank page

**Solusi:**

1. Periksa console browser untuk error
2. Periksa React DevTools
3. Pastikan component diimport dengan benar
4. Periksa routing di App.js

### 7. Modal Not Working

**Error:** Modal tidak muncul atau tidak bisa ditutup

**Solusi:**

1. Periksa state `isVisible`
2. Periksa function `onClose`
3. Pastikan CSS Bulma sudah diimport
4. Periksa z-index modal

### 8. Table Not Loading

**Error:** Data tidak muncul di tabel

**Solusi:**

1. Periksa API response
2. Periksa loading state
3. Periksa error handling
4. Periksa data structure

### 9. Redux State Error

**Error:** `Cannot read property of undefined`

**Solusi:**

1. Periksa Redux DevTools
2. Pastikan initial state sudah benar
3. Periksa action dan reducer
4. Pastikan Provider sudah membungkus App

### 10. Build Error

**Error:** `npm run build` gagal

**Solusi:**

1. Periksa semua import
2. Periksa environment variables
3. Periksa syntax error
4. Clear cache:

```bash
npm run build -- --reset-cache
```

## Common Fixes

### 1. Clear Cache dan Reinstall Dependencies

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### 2. Reset Development Server

```bash
# Stop server (Ctrl+C)
# Clear terminal
# Restart server
npm start
```

### 3. Check Environment Variables

```bash
# Di terminal
echo $REACT_APP_API_URL

# Atau di browser console
console.log(process.env.REACT_APP_API_URL);
```

### 4. Debug Redux State

```javascript
// Di component
console.log(
  "Redux State:",
  useSelector((state) => state)
);

// Di action
console.log("Action Payload:", action.payload);
```

### 5. Debug API Calls

```javascript
// Di axios interceptor
console.log("API Request:", config);
console.log("API Response:", response);
console.log("API Error:", error);
```

## Performance Issues

### 1. Slow Loading

**Solusi:**

- Implement lazy loading untuk komponen besar
- Optimize images
- Use React.memo untuk component yang tidak perlu re-render
- Implement pagination untuk data besar

### 2. Memory Leaks

**Solusi:**

- Cleanup useEffect dengan return function
- Cancel axios requests yang tidak perlu
- Clear intervals dan timeouts

### 3. Bundle Size

**Solusi:**

- Code splitting dengan React.lazy
- Tree shaking untuk unused imports
- Optimize dependencies

## Browser Compatibility

### 1. Internet Explorer

**Error:** Syntax error atau polyfill missing

**Solusi:**

- Tambahkan polyfills
- Gunakan Babel untuk transpile
- Consider dropping IE support

### 2. Mobile Browsers

**Error:** Touch events atau responsive issues

**Solusi:**

- Test di berbagai device
- Implement touch-friendly UI
- Use CSS media queries

## Development Tools

### 1. React DevTools

Install React DevTools extension untuk debugging:

- Chrome: React Developer Tools
- Firefox: React Developer Tools

### 2. Redux DevTools

Install Redux DevTools extension untuk debugging state:

- Chrome: Redux DevTools
- Firefox: Redux DevTools

### 3. Network Tab

Gunakan Network tab di browser untuk:

- Monitor API calls
- Check response data
- Debug CORS issues

## Logging dan Monitoring

### 1. Console Logging

```javascript
// Debug logging
console.log("Debug:", data);
console.error("Error:", error);
console.warn("Warning:", warning);
```

### 2. Error Boundary

Implement error boundary untuk catch error:

```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }
}
```

### 3. Performance Monitoring

```javascript
// Measure component render time
console.time("Component Render");
// component logic
console.timeEnd("Component Render");
```

## Best Practices

### 1. Error Handling

- Always handle async operations with try-catch
- Show user-friendly error messages
- Log errors for debugging
- Implement fallback UI

### 2. Loading States

- Show loading indicators
- Disable buttons during operations
- Provide feedback to users
- Handle edge cases

### 3. Data Validation

- Validate data before sending to API
- Handle empty states
- Show appropriate messages
- Implement form validation

### 4. Security

- Sanitize user input
- Validate tokens
- Implement proper authentication
- Use HTTPS in production

## Getting Help

### 1. Check Documentation

- React documentation
- Redux documentation
- Bulma CSS documentation
- Axios documentation

### 2. Search Issues

- GitHub issues
- Stack Overflow
- React community forums

### 3. Debug Step by Step

1. Identify the problem
2. Check console errors
3. Verify data flow
4. Test individual components
5. Check API responses
6. Verify environment setup

### 4. Create Minimal Reproduction

- Create simple test case
- Remove unnecessary code
- Test in isolation
- Share code snippet

## Emergency Fixes

### 1. Quick Reset

```bash
# Stop all processes
# Clear browser cache
# Restart development server
npm start
```

### 2. Fallback to Working Version

```bash
# Git reset to last working commit
git reset --hard HEAD~1
# Or checkout specific commit
git checkout <commit-hash>
```

### 3. Manual Fix

- Comment out problematic code
- Use placeholder data
- Implement basic functionality first
- Add features incrementally
