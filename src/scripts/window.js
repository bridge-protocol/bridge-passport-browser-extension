    //Set window
    const jquery = require('jquery');
    const bridge = require('./bridge-extension').BridgeExtension;

    window.$ = jquery;
    window.jQuery = jquery;
    window.Bridge= bridge;