/* --save-dev */
var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify'),
    rename          = require('gulp-rename'),
    autoprefixer    = require('gulp-autoprefixer'),
    browserSync     = require('browser-sync'),
    watch           = require('gulp-watch'),
    rigger          = require('gulp-rigger'), // импортировать один файл в другой // аналог fileinclude     = require('gulp-file-include');
    concat          = require('gulp-concat'),
    imagemin        = require('gulp-imagemin'), // для сжатия картинок
    pngquant        = require('imagemin-pngquant'),
    cssMin          = require('gulp-minify-css'),
    //livereload      = require('gulp-livereload'),
    reload          = browserSync.reload,
    rimraf          = require('rimraf'),
    filesize        = require('gulp-filesize'),
    changed         = require('gulp-changed');

var path = {
    build:{
        html:  'build/',
        js:    'build/js/',
        css:   'build/css/',
        img:   'build/img/',
        fonts: 'build/fonts/'
    },
    src:{
        html:    'src/*.html',
        js:      'src/js/main.js',
        style:   'src/style/main.scss',
        img:     'src/img/**/*.*',
        fonts:   'src/fonts/**/*.*'
    },
    watch:{
        html:    'src/**/*.html',
        js:      'src/js/**/*.js',
        style:   'src/style/**/*.scss',
        img:     'src/img/**/*.*',
        fonts:   'src/fonts/**/*.*'
    },
    clean: './build'
};
gulp.task('webserver',function () {
    browserSync({
        server:{
            baseDir: './build'
        },
        host: 'localhost',
        port: 3000,
        tunnel: true
    });
    /*
    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
     */
});
// сборка верстки
////= template/footer.html
gulp.task('html:build',function () {
    return gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream:true}))
});
// сборка js
gulp.task('js:build',function () {
    return gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        //.pipe(concat('vendor.js')) // объединить в данный файл все остальные js
        .pipe(uglify()) //минимизировать
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(filesize())
        .pipe(reload({stream:true}))
});
// сборка scss
gulp.task('style:build',function () {
    return gulp.src(path.src.style)
        .pipe(changed(path.build.css))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cssMin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(filesize())
        .pipe(reload({stream:true}))
});
// картинки
gulp.task('image:build', function () {
    return gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});
gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});
gulp.task('build',[
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);
// clean .build/
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
// watch's
gulp.task('html:watch', function () {gulp.watch([path.watch.html], ['html:build']);});
gulp.task('js:watch', function () {gulp.watch([path.watch.js], ['js:build']);});
gulp.task('style:watch', function () {gulp.watch([path.watch.style], ['style:build']);});
gulp.task('fonts:watch', function () {gulp.watch([path.watch.fonts], ['fonts:build']);});
gulp.task('img:watch', function () {gulp.watch([path.watch.img], ['img:build']);});
gulp.task('watch', ['html:watch', 'js:watch','style:watch']);

gulp.task('default', ['build', 'webserver', 'watch']);

/*
вместо browsersync при разработке в одном браузере
gulp.task('livereload', function() {
    connect.server({
        root: './build',
        livereload: true,
        open: true
    });
})
//.pipe(connect.reload())
//gulp start
gulp.task('start', ['livereload', 'watch']);
*/

