function PAGECONSOLE(config) {
    config = config || {};
    if( !(this instanceof PAGECONSOLE ) ) {
        return new PAGECONSOLE(config);
    }
    this._config = this._extendOptions(config);
    this._pconWindow = null;
    this._pconStdIn = null;
    this._pconStdOut = null;
    this._createConsoleWindow();
    this._addHotKeyToDisplayConsoleWindow();
    this._pconStdIn.addEventListener('keyup',this._execute.bind(this),false);
}


// Clear StdIn
PAGECONSOLE.prototype._clearStdIn = function(){
    this._pconStdIn.value = "";
}


// Put line to StdOut
PAGECONSOLE.prototype._putStdOut = function(s){
    var line = document.createElement("div"),
        txt = document.createTextNode((s=="") ? "\u00A0" : s),
        lines = this._pconStdOut.childNodes.length;
    line.appendChild(txt);
    this._pconStdOut.appendChild(line);
    if(lines > this._config.maxOutputLines){
        this._pconStdOut.removeChild(this._pconStdOut.childNodes[0])
    }

}

// Execute command
PAGECONSOLE.prototype._execute = function(e){
    if(e.keyCode === 13){
        this._putStdOut(this._pconStdIn.value);
        this._clearStdIn();
    }
}

// Extend options
PAGECONSOLE.prototype._extendOptions = function(config) {
    var defaultConfig = JSON.parse(JSON.stringify(this._defaultConfig));
    for(var key in defaultConfig) {
        if(key in config)
            continue;
        config[key] = defaultConfig[key];
    }
    return config;
}


// Create console window
PAGECONSOLE.prototype._createConsoleWindow = function(){
    var df = document.createDocumentFragment(),
        pconWindow = document.createElement("div"),
        pconStdOutWrapper = document.createElement("div"),
        pconStdOut = document.createElement("div"),
        pconStdIn = document.createElement("input"),
        pconStdOutLine = document.createElement("div");

    pconWindow.style.display = "none";

    if(!this._config.disableStyles){
        pconWindow.style.position = "fixed";
        pconWindow.style.zIndex = "1000";
        pconWindow.style.bottom = "5px";
        pconWindow.style.left = "5px";
        pconWindow.style.width = "200px";
        pconWindow.style.padding = "5px";
        pconWindow.boxSizing = "border-box";
        pconWindow.style.fontFamily = "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace";
        pconWindow.style.fontSize = "1.2rem";
        pconWindow.style.background = "rgba(0,0,0,.8)";
        pconStdOut.style.minHeight = "20px";
        pconStdOut.style.marginBottom = "5px";
        pconStdOut.style.paddingBottom = "5px";
        pconStdOut.style.borderBottom = "1px solid rgba(255,255,255,.25)";
        pconStdOut.style.color = "rgb(255,255,255)";
        pconStdOut.style.overflow = "hidden";
        pconStdIn.style.color = "rgb(255,255,255)";
        pconStdIn.style.border = "none";
        pconStdIn.style.background = "transparent";
        pconStdIn.style.display = "block";
        pconStdIn.style.width = "100%";

    }

    if(this._config.domClasses){
        pconWindow.classList.add(this._config.domClasses[0]);
        pconStdIn.classList.add(this._config.domClasses[1]);
        pconStdOut.classList.add(this._config.domClasses[2]);
    }

    if(this._config.stdOut){
        if(this._config.greeting){
            pconStdOutLine.appendChild(document.createTextNode(this._config.greeting));
            pconStdOut.appendChild(pconStdOutLine);
        }
        pconWindow.appendChild(pconStdOut);
    }
    pconWindow.appendChild(pconStdIn);
    df.appendChild(pconWindow);
    document.body.appendChild(df);

    // Get global references to console window
    this._pconWindow = pconWindow;
    this._pconStdIn = pconStdIn;
    if(this._config.stdOut)
        this._pconStdOut = pconStdOut;

}

// Show/Hide console window
PAGECONSOLE.prototype._showHideConsoleWindow = function(e){
    if(this._config.hotKey){
        var hotKey = this._config.hotKey.toLowerCase().split(/ *\+ */);
        var key = (hotKey[hotKey.length-1] === "esc") ? "escape" : hotKey[hotKey.length-1];
        var ctrl = (hotKey.indexOf("ctrl") != -1) ? true : false;
        var shift = (hotKey.indexOf("shift") != -1) ? true : false;
        var alt = (hotKey.indexOf("alt") != -1) ? true : false;

        if(
            e.key.toLowerCase() === key &&
            e.altKey === alt &&
            e.ctrlKey === ctrl &&
            e.shiftKey === shift
        ){
            this._pconWindow.style.display = "block";
            this._pconStdIn.focus();
        }
    }
    else {
        this._pconWindow.style.display = "block";
    }
}

// Add hot key
PAGECONSOLE.prototype._addHotKeyToDisplayConsoleWindow = function(){
    if(this._config.hotKey)
        document.addEventListener('keyup',this._showHideConsoleWindow.bind(this),false);
    else
        this._showHideConsoleWindow();
}


// Default config
PAGECONSOLE.prototype._defaultConfig = {
    hotKey:             "Esc",
    disableStyles:      false,
    domClasses:         ["pageconsole-window","pageconsole-input","pageconsole-output"],
    stdOut:             true,
    hideOnExecCommand:  false,
    greeting:           document.title || "Welcome!",
    maxOutputLines:     5,
}


