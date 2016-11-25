module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
			js: {
		        src: ['src/js/*.js','!src/js/pageconsole.js'],
		        dest: 'js/scripts.js'
		    },
			css: {
				src: ["src/css/*.css"],
  		    	dest: "css/styles.css"
		    }
        },

		uglify: {
		    build: {
		        src: 'js/scripts.js',
		        dest: 'js/scripts.min.js'
		    },
			js: {
				src: 'js/pageconsole.js',
		        dest: 'js/pageconsole.min.js'
			}
		},

		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'css',
					src: 'styles.css',
					dest: 'css',
					ext: '.min.css'
				}]
			}
		},

		compass: {
		    dist: {
				options: {
			        sassDir: 'src/sass',
			        cssDir: 'src/css',
					imagesPath: 'src/images',
					generatedImagesDir: "images",
					httpGeneratedImagesPath: "../images",
					sourcemap: false
		    	}
		    }
		},

		autoprefixer: {
		    options: {
				browsers: ['last 10 versions', 'ie 8', 'ie 9']
		    },
		    dev: {
		      src: "src/css/*.css"
			},
		},

		stripmq: {
	        //Viewport options
	        options: {
	            width: 992,
	            type: 'screen'
	        },
	        all: {
	            files: {
	                'css/styles-ie8.css': ['css/styles.css']
	            }
	        }
	    },

		svg2png: {
	        all: {
	            files: [
	                { cwd: 'src/images/', src: ['sprites/*.svg'], dest: 'src/images/' }
	            ]
	        }
	    },

		copy: {
			css: {
				files: [
					{expand: true, src: ['css/**'], dest: '../temp/'},
				],
			},
			js: {
				files: [
					{expand: false, src: ['src/js/pageconsole.js'], dest: './js/pageconsole.js'}
				],
			},
			images: {
				files: [
					{expand: true, src: ['images/**'], dest: '../temp/'},
				],
			}
		},

		watch: {
			styles: {
		        files: ['src/css/**/*', 'src/sass/**/*'],
		        tasks: ['compass', 'autoprefixer', 'concat:css', 'cssmin', 'stripmq'],
		        options: {
		            spawn: false,
					livereload: true,
		        },
		    },
		    scripts: {
		        files: ['src/js/**/*.js'],
		        tasks: ['copy:js', 'concat:js', 'uglify'],
		        options: {
		            spawn: false,
					livereload: true,
		        },
		    },
			images: {
		        files: ['src/images/**/*.svg','images/*'],
		        tasks: ['svg2png','compass', 'autoprefixer', 'concat:css', 'cssmin', 'stripmq'],
		        options: {
		            spawn: false,
		        },
		    },
			
		}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-stripmq');
	grunt.loadNpmTasks('grunt-svg2png');
	grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['watch']);

};
