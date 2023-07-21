/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System 
 * The Modern Faculty of Users
 * 
 * This widget allows a qualified user to manage the zones
 */

import ZonationManager from '/$/modernuser/zonation/static/widgets/zonation-manager/widget.mjs';




/**
 * @deprecated use /$/modernuser/zonation/static/widgets/zonation-manager/widget.mjs
 */
export default class _ZonationManager extends ZonationManager {

    constructor() {
        super(...arguments)
        console.trace(`This widget has been moved to /$/modernuser/zonation/static/widgets/zonation-manager/widget.mjs`)
    }

}