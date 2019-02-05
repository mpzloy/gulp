"use strict";

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    rigger = require('gulp-rigger'),
    cleanCSS = require('gulp-clean-css'),
    gcmq = require('gulp-group-css-media-queries'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    mainBowerFile = require('main-bower-files'),
    flatten = require('gulp-flatten'),
    smushit = require('gulp-smushit'),
    imagemin = require('gulp-imagemin'),
    svgmin = require('gulp-svgmin'),
    svgSimbols = require('gulp-svg-symbols'),
    babel = require("@babel/core"),
    uglify = require('gulp-uglify'),
    del = require('del'),
    htmlmin = require('gulp-htmlmin'),
    rename = require('gulp-rename');


//PATH
let config = {
    build: {
        html: './build/',
        css: './build/css',
        js: './build/js/',
        libs: './build/libs',
        svg: './build/images/svg',
        svgSymbols: './build/images/svg/icons',
        img: './build/images',
        fonts: './build/fonts/'
    },
    src: {
        html: './src/*.html',
        css: './src/css/*.css',
        less: './src/less/style.less',
        scss: './src/sass/style.sass',
        js: './src/js/*.js',
        libs: './src/libs',
        svg: './src/images/img/svg/*.svg',
        svgSymbols: './src/images/img/svg/icons/*.svg',
        img: './src/images/**/*.{jpg,png,gif}',
        fonts: './src/fonts/**/*.*'
    },
    watch: {
        html: './src/**/*.html',
        less: './src/less/**/*.less',
        scss: './src/sass/**/*.less',
        js: './src/js/**/*.js',
        img: './src/img/**/*.*',//todo попробовать доьавить watcher
        fonts: './src/fonts/**/*.*'//todo попробовать доьавить watcher
    },
};

// ALTERNATIVE PATCH
// let config = {
//     src: './src',
//     build: './build',
//     html: {
//         src: '/*.html',
//         build: '/',
//         watch: '/**/*.html'
//     },
//     css: {
//         src: './src/css',
//         build: './build/css'
//     },
//     less: {
//         watch: '/less/**/*.less',
//         src: '/less/style.less'
//     },
//     sass: {
//         watch: '/sass/**/*.sass',
//         src: '/sass/style.sass'
//     },
//     fonts: {
//         src: '/fonts/*.*',
//         build: '/fonts/'
//     },
//     libs: {
//         src: '/libs',
//         build: '/libs'
//     },
//     js: {
//         src: '/js/*.js',
//         build: '/js/',
//         watch: '/js/*.js'
//     },
//     img: {
//         srcImg: '/img/**/*.{jpg,png,gif}',
//         srcImages: '/images/**/*.{jpg,png,gif}',
//         build: '/images/'
//     },
//     svg: {
//         src: '/img/svg/*.svg',
//         build: '/images/svg'
//     },
//     svg_symbols: {
//         src: '/img/svg/icons/*.svg',
//         build: '/images/svg/icons'
//     }
// };

// SERVER
gulp.task('server', reload => {
    browserSync.init({
        server: true,
        // tunnel: "test",
        browser: "chrome",
        // startPath: '/build',
        proxy: "http://gtracer:9200/site/",
        // port: 2222,
        notify: false,
        open: false
    });
    reload();
});

//CLEAN
gulp.task('clean', () => del('build'));

//HTML
gulp.task('html', () => {
    return gulp.src(config.src.html)//'./src/*.html'
        .pipe(rigger())
        // .pipe(rename('index.html'))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(config.build.html))//'./build/'
});

//LESS
gulp.task('less', () => {
    return gulp.src([config.src.less])//'./src/less/style.less'
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],// > 0.1%
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.build.css))//'./build/css/'
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest(config.build.css))//'./build/css/'
        .pipe(browserSync.stream());
});

//SASS
gulp.task('scss', () => {
    return gulp.src(config.src.scss)//'./src/sass/style.scss'
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.build.css))//'./build/css/'
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest(config.build.css))//'./build/css/'
        .pipe(browserSync.stream());
});

//MIN CSS
gulp.task('minCss', () => {
    return gulp.src([config.src.css])//'./src/css/style.css'
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],// > 0.1%
            cascade: false
        }))
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.build.css))//'./build/css/'
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest(config.build.css))//'./build/css/'
});

//LIBS
gulp.task('libs', () => {
    return gulp.src(mainBowerFile(
        {
            "overrides": {
                "jquery": {
                    "main": "dist/jquery.min.js"
                },
                "svg4everybody": {
                    "main": "dist/svg4everybody.min.js"
                },
                "owl.carousel": {
                    "main": "dist/owl.carousel.min.js"
                }
            }
        }
    ), {base: config.src.libs})//./src/libs
        .pipe(flatten({includeParents: 1}))
        .pipe(gulp.dest(config.build.libs))//'./build/libs'
});

//JS
gulp.task('js', () => {
    return gulp.src(config.src.js)//'./src/js/*.js'
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['env']}))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.build.js))//'./build/libs'
        .pipe(browserSync.stream())
});

//IMG
gulp.task('img', () => {
    return gulp.src(config.src.img, {base: config.src})//'./src/img/**/*.{jpg,png,gif}', './src/images/**/*.{jpg,png,gif}' | "./src"
    // .pipe(smushit({
    //     verbose: true
    // }))
    // .pipe(imagemin())
        .pipe(imagemin({
            progressive: true,
            // svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(config.build.img))//'./build/images'
});

//SVG
gulp.task('svg', () => {
    return gulp.src(config.src.svg, {base: 'src'})//'./src/images/img/svg/*.svg'
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSData: true},
                {removeTitle: true}
            ]
        }))
        .pipe(gulp.dest(config.build.svg))//'./build/images/svg'
});

//SVG SYMBOLS
gulp.task('svgSymbols', () => {
    return gulp.src(config.src.svgSymbols)//'./src/img/svg/icons/*.svg'
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSData: true},
                {removeTitle: true}
            ]
        }))
        .pipe(svgSimbols({
            title: '%f icon',
            svgAttrs: {
                class: 'svg-icon-lib'
            },
            templates: [
                'default-svg', 'default-css', 'default-demo'
            ]
        }))
        .pipe(gulp.dest(config.build.svgSymbols))//'./build/img/svg'
});

//FONTS
gulp.task('fonts', () => {
    return gulp.src(config.src.fonts)//'./src/fonts/*.*'
        .pipe(rigger())
        .pipe(gulp.dest(config.build.fonts))//'./build/fonts'
});

//WATCH
gulp.task('watchLess', () => {
    gulp.watch(config.src.less.watch, gulp.series('less'));//'./src/less/*.less'
    gulp.watch(config.src.html.watch, gulp.series('html'));//'./src/*.html'
    gulp.watch(config.build.html).on('change', browserSync.reload);//'./build/*.html'
});

//WATCH SASS
gulp.task('watchSass', function () {
    gulp.watch(config.src.scss.watch, gulp.series('scss'));//'./src/sass/*.scss'
    gulp.watch(config.src.html.watch, gulp.series('html'));
    gulp.watch(config.build.html.src).on('change', browserSync.reload);
});

//WATCH BUILD
gulp.task('buildLess', gulp.parallel('watchLess', 'server'));
gulp.task('buildSass', gulp.parallel('watchSass', 'server'));