cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.hutchind.cordova.plugins.streamingmedia/www/StreamingMedia.js",
        "id": "com.hutchind.cordova.plugins.streamingmedia.StreamingMedia",
        "clobbers": [
            "streamingMedia"
        ]
    },
    {
        "file": "plugins/com.ionic.keyboard/www/keyboard.js",
        "id": "com.ionic.keyboard.keyboard",
        "clobbers": [
            "cordova.plugins.Keyboard"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.dialogs/www/notification.js",
        "id": "org.apache.cordova.dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/xu.li.cordova.wechat/www/wechat.js",
        "id": "xu.li.cordova.wechat.Wechat",
        "clobbers": [
            "Wechat"
        ]
    },
    {
        "file": "plugins/com.verso.cordova.clipboard/www/clipboard.js",
        "id": "com.verso.cordova.clipboard.Clipboard",
        "clobbers": [
            "cordova.plugins.clipboard"
        ]
    },
    {
        "file": "plugins/de.appplant.cordova.plugin.email-composer/www/email_composer.js",
        "id": "de.appplant.cordova.plugin.email-composer.EmailComposer",
        "clobbers": [
            "cordova.plugins.email",
            "plugin.email"
        ]
    },
    {
        "file": "plugins/org.devgeeks.Canvas2ImagePlugin/www/Canvas2ImagePlugin.js",
        "id": "org.devgeeks.Canvas2ImagePlugin.Canvas2ImagePlugin",
        "clobbers": [
            "window.canvas2ImagePlugin"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.hutchind.cordova.plugins.streamingmedia": "0.1.4",
    "com.ionic.keyboard": "1.0.3",
    "org.apache.cordova.dialogs": "0.2.6",
    "xu.li.cordova.wechat": "0.4",
    "com.verso.cordova.clipboard": "0.1.0",
    "de.appplant.cordova.plugin.email-composer": "0.8.2dev",
    "org.devgeeks.Canvas2ImagePlugin": "0.6.0",
    "org.apache.cordova.device": "0.2.12"
}
// BOTTOM OF METADATA
});