"use strict";

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const less = require('gulp-less');
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
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

//CSS
gulp.task('css', function () {
    return gulp.src(['./src/less/style.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(gcmq())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(concat("style.css"))
        .pipe(gulp.dest('./build/css/'))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min', prefix : '' }))
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream());
});

//HTML
gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(rigger())
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./build/'))
});

//FONTS
gulp.task('fonts', function () {
    return gulp.src('./src/fonts/*.*')
        .pipe(rigger())
        .pipe(gulp.dest('./build/fonts'))
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
    ), {base: "./src/libs"})
        .pipe(flatten({includeParents: 1}))
        .pipe(gulp.dest('./build/libs'))
});


//JS
gulp.task('js', function(){
    return gulp.src('./src/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build/libs'))
        .pipe(browserSync.reload({
            stream: true
        }));
});


//IMG
gulp.task('img', function () {
    return gulp.src(['./src/img/**/*.{jpg,png,gif}', './src/images/**/*.{jpg,png,gif}'], {base: "./src"})
        // .pipe(smushit({
        //     verbose: true
        // }))
        // .pipe(imagemin())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest('./build'))
});

//SVG
gulp.task('svg', function () {
    return gulp.src('./src/img/svg/*.svg')
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSdata: true},
                {removeTitle: true}
            ]
        }))
        .pipe(gulp.dest('./build/img/svg'))
});

gulp.task('svg_symbols', function () {
    return gulp.src('./src/img/svg/icons/*.svg')
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSdata: true},
                {removeTitle: true}
            ]
        }))
        .pipe(svgSimbols({
            title: '%f',
            svgClassname: 'svg-icon-lib',
            templates: [
                'default-svg', 'default-css', 'default-demo'
            ]
        }))
        .pipe(gulp.dest('./build/img/svg'))
});

//WATCH
gulp.task('watch', function () {
    gulp.watch('./src/less/*.less', gulp.series('css'));
    gulp.watch('./src/*.html', gulp.series('html'));
    gulp.watch('./build/*.html').on('change', browserSync.reload);
});

gulp.task('server', function () {
    browserSync.init({
        server: true,
        // tunnel: "test",
        browser: "chrom",
        startPath: '/build',
        notify: false,
        open: false
    })
});

gulp.task('dev', gulp.parallel('watch', 'server'));


