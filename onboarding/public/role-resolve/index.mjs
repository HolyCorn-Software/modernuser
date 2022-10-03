/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This script is on the test page of the role module.
 */

import RoleResolve from "../widgets/role-resolve/widget.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import StandardPage from "../widgets/borrowed/standard-page/widget.mjs";

const standard_page = new StandardPage()



document.body.appendChild(
    standard_page.html
)

const resolve_widget = new RoleResolve()

standard_page.content.push(
    resolve_widget.html
)

const id = new URLSearchParams(window.location.search).get('id')


try {
    if (!id) {
        throw new Error(`Sorry, you might have clicked the wrong link`)
    }
    await resolve_widget.loadDataByRequestId(id)
} catch (e) {
    handle(e)

}


