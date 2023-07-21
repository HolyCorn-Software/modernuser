/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows a user to select a zone
 * It could be constrained to show only zones that are a descendant of a given zone
 */

import ZoneInput from "/$/modernuser/zonation/static/widgets/zone-input/widget.mjs";




/**
 * @deprecated
 */
export default class _ZoneInput extends ZoneInput {

    constructor() {
        super(...arguments)
        console.trace(`This widget has been moved to /$/modernuser/zonation/static/widgets/zone-input/widget.mjs`)
    }

}