# 🚀 FlightpulseUK Deployment Guide

## Complete Step-by-Step Instructions for Cloudflare

---

## 📁 Your Project Files

```
flightpulseuk/
├── index.html              ← Main website (all 3 views)
├── functions/
│   └── api/
│       ├── flights.js      ← Live flights endpoint
│       ├── flight.js       ← Single flight details
│       └── airports.js     ← UK airports data
├── worker.js               ← Standalone worker (backup)
├── wrangler.toml           ← Worker configuration
├── README.md               ← Documentation
└── DEPLOYMENT_GUIDE.md     ← This file
```

---

## Part 1: Create GitHub Account

### Step 1.1: Sign Up for GitHub

1. Go to **https://github.com/signup**
2. Enter your email address
3. Create a password
4. Choose a username (e.g., `flightpulseuk`)
5. Solve the puzzle to verify you're human
6. Click **Create account**
7. Check your email and enter the verification code

### Step 1.2: Create a New Repository

1. Once logged in, click the **+** icon in the top-right corner
2. Select **New repository**
3. Fill in the details:
   - **Repository name:** `flightpulseuk`
   - **Description:** `UK Live Flight Tracker`
   - **Visibility:** Public (or Private if you prefer)
   - ✅ Check **"Add a README file"**
4. Click **Create repository**

### Step 1.3: Upload Your Files

1. In your new repository, click **Add file** → **Upload files**
2. Drag and drop ALL your project files:
   - `index.html`
   - `worker.js`
   - `wrangler.toml`
   - `README.md`
   - `DEPLOYMENT_GUIDE.md`
   - Create folders by uploading: `functions/api/flights.js`, etc.
3. Scroll down and add commit message: `Initial commit - FlightpulseUK`
4. Click **Commit changes**

> **💡 Tip for folders:** GitHub web interface can be tricky with folders.
> You can type the full path like `functions/api/flights.js` when creating a new file.

---

## Part 2: Create Cloudflare Account

### Step 2.1: Sign Up

1. Go to **https://dash.cloudflare.com/sign-up**
2. Enter your email and password
3. Click **Create Account**
4. Verify your email

### Step 2.2: Navigate to Pages

1. Log into Cloudflare Dashboard
2. In the left sidebar, click **Workers & Pages**
3. Click **Create application**
4. Select the **Pages** tab

---

## Part 3: Deploy to Cloudflare Pages

### Step 3.1: Connect to GitHub

1. Click **Connect to Git**
2. Click **Connect GitHub**
3. If prompted, log into GitHub
4. Click **Authorize Cloudflare**
5. Choose **Only select repositories**
6. Select `flightpulseuk`
7. Click **Install & Authorize**

### Step 3.2: Configure Your Project

1. Select `flightpulseuk` from the repository list
2. Click **Begin setup**
3. Configure build settings:

| Setting | Value |
|---------|-------|
| **Project name** | `flightpulseuk` |
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Build command** | *(leave empty)* |
| **Build output directory** | `/` |

4. Click **Save and Deploy**

### Step 3.3: Wait for Deployment

1. Cloudflare will build and deploy your site
2. This takes about 1-2 minutes
3. You'll see a success message with your URL

🎉 **Your site is now live at:** `https://flightpulseuk.pages.dev`

---

## Part 4: Test Your API Endpoints

Once deployed, test these URLs in your browser:

| Endpoint | URL |
|----------|-----|
| **Homepage** | `https://flightpulseuk.pages.dev` |
| **Flights API** | `https://flightpulseuk.pages.dev/api/flights` |
| **Flight Details** | `https://flightpulseuk.pages.dev/api/flight?callsign=BA123` |
| **Airports** | `https://flightpulseuk.pages.dev/api/airports` |
| **Search Airports** | `https://flightpulseuk.pages.dev/api/airports?search=london` |

---

## Part 5: Custom Domain (Optional)

### Step 5.1: Add Your Domain to Cloudflare

1. In Cloudflare Dashboard, click **Add a Site**
2. Enter your domain: `flightpulseuk.com`
3. Select **Free** plan and click **Continue**
4. Cloudflare will scan your DNS records
5. Click **Continue**
6. Update your domain's nameservers at your registrar:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
7. Wait for DNS propagation (up to 24 hours, usually faster)

### Step 5.2: Connect Domain to Pages

1. Go to **Workers & Pages** → `flightpulseuk`
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `flightpulseuk.com`
5. Click **Activate domain**
6. Also add: `www.flightpulseuk.com`

---

## Part 6: Environment Variables (Optional)

For enhanced API access, add your API keys:

### Step 6.1: In Cloudflare Dashboard

1. Go to **Workers & Pages** → `flightpulseuk`
2. Click **Settings** tab
3. Click **Environment variables**
4. Click **Add variable**
5. Add your keys:

| Variable Name | Value | Encrypt? |
|---------------|-------|----------|
| `OPENSKY_USERNAME` | your-username | ✅ Yes |
| `OPENSKY_PASSWORD` | your-password | ✅ Yes |
| `AVIATIONSTACK_KEY` | your-api-key | ✅ Yes |

6. Click **Save**

---

## 🔧 Troubleshooting

### "Page not found" error
- Make sure `index.html` is in the root of your repository
- Check build output directory is set to `/`

### API returns errors
- Check the Functions logs in Cloudflare Dashboard
- Go to Workers & Pages → Your project → Functions → Logs

### CORS errors in browser
- The API files already include CORS headers
- Make sure you're accessing the correct URL

### Map not loading
- Check browser console (F12) for errors
- Leaflet CDN might be temporarily slow

### No aircraft showing on map
- OpenSky API has rate limits (1000/day for registered users)
- The app will show mock data as fallback

---

## 📊 API Rate Limits

| Service | Free Limit | Notes |
|---------|------------|-------|
| **Cloudflare Pages** | Unlimited | No limits on page views |
| **Cloudflare Functions** | 100,000/day | More than enough |
| **OpenSky Network** | 1,000/day | Register for higher limits |

---

## 🔄 Making Updates

### To update your site:

1. Go to your GitHub repository
2. Click on the file you want to edit
3. Click the **pencil icon** (Edit)
4. Make your changes
5. Click **Commit changes**
6. Cloudflare automatically redeploys! (takes ~1 minute)

---

## 📱 Testing on Mobile

1. Open your site URL on your phone
2. On iOS: Tap Share → "Add to Home Screen"
3. On Android: Tap menu → "Add to Home Screen"
4. The app will work like a native app!

---

## ✅ Deployment Checklist

- [ ] Created GitHub account
- [ ] Created repository with all files
- [ ] Created Cloudflare account
- [ ] Connected GitHub to Cloudflare Pages
- [ ] Deployed successfully
- [ ] Tested homepage loads
- [ ] Tested /api/flights endpoint
- [ ] Tested /api/airports endpoint
- [ ] (Optional) Added custom domain
- [ ] (Optional) Added API keys

---

## 🆘 Need Help?

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **GitHub Docs:** https://docs.github.com/
- **Leaflet Docs:** https://leafletjs.com/
- **OpenSky API:** https://openskynetwork.github.io/opensky-api/

---

## 🎉 Congratulations!

Your FlightpulseUK live flight tracker is now deployed and running on Cloudflare's global edge network!

**Your URLs:**
- Website: `https://flightpulseuk.pages.dev`
- Flights API: `https://flightpulseuk.pages.dev/api/flights`
- Flight Details: `https://flightpulseuk.pages.dev/api/flight?callsign=BA123`
- Airports: `https://flightpulseuk.pages.dev/api/airports`

Happy tracking! ✈️