# Quick Start Guide

## What You Have

A complete, production-ready Microsoft Teams org chart app optimized for 45 employees with:

- ✅ **React + TypeScript + Vite** - Modern, fast development setup
- ✅ **Fluent UI** - Microsoft's design system for Teams
- ✅ **React Flow** - Interactive org chart visualization
- ✅ **Teams SSO** - Seamless authentication
- ✅ **Graph API** - Real-time employee data
- ✅ **Search** - Find people by name, title, or department
- ✅ **Details Panel** - Contact info and quick actions
- ✅ **Teams Integration** - Click to chat/call directly
- ✅ **Dark Mode** - Auto-detects Teams theme
- ✅ **Mobile Responsive** - Works on all devices

## Next Steps

### 1. Configure Azure AD (15 minutes)

You need to create an Azure AD app registration to enable authentication:

**Create App Registration:**
1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
   - Name: `ProClip OrgChart`
   - Accounts: `Single tenant`
   - Click Register
3. Note the **Client ID** and **Tenant ID**

**Add API Permissions:**
1. Go to "API permissions" → "Add a permission"
2. Microsoft Graph → Delegated permissions
3. Add: `User.Read`, `User.ReadBasic.All`, `User.Read.All`
4. Click "Grant admin consent for [your org]" ✅

**Configure Authentication:**
1. Go to "Authentication" → "Add a platform" → "Single-page application"
2. Add redirect URIs:
   - `http://localhost:3000/auth-start.html`
   - (Later add your production URL)
3. Enable "Access tokens" and "ID tokens"
4. Save

**Expose an API:**
1. Go to "Expose an API" → "Add" (accept default URI)
2. Add a scope:
   - Name: `access_as_user`
   - Who can consent: Admins and users
   - Add display name and description
3. Add authorized client applications:
   - `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams desktop/mobile)
   - `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web)

### 2. Configure Environment (2 minutes)

```bash
# Copy example to .env
cp .env.example .env

# Edit .env and add your IDs
nano .env  # or use any editor
```

Add:
```env
VITE_CLIENT_ID=your-client-id-from-azure
VITE_TENANT_ID=your-tenant-id-from-azure
```

### 3. Run Development Server (1 minute)

```bash
# Install dependencies (already done)
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000

### 4. Test in Teams (with ngrok)

Since Teams requires HTTPS, use ngrok for local testing:

```bash
# Install ngrok
npm install -g ngrok

# In one terminal: run your app
npm run dev

# In another terminal: create tunnel
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

Update Azure AD redirect URIs with your ngrok URL:
- `https://abc123.ngrok.io/auth-start.html`

Update `manifest.json`:
- Replace all `your-domain.com` with `abc123.ngrok.io`
- Replace `your-app-id-here` with a new GUID (generate at guidgenerator.com)
- Replace `your-azure-app-client-id` with your actual Client ID

Create app package:
```bash
# Add icons (or use placeholders)
# icon-color.png (192x192)
# icon-outline.png (32x32 transparent)

# Create zip
zip app.zip manifest.json icon-color.png icon-outline.png
```

Install in Teams:
1. Teams → Apps → Manage your apps → Upload an app
2. Upload `app.zip`
3. Add to your personal tabs

## Project Structure

```
src/
├── components/           # UI components
│   ├── OrgChart.tsx     # Main org chart container
│   ├── TreeView.tsx     # React Flow visualization
│   ├── UserCard.tsx     # Individual employee card
│   ├── SearchBar.tsx    # Search component
│   └── PersonDetailPanel.tsx  # Side panel with details
├── services/            # API services
│   ├── auth.ts         # Teams SSO authentication
│   └── graph.ts        # Microsoft Graph API client
├── types.ts            # TypeScript type definitions
├── store.ts            # Zustand state management
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Features Implemented

### Core Features
- [x] Interactive tree visualization with React Flow
- [x] Automatic layout for org hierarchy
- [x] Zoom and pan controls
- [x] Click to select employees
- [x] Real-time data from Graph API

### Search
- [x] Search by name
- [x] Search by job title
- [x] Search by department
- [x] Search by email
- [x] Real-time filtering

### Person Details
- [x] Profile photo
- [x] Contact information
- [x] Job title and department
- [x] Office location
- [x] Phone numbers
- [x] Email address

### Teams Integration
- [x] Click to start Teams chat
- [x] Click to start Teams call
- [x] Email integration
- [x] Auto-detects current user

### UX
- [x] Dark mode (follows Teams theme)
- [x] Mobile responsive
- [x] Loading states
- [x] Error handling
- [x] Smooth animations

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run type-check       # Check TypeScript
npm run lint             # Run ESLint

# Testing
npm test                 # Run tests (when added)
```

## Troubleshooting

**"Failed to load organization data"**
- Check your Client ID and Tenant ID in `.env`
- Verify admin consent was granted in Azure AD
- Check browser console for specific errors

**"Authentication failed"**
- Verify redirect URIs match exactly in Azure AD
- Check that your app is running on HTTPS (ngrok for local)
- Clear browser cache and try again

**"No users showing"**
- Verify `User.ReadBasic.All` permission is granted
- Check that users exist in Azure AD
- Open browser console and check for Graph API errors

**Photos not loading**
- This is normal if users don't have photos set
- Grant `User.Read.All` permission for better photo access

## What's Next?

### Optional Enhancements
- [ ] Export org chart as PDF
- [ ] Show manager/direct reports relationships
- [ ] List view for mobile
- [ ] Department filtering
- [ ] Breadcrumb navigation (path to CEO)
- [ ] Favorites/bookmarks
- [ ] Print-friendly view

### Deployment
When ready to deploy:
1. Build: `npm run build`
2. Upload `dist/` folder to:
   - Azure Static Web Apps (recommended)
   - Netlify, Vercel, or similar
3. Update Azure AD redirect URIs with production URL
4. Update Teams manifest with production URL
5. Repackage and upload to Teams

## Support

- [Microsoft Teams Docs](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- [Microsoft Graph Docs](https://docs.microsoft.com/en-us/graph/)
- [React Flow Docs](https://reactflow.dev/)
- [Fluent UI Docs](https://react.fluentui.dev/)

---

**Built with ❤️ for ProClip** - Ready to go in ~30 minutes!
