# ProClip Organization Chart

An interactive organizational chart application for Microsoft Teams, optimized for small to medium organizations (up to 100 employees).

## Features

- 📊 Interactive tree visualization of your organization
- 🔍 Real-time search by name, title, or department
- 👤 Detailed person profiles with contact information
- 💬 Direct Teams chat and call integration
- 📱 Mobile responsive design
- 🌓 Dark mode support (auto-detects Teams theme)
- ⚡ Fast performance with all data loaded upfront

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Fluent UI React v9
- **Visualization**: React Flow
- **State Management**: Zustand
- **Authentication**: Microsoft Teams SSO
- **API**: Microsoft Graph API

## Prerequisites

- Node.js 18+
- npm or yarn
- Microsoft 365 tenant with admin access
- Azure AD app registration

## Setup Instructions

### 1. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Configure:
   - **Name**: ProClip OrgChart
   - **Supported account types**: Single tenant
   - **Redirect URI**: Leave blank for now
4. Click **Register**
5. Note down the **Application (client) ID** and **Directory (tenant) ID**

### 2. Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**
3. Add these permissions:
   - `User.Read` (Read signed-in user's profile)
   - `User.ReadBasic.All` (Read all users' basic profiles)
   - `User.Read.All` (Read all users' full profiles) - *Optional for more details*
4. Click **Grant admin consent** for your organization

### 3. Configure Authentication

1. Go to **Authentication** in your app registration
2. Click **Add a platform** > **Single-page application**
3. Add these redirect URIs:
   - `http://localhost:3000/auth-start.html`
   - `https://your-domain.com/auth-start.html` (for production)
4. Under **Implicit grant and hybrid flows**, enable:
   - ✅ Access tokens
   - ✅ ID tokens
5. Save changes

### 4. Expose an API

1. Go to **Expose an API**
2. Click **Add** next to Application ID URI
3. Accept the default: `api://your-domain.com/{client-id}`
4. Click **Add a scope**:
   - **Scope name**: `access_as_user`
   - **Who can consent**: Admins and users
   - **Display name**: Access the app as the user
   - **Description**: Allows the app to access data as the signed-in user
5. Under **Authorized client applications**, add:
   - `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams mobile/desktop)
   - `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web)

### 5. Install Dependencies

```bash
npm install
```

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your values:
```env
VITE_CLIENT_ID=your-application-client-id
VITE_TENANT_ID=your-tenant-id
```

### 7. Update Teams Manifest

1. Edit `manifest.json`:
   - Replace `your-app-id-here` with a unique GUID
   - Replace `your-domain.com` with your actual domain (or ngrok URL for testing)
   - Replace `your-azure-app-client-id` with your Client ID
2. Add app icons to the root directory:
   - `icon-color.png` (192x192px)
   - `icon-outline.png` (32x32px, transparent)

## Development

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Test in Teams

For local testing with Teams, you'll need to use a tunneling service like ngrok:

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update your Azure AD app redirect URIs with the ngrok URL
6. Update `manifest.json` with the ngrok URL
7. Zip the manifest and icons: `zip app.zip manifest.json icon-color.png icon-outline.png`
8. In Teams:
   - Go to **Apps** > **Manage your apps** > **Upload an app**
   - Upload `app.zip`
   - Add the app

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Option 1: Azure Static Web Apps (Recommended)

1. Create a Static Web App in Azure Portal
2. Connect to your GitHub repository
3. Configure build:
   - **App location**: `/`
   - **API location**: (leave empty)
   - **Output location**: `dist`
4. Add environment variables in Configuration
5. Deploy

### Option 2: Any Static Host

Deploy the `dist` folder to:
- Netlify
- Vercel
- GitHub Pages
- Azure Blob Storage with CDN

**Important**: Update your Azure AD app and Teams manifest with your production domain.

## Project Structure

```
proclip-org-chart/
├── src/
│   ├── components/         # React components
│   │   ├── OrgChart.tsx
│   │   ├── TreeView.tsx
│   │   ├── UserCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── PersonDetailPanel.tsx
│   ├── services/          # API services
│   │   ├── auth.ts        # Authentication
│   │   └── graph.ts       # Microsoft Graph
│   ├── types.ts           # TypeScript types
│   ├── store.ts           # Zustand state management
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/
│   └── auth-start.html    # SSO auth page
├── manifest.json          # Teams app manifest
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Features Implemented

- ✅ Teams SSO authentication
- ✅ Microsoft Graph API integration
- ✅ Interactive org chart with React Flow
- ✅ User cards with profile photos
- ✅ Search functionality
- ✅ Person detail panel
- ✅ Teams chat/call integration
- ✅ Dark mode support
- ✅ Mobile responsive

## Troubleshooting

### Authentication Fails

- Verify Azure AD permissions are granted
- Check Client ID and Tenant ID in `.env`
- Ensure redirect URIs match exactly
- Try clearing browser cache and Teams cache

### Graph API Errors

- Verify admin consent was granted for permissions
- Check that users exist in Azure AD
- Ensure the signed-in user has permission to read other users

### App Doesn't Load in Teams

- Verify manifest.json is valid (use [Teams App Validator](https://dev.teams.microsoft.com/appvalidation.html))
- Check that your domain is in validDomains
- Ensure HTTPS is used (not HTTP) for production

### Photos Not Loading

- Photos might not exist for all users
- Check Graph API permission includes User.Read.All
- Verify network access to Graph API

## Performance Optimization

For organizations with 45 employees:
- All users loaded at once (no pagination needed)
- Client-side search (fast enough for this size)
- Photos lazy-loaded on demand
- Tree layout calculated once on load

## Future Enhancements

- [ ] Export org chart as PDF/PNG
- [ ] Manager/direct reports relationships displayed
- [ ] List view for mobile
- [ ] Breadcrumb navigation (path to CEO)
- [ ] Favorites/bookmarks
- [ ] Department filtering
- [ ] Print-friendly view
- [ ] Org metrics dashboard

## Support

For issues or questions:
- Check the [Microsoft Teams Developer Docs](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- Review [Microsoft Graph API Docs](https://docs.microsoft.com/en-us/graph/)
- Contact your IT administrator

## License

Proprietary - ProClip Internal Use Only
