# Oiptyy Prospect Researcher

AI-powered B2B prospect research tool. Upload a CSV of companies, Claude researches each one using web search, and results sync directly to your GoHighLevel pipeline as Contacts + Opportunities.

---

## What it does

- Upload a CSV with `company_name` and `email` columns
- Claude (with live web search) researches each company:
  - Industry & company size
  - Pain points / challenges
  - Likely tech stack
  - Recent news & funding
  - Personalized Oiptyy email angle
- Push researched prospects to GHL as:
  - **Contact** (name derived from email, tagged `oiptyy-prospect`)
  - **Opportunity** in your chosen pipeline at the "New Lead" stage
- Export all findings as CSV

---

## Deploy to Netlify (5 minutes)

### 1. Push to GitHub

```bash
cd oiptyy-researcher
git init
git add .
git commit -m "initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/oiptyy-researcher.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Select your GitHub repo
3. Build settings (auto-detected from `vite.config.js`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**

### 3. Add environment variables

In Netlify → Site → **Environment variables**, add:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (get from console.anthropic.com) |

Then **trigger a redeploy** (Deploys → Trigger deploy).

### 4. Configure GHL in the app

1. Open your deployed app
2. Go to **Settings**
3. Enter your GHL Private Integration API key and Location ID
4. Click **Load Pipelines**, select your pipeline and "New Lead" stage
5. Click **Save settings**

Settings are saved in your browser's local storage — each team member sets this up once on their machine.

---

## Getting your GHL API key

1. In GoHighLevel, go to **Settings → Integrations → Private Integrations**
2. Create a new integration with these scopes:
   - `contacts.write`
   - `contacts.read`
   - `opportunities.write`
   - `opportunities.read`
3. Copy the API key

## Getting your GHL Location ID

Go to **Settings → Business Info** — the Location ID is in the URL:
`https://app.gohighlevel.com/location/YOUR_LOCATION_ID/...`

---

## Local development

```bash
npm install
npm run dev
```

Note: The Netlify edge functions (`/api/claude` and `/api/ghl`) only run on Netlify. For local dev, the Claude API calls will fail unless you run `netlify dev` with the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

---

## CSV format

```csv
company_name,email
Acme Corp,contact@acme.com
Globex Inc,hello@globex.com
```

Column names are flexible — the app detects any column containing "company"/"name" and "email".
