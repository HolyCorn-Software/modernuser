/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This script is on the onboarding page
 * Updated 2023, to support customization of 
 */

import hcRpc from '/$/system/static/comm/rpc/aggregate-rpc.mjs';
import { handle } from '/$/system/static/errors/error.mjs'

try {
    const onboardingPageURL = await hcRpc.system.settings.get({ faculty: 'modernuser', name: 'onboardingPage', namespace: 'appearance' })
    if (onboardingPageURL) {
        window.location = `${onboardingPageURL}${window.location.search || '?'}&continue=${new URLSearchParams(window.location.search).get('continue') || new URL(document.referrer).pathname || '/'}`
    } else {
        await main()
    }
} catch (e) {
    handle(e)
}

async function main() {

    const CAYOFEDOnboarding = (await import("../widgets/onboarding/widget.mjs")).default;
    const Footer = (await import("/$/modernuser/static/widgets/borrowed/footer/widget.mjs")).default;
    const Navbar = (await import("/$/modernuser/static/widgets/borrowed/navbar/widget.mjs")).default;
    const hc = (await import("/$/system/static/html-hc/lib/widget/index.mjs")).hc;



    //Check if the user is logged in. If not redirect him to the login page
    const check_login = async () => {
        try {
            await hcRpc.modernuser.authentication.whoami(true)
        } catch (e) {
            if (!/auth/.test(`${e}`)) {
                handle(e)
            } else {
                window.location = '/$/modernuser/static/login/'
            }

        }
    }

    check_login()



    // First add the navbar
    const navbar = new Navbar()

    document.body.appendChild(navbar.html)


    const content = hc.spawn({
        classes: ['page-content']
    })



    document.body.appendChild(content)

    const onboarding = new CAYOFEDOnboarding()

    content.appendChild(onboarding.html)


    const footer = new Footer()
    document.body.appendChild(footer.html)


    hc.importModuleCSS()

}