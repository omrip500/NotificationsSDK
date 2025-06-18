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
- [ ] **TODO: Push new tag v1.2.0 to GitHub for JitPack**
- [ ] **TODO: Verify JitPack build success**
- [ ] **TODO: Test integration with new version**

### Next Steps
1. **Create Git Tag**: `git tag v1.2.0 && git push origin v1.2.0`
2. **Verify JitPack**: Check https://jitpack.io/#omrip500/NotificationsSDK/v1.2.0
3. **Test Integration**: Create test project with new version
4. **Update Documentation**: Verify all links work correctly

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
