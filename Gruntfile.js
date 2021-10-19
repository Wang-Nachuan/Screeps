module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: '1187014311@qq.com',
                token: '92851e89-7d1e-4cae-9de8-ac6f3f69b929',
                branch: 'default',
                //server: 'season'
            },
            dist: {
                src: ['/d/Code/JavaScript/Screeps/*.js']
            }
        }
    });
}