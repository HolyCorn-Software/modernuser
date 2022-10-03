/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * The Modern Faculty of Users
 * This module better access to publicly available methods of the faculty
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.js";



/**
 * @type {{
 * modernuser: import("faculty/modernuser/terminals/public.mjs").default
 * }}
 */
let muserRpc = hcRpc

export default muserRpc