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
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.hutchind.cordova.plugins.streamingmedia": "0.1.4",
    "com.ionic.keyboard": "1.0.3",
    "org.apache.cordova.dialogs": "0.2.6",
    "xu.li.cordova.wechat": "0.4",
    "com.verso.cordova.clipboard": "0.1.0"
}
// BOTTOM OF METADATA
});