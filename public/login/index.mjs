/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * A patient comes to this page to consult
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import LoginPage from "../widgets/login-page/widget.mjs";

let widget = new LoginPage();

// widget.main.sections.main.caption = 'Login'
// widget.main.sections.main.positiveButton.content = `Login`


document.body.appendChild(
    widget.html
);