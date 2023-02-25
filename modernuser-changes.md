.

Added ability to check if a user is permitted, without the user's id. This check is done by checking is a single permission qualifies amongst a list of permissions.

Switched from a system based on providers, to one that's based on plugins

Added ability to manage plugins from the backend_dashboard

Removed unnecessary imports to take advantage of new platform globals

Added inline-login widget to allow other components to create views that require logging in, more easily