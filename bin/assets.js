const path = require('path')
const fs = require('fs')
const fsPromises = require('fs/promises')
const _ = require('lodash');
const { deploy, excludeDefaults } = require("@samkirkland/ftp-deploy");
const svgstore = require('svgstore')
const svgo = require('svgo');
const sharp = require('sharp');

const ftpConfig = JSON.parse( fs.readFileSync( path.resolve(__dirname, '../ftp-config.json') ) )


const ftpDeploy = async() => {
    await deploy({
        server: ftpConfig.host,
        port: ftpConfig.port,
        username: ftpConfig.user,
        password: ftpConfig.password,
        exclude: [...excludeDefaults, '.DS_Store'],
        "local-dir": path.resolve(__dirname, '../static') + "/",
        "server-dir": ftpConfig.remoteDist,
        "log-level": "minimal"
    })
}

function watchForDeploy(){
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

const getAssetType = (filename) => {
    if (filename.match(/.+\.svg/i) !== null)
        return 'svg'
    if (filename.match(/.+\.(png|jpg|jpeg)/i) !== null)
        return 'image'
}

function optimizeSvg(file, type = 'default'){
    const optimized = svgo.optimize(file,{
        plugins: [
            'preset-default',
            type === 'default' ?
            {
                name: 'removeAttrs',
                params: {
                    attrs: '(fill|stroke)'
                }
            }
            : false
        ].filter(Boolean)
    })

    return optimized.data
}

async function makeSprite(iconsDir, type = 'default'){
    const files = await fsPromises.readdir(iconsDir)
    const svgs = files.filter(file => {
        const found = file.match(/.+\.svg/i)
        return found !== null 
    })
    if (svgs.length === 0)
        return false

    const sprite = svgstore()
    for (const svg of svgs){
        const file = await fsPromises.readFile(path.resolve(iconsDir, svg))
        const optimized = optimizeSvg(file, type)
        const split = svg.split('.')
        sprite.add(split[0], optimized)
    }
    const spriteStr = sprite.toString()
    const optimizedSprite = svgo.optimize(spriteStr, {
        plugins: ['removeDoctype', 'removeUselessDefs', 'removeXMLProcInst']
    })

    return optimizedSprite.data
}

async function svgSprite(){
    const iconsDir = path.resolve(__dirname, '../src/images/')
    const sprite = await makeSprite(iconsDir)
    if (!sprite) return

    await fsPromises.writeFile(path.resolve(__dirname, '../static/images/sprite.svg'), sprite)
}

async function staticSvgSprite(){
    const iconsDir = path.resolve(__dirname, '../src/images/static/')
    const sprite = await makeSprite(iconsDir, 'static')
    if (!sprite) return

    await fsPromises.writeFile(path.resolve(__dirname, '../static/images/static-sprite.svg'), sprite)
}

async function watchAssets(){
    const excludeFiles = [
        '.DS_Store'
    ]

    const watcher = fsPromises.watch(path.resolve(__dirname, '../src/images/'), {
        recursive: true,
        persistent: true,
        encoding: 'utf8'
    })
    for await(const event of watcher){
        if (excludeFiles.includes(event.filename))
            return

        switch (getAssetType(event.filename)){
            case 'svg':
                svgSprite()
                staticSvgSprite()
                break;
            case 'image':
                imageMin()
                break;
        }
    }
}

async function optimizeJpeg(file){
    return await sharp(file)
        .jpeg({
            mozjpeg: true,
            quality: 80
        })
}
async function optimizePNG(file){
    return await sharp(file)
        .png({
            quality: 80,
        })
}

async function imageMin(){
    const imgsDir = path.resolve(__dirname, '../src/images/')
    const files = await fsPromises.readdir(imgsDir)
    const imgs = files.filter(file => {
        const found = file.match(/.+\.(png|jpg|jpeg)/i)
        return found !== null 
    })
    if (imgs.length === 0)
        return false

    const outDir = path.resolve(__dirname, '../static/images/')
    for (const img of imgs){
        const split = img.split('.')
        const ext = split[1]
        const format = ext === 'png' ? 'png' : 'jpeg'
        const file = await fsPromises.readFile(path.resolve(imgsDir, img))
        
        let optimized
        switch (format){
            case 'jpeg':
                optimized = await optimizeJpeg(file)
                break;
            case 'png':
                optimized = await optimizePNG(file)
                break;
        }
        optimized.toFile(`${outDir}/${img}`)
    }
}

exports.watchForDeploy = watchForDeploy
exports.watchAssets = watchAssets
exports.deploy = ftpDeploy