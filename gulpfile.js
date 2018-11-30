"use strict";

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const less = require('gulp-less');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rigger = require('gulp-rigger');
const cleanCSS = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const mainBowerFile = require('main-bower-files');
const flatten = require('gulp-flatten');
const smushit = require('gulp-smushit');
const imagemin = require('gulp-imagemin');
const svgmin = require('gulp-svgmin');
const svgSimbols = require('gulp-svg-symbols');
const babel = require("@babel/core");
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');


//PATH

let config = {
    src: './src',
    build: './build',
    html: {
        src: '/*.html',
        build: '/',
        watch: '/**/*.html'
    },
    css: {
        src: './src/css',
        build: './build/css'
    },
    less: {
        watch: '/less/**/*.less',
        src: '/less/style.less'
    },
    sass: {
        watch: '/sass/**/*.sass',
        src: '/sass/style.sass'
    },
    fonts: {
        src: '/fonts/*.*',
        build: '/fonts/'
    },
    libs: {
        src: '/libs',
        build: '/libs'
    },
    js: {
        src: '/js/*.js',
        build: '/js/'
    },
    img: {
        srcImg: '/img/**/*.{jpg,png,gif}',
        srcImages: '/images/**/*.{jpg,png,gif}',
        build: '/images/'
    },
    svg: {
        src: '/img/svg/*.svg',
        build: '/images/svg'
    },
    svg_symbols: {
        src: '/img/svg/icons/*.svg',
        build: '/images/svg/icons'
    }
};

//CSS

//LESS
gulp.task('cssLess', function () {
    return gulp.src([config.src + config.less.src])//'./src/less/style.less'
    // .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        // .pipe(sourcemaps.write())
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.css.build))//'./build/css/'
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest(config.css.build))//'./build/css/'
        .pipe(browserSync.stream());
});

//SASS
gulp.task('cssSass', function () {
    return gulp.src([config.src + config.sass.src])//'./src/sass/style.scss'
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(concat("style.css"))
        .pipe(gulp.dest())//'./build/css/'
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write(config.css.build))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest())//'./build/css/'
        .pipe(browserSync.stream(config.css.build));
});

//MIN CSS
gulp.task('min_css', function () {
    return gulp.src([config.src + config.css])//'./src/css/style.css'
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(concat("style.css"))
        .pipe(gulp.dest(config.css.build))//'./build/css/'
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(gulp.dest(config.css.build))//'./build/css/'
});

//HTML
gulp.task('html', function () {
    return gulp.src(config.src + config.html.src)//'./src/*.html'
        .pipe(rigger())
        .pipe(rename('index.html'))
        .pipe(gulp.dest(config.build + config.html.build))//'./build/'
});

//FONTS
gulp.task('fonts', function () {
    return gulp.src(config.src + config.fonts.src)//'./src/fonts/*.*'
        .pipe(rigger())
        .pipe(gulp.dest(config.build + config.fonts.build))//'./build/fonts'
});

//LIBS
gulp.task('libs', function () {
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
    ), {base: config.src + config.libs.src})//./src/libs
        .pipe(flatten({includeParents: 1}))
        .pipe(gulp.dest(config.build + config.libs.build))//'./build/libs'
});

//JS
gulp.task('js', function () {
    return gulp.src(config.src + config.js.src)//'./src/js/*.js'
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['env']}))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.build + config.js.build))//'./build/libs'
        .pipe(browserSync.reload({
            stream: true
        }));
});

//IMG
gulp.task('img', function () {
    return gulp.src([config.src + config.img.srcImg, config.src + config.img.srcImages], {base: config.src})//'./src/img/**/*.{jpg,png,gif}', './src/images/**/*.{jpg,png,gif}' | "./src"
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
        .pipe(gulp.dest(config.build + config.img.build))//'./build/images'
});

//SVG
gulp.task('svg', function () {
    return gulp.src(config.src + config.svg.src)//'./src/img/svg/*.svg'
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSdata: true},
                {removeTitle: true}
            ]
        }))
        .pipe(gulp.dest(config.build + config.svg.build))//'./build/img/svg'
});

gulp.task('svg_symbols', function () {
    return gulp.src(config.src + config.svg_symbols.src)//'./src/img/svg/icons/*.svg'
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSdata: true},
                {removeTitle: true}
            ]
        }))
        .pipe(svgSimbols({
            title: '%f',
            /*svgClassname: 'svg-icon-lib',*/ /*осуждается*/
            svgAttrs: {
                class: 'svg-icon-lib'
            },
            templates: [
                'default-svg', 'default-css', 'default-demo'
            ]
        }))
        .pipe(gulp.dest(config.build + config.svg_symbols.build))//'./build/img/svg'
});

//WATCH
gulp.task('watchLess', function () {
    gulp.watch(config.src + config.less.watch, gulp.series('cssLess'));//'./src/less/*.less'
    gulp.watch(config.src + config.html.watch, gulp.series('html'));//'./src/*.html'
    gulp.watch(config.build + config.html.src).on('change', browserSync.reload);//'./build/*.html'
});

//WATCH SASS
gulp.task('watchSass', function () {
    gulp.watch(config.src + config.sass.watch, gulp.series('cssSass'));//'./src/sass/*.scss'
    gulp.watch(config.src + config.html.watch, gulp.series('html'));
    gulp.watch(config.build + config.html.src).on('change', browserSync.reload);
});

gulp.task('server', function () {
    browserSync.init({
        server: true,
        // tunnel: "test",
        browser: "chrom",
        startPath: config.build,///build
        notify: false,
        open: false
    })
});

gulp.task('watchDevLess', gulp.parallel('watchLess', 'server'));

gulp.task('watchDevSass', gulp.parallel('watchSass', 'server'));