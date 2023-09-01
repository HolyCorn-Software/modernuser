/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module allows code components to semantically access plugins of the system
 */




/**
 * @type {import("system/lib/libFaculty/plugin/manager.mjs").default<modernuser.plugins.PluginMap>}
 */
const modernuserPlugins = FacultyPlatform.get().pluginManager

export default modernuserPlugins