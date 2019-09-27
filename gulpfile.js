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
    babel = require("gulp-babel"),
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
        svg: './build/svg',
        svgSymbols: './build/svg/icons',
        img: './build/images',
        fonts: './build/fonts/'
    },
    src: {
        html: './src/*.html',
        css: './src/css/*.css',
        less: './src/less/style.less',
        scss: './src/sass/style.scss',
        js: './src/js/*.js',
        libs: './src/libs',
        svg: './src/svg/*.svg',
        svgSymbols: './src/svg/icons/*.svg',
        img: './src/images/**/*.{jpg,png,gif}',
        fonts: './src/fonts/**/*.*'
    },
    watch: {
        html: './src/**/*.html',
        less: './src/less/**/*.less',
        scss: './src/sass/**/*.scss',
        js: './src/js/**/*.js',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
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
        server: true,//if proxy comment this option
        // tunnel: "test",
        browser: "chrome",
        startPath: '/build',
        // proxy: "http://gtracer:9200/site/",
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
    return gulp.src(config.src.html)
        .pipe(rigger())
        // .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(config.build.html))
});

//LESS
gulp.task('less', () => {
    return gulp.src(config.src.less)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.build.css))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest(config.build.css))
        .pipe(browserSync.stream());
});

//SASS
gulp.task('scss', () => {
    return gulp.src(config.src.scss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.build.css))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write())
        .pipe(rename({
            suffix: '.min',
            prefix: ''
        }))
        .pipe(gulp.dest(config.build.css))
        .pipe(browserSync.stream());
});

//MIN CSS
gulp.task('minCss', () => {
    return gulp.src([config.src.css])
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.build.css))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({
            suffix: '.min',
            prefix: ''
        }))
        .pipe(gulp.dest(config.build.css))
});

//LIBS
gulp.task('libs', () => {
    return gulp.src(mainBowerFile({
            "overrides": {
                "jquery": {
                    "main": "dist/jquery.min.js"
                },
                "svg4everybody": {
                    "main": "dist/svg4everybody.min.js"
                },
                "owl.carousel": {
                    "main": ["dist/owl.carousel.min.js", "dist/assets/owl.carousel.min.css"]
                }
            }
        }),
        {
            base: config.src.libs
        })
        .pipe(flatten({
            includeParents: 1
        }))
        .pipe(gulp.dest(config.build.libs))
});

//JS
gulp.task('js', () => {
    return gulp.src(config.src.js)
        .pipe(sourcemaps.init())
        .pipe(rigger())//=
        .pipe(babel({presets: ['env']}))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.build.js))
        .pipe(browserSync.stream())
});

//IMG
gulp.task('img', () => {
    return gulp.src(config.src.img, {base: config.src.base})
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 5,
            interlaced: true
        }))
        .pipe(gulp.dest(config.build.img))
});

//SVG
gulp.task('svg', () => {
    return gulp.src(config.src.svg, {base: 'src'})
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSData: true},
                {removeTitle: true}
            ]
        }))
        .pipe(gulp.dest(config.build.svg))
});

//SVG SYMBOLS
gulp.task('svgSymbols', () => {
    return gulp.src(config.src.svgSymbols)
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
            ],
            collapseGroups: true,
            removeEmptyContainers: true
        }))
        .pipe(gulp.dest(config.build.svgSymbols))
});

//FONTS
gulp.task('fonts', () => {
    return gulp.src(config.src.fonts)
        .pipe(rigger())
        .pipe(gulp.dest(config.build.fonts))
});

//WATCH
gulp.task('watchLess', () => {
    gulp.watch(config.watch.less, gulp.series('less'));
    gulp.watch(config.watch.html, gulp.series('html'));
    gulp.watch(config.build.html).on('change', browserSync.reload);
});

//WATCH SASS
gulp.task('watchSass', () => {
    gulp.watch(config.watch.scss, gulp.series('scss'));
    gulp.watch(config.watch.html, gulp.series('html'));
    gulp.watch(config.build.html).on('change', browserSync.reload);
});

//WATCH BUILD
gulp.task('buildLess', gulp.parallel('watchLess', 'server'));
gulp.task('buildSass', gulp.parallel('watchSass', 'server'));


//WATCH OpenCart
gulp.task('ocWatch', () => {
    gulp.watch('./site/**/*.tpl').on('change', browserSync.reload);
    gulp.watch('./site/**/*.php').on('change', browserSync.reload);
});