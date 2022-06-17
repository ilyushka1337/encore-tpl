const Encore = require('@symfony/webpack-encore');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

const staticPath = 'local/templates/dev_tpl/static'

Encore
    // directory where compiled assets will be stored
    .setOutputPath('static/build/')
    // public path used by the web server to access the output path
    .setPublicPath(`/${staticPath}/build`)
    // only needed for CDN's or sub-directory deploy
    .setManifestKeyPrefix(`${staticPath}/build`)

    /*
     * ENTRY CONFIG
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
     */
    .addEntry('app', './src/js/app.js')

    // enables the Symfony UX Stimulus bridge (used in assets/bootstrap.js)
    // .enableStimulusBridge('./assets/controllers.json')

    // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
    // .splitEntryChunks()

    // will require an extra script tag for runtime.js
    // but, you probably want this, unless you're building a single-page app
    // .enableSingleRuntimeChunk()
    .disableSingleRuntimeChunk()

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    .configureBabel((config) => {
        config.plugins.push('@babel/plugin-proposal-class-properties');
    })

    // enables @babel/preset-env polyfills
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })

    .configureImageRule({
        enabled: false
    })

    .enableSassLoader()
;

const config = Encore.getWebpackConfig()
config.module.rules.push({
    test: /\.(png|jpg|jpeg)$/i,
    type: 'asset/resource',
    generator: {
        emit: false,
        filename: '[name][ext]',
        outputPath: '../images/',
        publicPath: `/${staticPath}/images/`
    }
})
config.output.chunkFilename = '[name].[hash:8].ext'

module.exports = config;