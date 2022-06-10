const { series, parallel, watch, src, dest } = require('gulp')
const { resolve, basename, extname } = require('path')
const rename = require('gulp-rename')

const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');

const tinypng = require('gulp-tinypng-compress');
const gulpSvgstore = require('gulp-svgstore');

function imageOptimize(cb){
    src(resolve(__dirname, './src/images/*.{png,jpg,jpeg}'))
	.pipe(tinypng({
		key: 'odthLyLlVCQlfl9KLbpWcDBGEAqaBK8T',
		sigFile: resolve(__dirname, './static/images/.tinypng-sigs')
	}))
	.pipe(dest(resolve(__dirname, './static/images')))
    cb()
}

function svgSprite(cb){
    return src(resolve(__dirname, './src/images/*.svg'))
        .pipe(svgmin({
            full: true,
            plugins: [
                'preset-default',
                {
                    name: 'removeAttrs',
                    params: {
                        attrs: '(fill|stroke)'
                    }
                }
            ]
        }))
        .pipe(svgstore())
        .pipe(svgmin({
            full: true,
            plugins: ['removeDoctype']
        }))
        .pipe(rename(path => { path.basename = 'sprite' }))
        .pipe(dest(resolve(__dirname, './static/images')));
}

function staticSvgSprite(cb){
    return src(resolve(__dirname, './src/images/static/*.svg'))
        .pipe(svgmin({
            full: true,
            plugins: ['preset-default']
        }))
        .pipe(svgstore())
        .pipe(svgmin({
            full: true,
            plugins: ['removeDoctype']
        }))
        .pipe(rename(path => { path.basename = 'stati-csprite' }))
        .pipe(dest(resolve(__dirname, './static/images')));
}

function watchSrc(){
    watch(resolve(__dirname, './src/images/*.{png,jpg,jpeg}'), imageOptimize)
    watch(resolve(__dirname, './src/images/*.svg'), svgSprite)
    watch(resolve(__dirname, './src/images/static/*.svg'), staticSvgSprite)
}

exports.build = parallel(imageOptimize, svgSprite, staticSvgSprite)
exports.default = parallel(watchSrc)