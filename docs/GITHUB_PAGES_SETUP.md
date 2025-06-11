# GitHub Pages Setup Instructions

## Enable GitHub Pages for Documentation

To make the documentation available online at `https://omrip500.github.io/NotificationsSDK/`:

### 1. Repository Settings
1. Go to your GitHub repository: `https://github.com/omrip500/NotificationsSDK`
2. Click on **"Settings"** tab
3. Scroll down to **"Pages"** section in the left sidebar

### 2. Configure Pages
1. Under **"Source"**, select **"Deploy from a branch"**
2. Choose **"main"** branch
3. Choose **"/docs"** folder
4. Click **"Save"**

### 3. Verify Setup
1. GitHub will show a message: "Your site is ready to be published at https://omrip500.github.io/NotificationsSDK/"
2. It may take a few minutes to deploy
3. Visit the URL to see your documentation

### 4. Custom Domain (Optional)
If you want to use a custom domain:
1. Add a `CNAME` file in the docs folder with your domain
2. Configure DNS settings for your domain
3. Update the custom domain in repository settings

## Files Created for GitHub Pages

- `docs/index.html` - Main documentation homepage
- `docs/_config.yml` - Jekyll configuration
- `docs/*.md` - All documentation files
- `docs/README.md` - Documentation index

## Accessing Documentation

Once enabled, documentation will be available at:
- **Main Site**: https://omrip500.github.io/NotificationsSDK/
- **Quick Start**: https://omrip500.github.io/NotificationsSDK/quick-start
- **Setup Guide**: https://omrip500.github.io/NotificationsSDK/setup-guide
- **API Reference**: https://omrip500.github.io/NotificationsSDK/api-reference

## Updating Documentation

To update the documentation:
1. Edit files in the `docs/` folder
2. Commit and push changes to the main branch
3. GitHub Pages will automatically rebuild and deploy

The documentation is now ready for GitHub Pages deployment!
