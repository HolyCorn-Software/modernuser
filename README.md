This piece of code is a component of HolyCorn Software's projects, in charge of managing user authentication

The following widgets are supposed to be provided by the project from which modernuser is being used in.
    onboarding/public/widgets/borrowed/standard-page
    public/widgets/borrowed/navbar
    public/widgets/borrowed/footer
It's preferrable folders be mounted into these paths, instead of copying things. When it's time to make an update to modernuser itself, these folders should be unmounted

When configuring system strings especially via the engTerminal faculty, set the value of the following strings:
    1) modernuser_authentication_login_help :: A string to be displayed on the login page to guide users about logging in

modernuser requires the faculty uniqueFileUpload, to deal with uploading user profile photos