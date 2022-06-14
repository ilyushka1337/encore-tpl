const webpack = require('webpack')
const fs = require('fs')
const config = require('../webpack.config')
const { startWatch, deploy } = require('./assets')

const compilerCallback = (err, stats) => {
    if (err){
        console.log(err)
        return
    }
}
const mode = process.env.NODE_ENV || 'development'
const isDev = mode === 'development'
const compiler = webpack(config)

isDev ? dev() : prod()

function dev(){
    startWatch()
    compiler.watch(
        {
            ignored: ['**/static', '**/src/images', '**/node_modules']
        },
        compilerCallback
    )
}

function prod(){
    compiler.run(compilerCallback)
}