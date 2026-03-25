const fs = require("fs")
const path = require("path")

const pluginFolder = path.join(__dirname, "plugins")

const plugins = new Map()

function loadPlugins(dir) {
  const files = fs.readdirSync(dir)

  for (let file of files) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)

    if (stat.isDirectory()) {
      loadPlugins(full)
      continue
    }

    if (!file.endsWith(".js")) continue

    try {
      delete require.cache[require.resolve(full)]
      const plugin = require(full)

      plugins.set(full, plugin)

      console.log("Loaded plugin:", file)

    } catch (err) {
      console.log("Plugin load error:", file, err)
    }
  }
}

loadPlugins(pluginFolder)

module.exports = {
  plugins,
  pluginFolder
}