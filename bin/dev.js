const webpack = require('webpack')
const fs = require('fs')
const config = require('../webpack.config')
const { watchForDeploy, deploy, watchAssets } = require('./assets')

const compilerCallback = (err, stats) => {
    if (err){
        console.log(err)
        return
    }
}
const mode = process.env.NODE_ENV || 'dev'
const isDev = mode === 'dev'
const compiler = webpack(config)

isDev ? dev() : prod()

function dev(){
    watchForDeploy()
    watchAssets()
    compiler.watch(
        {
            ignored: ['**/static', '**/src/images', '**/node_modules']
        },
        compilerCallback
    )
}

function prod(){
    compiler.run((err, stats) => {
        if (err){
            console.log(err)
            return
        }
        
        deploy()
    })
}