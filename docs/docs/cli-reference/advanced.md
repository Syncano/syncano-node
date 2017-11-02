## Environment variables

With Continuous Integration process it is easier to configure a project and get access to your Syncano Instance using environment variables. Setting these variables you can override settings from `~/syncano.yml` file and default Syncano API hostname:

CLI is checking those variables:
- `SYNCANO_HOST` - API host (default api.syncano.io)
- `SYNCANO_PROJECT_INSTANCE` - Syncano instance for a project
- `SYNCANO_AUTH_KEY` - Account API Key (you can find it in dashboard or by logging in using API)
