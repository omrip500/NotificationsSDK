# JitPack Release Notes - v1.2.0

## 🚀 Version 1.2.0 Release

### Major Changes
- **Production API Endpoint**: Updated base URL to `https://api.notificationspanel.com`
- **Documentation Cleanup**: Removed AAR references, location-based features, and updated all examples
- **Consistent Branding**: Updated all support emails and URLs to production domains

### Breaking Changes
- **API Base URL**: Changed from development to production endpoint
- **Dependencies**: Must update to v1.2.0 for production compatibility

### Migration Required
Update your `build.gradle.kts`:
```kotlin
dependencies {
    implementation("com.github.omrip500:NotificationsSDK:v1.2.0")
    // ... other dependencies
}
```

### Release Checklist
- [x] Updated ApiClient.java base URL
- [x] Updated all documentation files
- [x] Removed AAR references
- [x] Removed location-based notification references
- [x] Updated App ID examples to generic placeholders
- [x] Updated support email addresses
- [x] Updated CHANGELOG.md
- [x] **DONE: Push new tag v1.2.0 to GitHub for JitPack**
- [⏳] **IN PROGRESS: Verify JitPack build success** (JitPack is processing the new tag)
- [x] **DONE: Test integration setup created**

### Completed Steps
1. ✅ **Created Git Tag**: `git tag v1.2.0 && git push origin v1.2.0`
2. ⏳ **JitPack Processing**: https://jitpack.io/#omrip500/NotificationsSDK/v1.2.0 (building...)
3. ✅ **Test Integration**: Created test project structure
4. ✅ **Documentation**: All links and references updated

### Status Update
- **Git Repository**: ✅ Tag v1.2.0 successfully pushed to GitHub
- **JitPack Build**: ⏳ Processing (may take 5-10 minutes for first build)
- **Documentation**: ✅ All files updated to v1.2.0
- **API Endpoint**: ✅ Production URL configured

### Files Updated
- ApiClient.java (base URL)
- All documentation files (*.md)
- HTML documentation files
- CHANGELOG.md
- Version badges and references

### Production Readiness
✅ API endpoint points to production server
✅ Documentation reflects production setup
✅ No development/testing references remain
✅ Consistent version numbering across all files
