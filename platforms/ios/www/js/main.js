
// This set's up the module paths for underscore and backbone
require.config({
    'paths': {
        // libs
        jquery:     'libs/jquery/1.11.1/jquery',
        underscore: 'libs/underscore/1.6.0/underscore',
        backbone:   'libs/backbone/1.1.2/backbone',
        fetchCache: 'libs/backbone/plugins/backbone.fetch-cache',
        text:       'libs/require/plugins/text',
        // extend
        iscroll:    'libs/iscroll/iscrollAssist', 
        hammer:     'libs/hammer/2.0.1/hammer',
        slider:     'libs/extend/slider',
        fastclick:  'libs/extend/fastclick',
        webStorage: 'libs/extend/localStorage',
        appUI:      'libs/extend/ui',
        BTFramwork: 'libs/extend/bt-framework',

        // cordova
        cordova: '../cordova',
        cordovaPlugin: '../cordova_plugins',

        // template
        templates:  '../templates',
    },
    'shim': {
		backbone: {
			'deps': ['BTFramwork', 'jquery', 'underscore'],
			'exports': 'Backbone'
		},
        underscore: {
            'exports': '_'
        },
        fetchCache: {
            'deps': ['jquery']
        },
        iscroll: {
            'deps': ['libs/iscroll/5.0/iscroll']
        }
	}

});

require(['cordova', 'cordovaPlugin', 'app'], function (cordova, cordovaPlugin, app) {

    // Expose Internal Dom library
    $$ = window.Dom;
    
    myApp = new btFramework();

    app.initialize();
    
});

// require(['app'], function (app) {
    
//     // Expose Internal Dom library
//     $$ = window.Dom;

//     myApp = new btFramework();

//     app.initialize();
// });
