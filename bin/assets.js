const path = require('path')
const fs = require('fs')
const _ = require('lodash');
const { deploy, excludeDefaults } = require("@samkirkland/ftp-deploy");
const ftpConfig = JSON.parse( fs.readFileSync( path.resolve(__dirname, '../ftp-config.json') ) )


const ftpDeploy = async() => {
    await deploy({
        server: ftpConfig.host,
        port: ftpConfig.port,
        username: ftpConfig.user,
        password: ftpConfig.password,
        exclude: [...excludeDefaults, 'src/**', 'bin/**', '.DS_Store'],
        "local-dir": path.resolve(__dirname, '../static') + "/",
        "server-dir": ftpConfig.remoteDist,
        "log-level": "minimal"
    })
}

function startWatch(){
    const excludeFiles = ['.ftp-deploy-sync-state.json']
    const watcher = fs.watch(path.resolve(__dirname, '../static/'), {
        recursive: true,
        persistent: true,
        encoding: 'utf8'
    })

    const debouncedDeploy = _.debounce(ftpDeploy, 100)
    watcher.on('change', (eventType, filename) => {
        if (excludeFiles.includes(filename))
            return

        debouncedDeploy()
    })
    watcher.on('error', (error) => console.error(error))
}

exports.startWatch = startWatch
exports.deploy = ftpDeploy