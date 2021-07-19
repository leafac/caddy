const fs = require("fs/promises");
const path = require("path");
const got = require("got");
const download = require("download");

(async () => {
  const projectRoot = path.resolve(__dirname, "../../../");
  switch (process.argv[2]) {
    case "postinstall":
      let version;
      const package = path.join(projectRoot, "package.json");
      if (fs.existsSync(package)) version = require(package).caddy;
      if (version === undefined)
        version = (
          await got(
            "https://api.github.com/repos/caddyserver/caddy/releases/latest"
          ).json()
        ).tag_name.slice(1);

      await download(
        `https://github.com/caddyserver/caddy/releases/download/v${version}/caddy_${version}_${
          { win32: "windows", darwin: "mac", linux: "linux" }[process.platform]
        }_${{ x64: "amd64", arm64: "arm64", arm: "arm" }[process.arch]}${
          process.arch === "arm"
            ? `v${process.config.variables.arm_version}`
            : ""
        }.${process.platform === "win32" ? ".zip" : "tar.gz"}`,
        path.join(projectRoot, "node_modules/.bin/"),
        {
          extract: true,
          filter: (file) => file.path.includes("caddy"),
        }
      );
      break;

    case "preuninstall":
      await fs.unlink(path.join(projectRoot, "node_modules/.bin/caddy"));
      break;
  }
})();
