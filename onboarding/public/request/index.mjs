/**
 * The CAYOFE People System
 * This script is on the onboarding page
 */

import CAYOFEDOnboarding from "../widgets/onboarding/widget.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import Footer from "/$/web/html/widgets/footer/widget.mjs";
import Navbar from "/$/web/html/widgets/navbar/widget.mjs";



//Check if the user is logged in. If not redirect him to the login page
const check_login = async () => {
    try {
        await muserRpc.modernuser.authentication.whoami(true)
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