const webpack = require('webpack')
const { build: buildAssets, default: watchAssets } = require('../gulpfile')
let config = require('../webpack.config')

const compilerCallback = (err, stats) => {
    if (err)
        console.log(err)
}
const mode = process.env.NODE_ENV || 'development'
const isDev = mode === 'development'
const compiler = webpack(config)

isDev ? dev() : prod()

function dev(){
    compiler.watch(
        {
            ignored: ['**/static', '**/src/images', '**/node_modules']
        },
        compilerCallback
    )
    buildAssets()
}

function prod(){
    compiler.run(compilerCallback)
    watchAssets()
}