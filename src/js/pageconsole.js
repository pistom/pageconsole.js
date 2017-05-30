function Pageconsole(config) {
    config = config || {};
    if( !(this instanceof Pageconsole ) ) {
        return new Pageconsole(config);
    }
    this._config = this._extendOptions(config);
    this._pconWindow = null;
    this._pconStdIn = null;
    this._pconStdOut = null;
    this._createConsoleWindow();
    this._addHotKeyToDisplayConsoleWindow();
    this._pconStdIn.addEventListener('keyup',this._execute.bind(this),false);
    this._history = (window.localStorage.history) ? window.localStorage.getItem("history").split(",") : [];
    this._historyIndex = this._history.length-1;
    this._aliasses = (window.localStorage.aliasses) ? JSON.parse(window.localStorage.getItem("aliasses")) : {};
    this._commandsList = [];

    // INIT
    // Search for availables commands
    for (var scriptName in this){
        if (scriptName.search(/^_/) === -1){
            this._commandsList.push(scriptName)
        }
    }
    this._walk = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        { acceptNode: function(node){
            if (/\w+/.test(node.data)){
                return NodeFilter.FILTER_ACCEPT;
            }
        }},
        false
        );
    this._actualNode = document.body.firstChild;
    this._prevNode = document.body.firstChild;
    this._selectablesElems = ["P","A","H1","H2","H3","H4"];
    this._isProgramRunning = false;

    // API
    this.print = (this._config.stdOut) ? this._putStdOut : function(){console.log("Output is disabled.")};
    this.put = function(s){this._pconStdIn.value = s};
    this.clear = (this._config.stdOut) ? this._clearStdOut : function(){console.log("Output is disabled.")};
    this.hide = function(){this._pconWindow.style.display = "none"};
    this.getLine = this._getLine
}

// Clear StdIn
Pageconsole.prototype._clearStdIn = function(){
    this._pconStdIn.value = "";
};

// Clear StdOut
Pageconsole.prototype._clearStdOut = function(){
    for(var i=this._pconStdOut.childNodes.length-1; i>=0; i--)
        this._pconStdOut.removeChild(this._pconStdOut.childNodes[i])
};

// Put line to StdOut
Pageconsole.prototype._putStdOut = function(s){

        s = (s instanceof Array) ? s.join("&nbsp;") : s; // If put command run from pageconsole
        s = "<span style=\"color:"+this._config.outputTextColor+"\">"+s.replace(/<(\/?\w*)>/g,"&lt;$1&gt;").replace(/^ +/g,"&nbsp;")+"</span>";
        s = s.replace(/(\[\d;\d{2}])/g,function(){
            var captured = [].slice.call(arguments, 1, -2);
            this._config.outputTextColor = this._colors[captured[0]];
            return " </span><span style=\"color:"+this._colors[captured[0]]+"\">";
        }.bind(this));
        var line = document.createElement("div"),
            txt = (s=="") ? "\u00A0" : s;
        if(this._config.stdOut === "pageconsole"){
            line.innerHTML = txt;
            this._showHideConsoleWindow();
        }
        if(this._config.stdOut === "navigator")
            console.log(txt);
        this._pconStdOut.appendChild(line);

        while(this._pconStdOut.childNodes.length > this._config.maxOutputLines)
            this._pconStdOut.removeChild(this._pconStdOut.childNodes[0]);
};

// Execute command
Pageconsole.prototype._execute = function(e){
    // ON PRESS ENTER
    if(e.keyCode === 13){
        var inputValue = this._pconStdIn.value;
        if(!this._isProgramRunning){ // do not execute if nasted program is running
            if(this._config.stdOut)
                this.print("[1;30]"+inputValue+"[1;37]");
            this._clearStdIn();
            var command = inputValue.split(" ");
            var scriptName = command[0];

            // Search in object of aliasses
            if (scriptName in this._aliasses){
                command = this._aliasses[scriptName].split(" ");
                scriptName = command[0]
            }
            command.shift();
            try{
                this[scriptName](command);
            } catch(e) {
                if(e.name === "TypeError")
                    this.print("Command not found");
                console.log(e);
            }
        }

        this._history.push(inputValue);
        if(this._history.length > 15) this._history.shift(); // Max max number of history entries
        window.localStorage.setItem("history",this._history);
        this._historyIndex = this._history.length-1;
    }

    // ON ARROW UP/Down
    if(e.keyCode === 38) this._getCommandFromHistory("prev");
    if(e.keyCode === 40) this._getCommandFromHistory("next")
};

// Get line
Pageconsole.prototype._getLine = function(callback){
    var val = null;
    var getLine = function(e){
        if(e.keyCode === 13){
            val = this._pconStdIn.value;
            this.print(val);
            this._clearStdIn();
        }
    }.bind(this);
    this._isProgramRunning = true;
    this._pconStdIn.addEventListener("keyup",getLine,false);
    var partB = function(){
        this._pconStdIn.removeEventListener("keyup",getLine,false);
        this._isProgramRunning = false;
        callback(val);
    }.bind(this);

    var t = setInterval(function(){
        if(val != null){
            clearInterval(t);
            partB();
        }
    },500);
};

// Commands history
Pageconsole.prototype._getCommandFromHistory = function(dir){
    if(this._history.length !== 0){
        this.put(this._history[this._historyIndex]);
        if(dir === "prev")
            if(this._historyIndex > 0)
                this._historyIndex--;
        if(dir === "next")
            if(this._historyIndex<(this._history.length-1))
                this._historyIndex++;
    }
};

// Extend options
Pageconsole.prototype._extendOptions = function(config) {
    var defaultConfig = JSON.parse(JSON.stringify(this._defaultConfig));
    for(var key in defaultConfig) {
        if(key in config)
            continue;
        config[key] = defaultConfig[key];
    }
    return config;
};

// Create console window
Pageconsole.prototype._createConsoleWindow = function(){
    var df = document.createDocumentFragment(),
        pconWindow = document.createElement("div"),
        pconStdOut = document.createElement("div"),
        pconStdIn = document.createElement("input"),
        pconStdOutLine = document.createElement("div");
    pconWindow.style.display = "none";
    if(!this._config.disableStyles){
        if (this._config.position === "left")
            pconWindow.style.left = "5px";
        else
            pconWindow.style.right = "5px";
        pconWindow.style.position = "fixed";
        pconWindow.style.zIndex = "10000";
        pconWindow.style.bottom = "5px";
        pconWindow.style.width = "300px";
        pconWindow.style.padding = "5px";
        pconWindow.boxSizing = "border-box";
        pconWindow.style.fontFamily = "Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace";
        pconWindow.style.fontSize = "12px";
        pconWindow.style.background = "rgba(0,0,0,.8)";
        pconWindow.style.border = "1px solid rgba(255,255,255,.8)";
        // pconStdOut.style.marginBottom = "5px";
        // pconStdOut.style.paddingBottom = "5px";
        // pconStdOut.style.borderBottom = "1px solid rgba(255,255,255,.25)";
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
};

// Show/Hide console window
Pageconsole.prototype._showHideConsoleWindow = function(e){
    if(typeof e !== 'undefined' && this._config.hotKey){
        var hotKey = this._config.hotKey.toLowerCase().split(/ *\+ */);
        var key = (hotKey[hotKey.length-1] === "esc") ? "escape" : hotKey[hotKey.length-1];
        var ctrl = (hotKey.indexOf("ctrl") != -1);
        var shift = (hotKey.indexOf("shift") != -1);
        var alt = (hotKey.indexOf("alt") != -1);
        if(
            (e.key.toLowerCase() === "esc" && key === "escape") || // for MS Edge when esc
            (
                e.key.toLowerCase() === key &&
                e.altKey === alt &&
                e.ctrlKey === ctrl &&
                e.shiftKey === shift
            )
        ){
            this._pconWindow.style.display = "block";
            this._pconStdIn.focus();
        }
    }
    else {
        this._pconWindow.style.display = "block";
    }
};

// Add hot key
Pageconsole.prototype._addHotKeyToDisplayConsoleWindow = function(){
    if(this._config.hotKey)
        document.addEventListener('keyup',this._showHideConsoleWindow.bind(this),false);
    else
        this._showHideConsoleWindow();
};

// Colors
Pageconsole.prototype._colors = {
    "[0;30]" : "black",
    "[0;31]" : "red",
    "[0;32]" : "green",
    "[0;33]" : "orange",
    "[0;34]" : "blue",
    "[0;35]" : "purple",
    "[0;36]" : "cyan",
    "[0;37]" : "lightgray",
    "[1;30]" : "darkgray",
    "[1;31]" : "lightred",
    "[1;32]" : "lightgreen",
    "[1;33]" : "yellow",
    "[1;34]" : "lightblue",
    "[1;35]" : "mediumpurple",
    "[1;36]" : "lightcyan",
    "[1;37]" : "white"
};


// Default config
Pageconsole.prototype._defaultConfig = {
    hotKey:             "Esc",                              // string | false --- ex. "Shift+Ctrl+Z"
    disableStyles:      false,                              // boolean
    domClasses:         ["pageconsole-window","pageconsole-input","pageconsole-output"],
    stdOut:             "pageconsole",                      // false | pageconsole | navigator (consol.log())
    hideOnExecCommand:  false,                              // bolean --- hide console on press enter
    greeting:           document.title || "Welcome!",       // string --- first line
    maxOutputLines:     5,                                  // number --- max number of outputs lines
    outputTextColor:    "white",                            // string --- default color of output
    position:           "left"                              // string --- horizontal aligment
};


Pageconsole.prototype.man = function (args) {
    var tmpMaxOutputLines;
    if(args.length === 0){
        this._commandsList.sort();
        tmpMaxOutputLines = this._config.maxOutputLines;
        this._config.maxOutputLines = this._commandsList.length;
        for(var i=0; i<this._commandsList.length; i++){
            this.print(this._commandsList[i]);
        }
        this._config.maxOutputLines = tmpMaxOutputLines;
    }
    else {
        if(this[args[0]].man){
            var manual = this[args[0]].man.split("\n");
            tmpMaxOutputLines = this._config.maxOutputLines;
            this._config.maxOutputLines = manual.length;
            for(var i=0; i<manual.length; i++){
                this.print(manual[i]);
            }
            this._config.maxOutputLines = tmpMaxOutputLines;
        }
        else {
            this.print("No manual for this command.");
        }
    }
};

// Add alias
Pageconsole.prototype.alias = function(args){
    var aliasName = args.shift();
    this._aliasses[aliasName] = args.join(" ");
    window.localStorage.setItem("aliasses",JSON.stringify(this._aliasses));
};
Pageconsole.prototype.alias.man = "[1;32]Aliasses 1.0[0;37]\nProgram saves an alias to specific command.\nex.: [1;33]alias st scroll top\nst[0;37] is an alias for command [1;33]scroll top[0;37]";

// Exit console
Pageconsole.prototype.exit = function(){
    this.hide();
    this.clear();
};

// Text to speech
Pageconsole.prototype.say = function(s){
    //s = (s instanceof Array) ? s.join(" ") : s;
    if (typeof artyom !== 'undefined'){
        if(artyom.speechSupported){
            s = (!(s instanceof Array)) ? s.split(" ") : s;
            if (s[0] === "selected"){
                s.shift();
                console.log(this._actualNode);
                artyom.say(this._actualNode.parentNode.innerText);
            } else
                artyom.say(s.join(" "));
        }
        else
            this.print("Speech synthesis is not supported in your browser.")
    }
    else
        this.print("Artyom is not defined")
};
Pageconsole.prototype.say.man = "[1;32]Say It 1.0[0;37]\nProgram TextToSpeech.\nOptions:\n-[1;33]say [text]\n-[1;33]say selected (after select command)";

Pageconsole.prototype.shutup = function(){
    if (typeof artyom !== 'undefined'){
        if(artyom.speechSupported)
            artyom.shutUp();
        else
            this.print("Speech synthesis is not supported in your browser.")
    }
    else {
        this.print("Artyom is not defined")
    }
};
Pageconsole.prototype.shutup.man = "[1;32]Shut Up[0;37]\nCommand stops reading text."

// EXAMPLES OF COMMANDS ################################################################################################
// Scroll page
Pageconsole.prototype.scroll = function(args) {
    function scrolling(offset, scrollDuration){
        var i = 0;
        var scrollStep = (offset / (scrollDuration/15));
        scrollStep = Math.floor(scrollStep);
        console.log(scrollStep);
        var scrollInterval = setInterval(function(){
            window.scrollBy(0, scrollStep);
            i += Math.abs(scrollStep);
            if(i >= Math.abs(offset))
                clearInterval(scrollInterval)
        },15)
    }
    var offset = (typeof args[1] === 'undefined') ? 500 : args[1];
    if (args.length === 0)
        scrolling(offset, 500);
    else
        switch (args[0].toLowerCase()) {
            case "down":
                scrolling(offset, 500);
                break;
            case "up":
                scrolling(-offset, 500);
                break;
            case "top":
                window.scrollTo(0, 0);
                break;
            case "bottom":
                window.scrollTo(0, document.body.scrollHeight);
                break;
        }
};
Pageconsole.prototype.scroll.man = "[1;32]Scrolling 1.0[0;37]\nOptions:\n-[1;33]down\n-[1;33]down [int]\n-[1;33]up\n-[1;33]up [int]\n-[1;33]top\n-[1;33]bottom";

// Selection
Pageconsole.prototype.select = function(args) {
    while(true){
        if(args.length === 0 || args[0] === "next")
            this._actualNode = this._walk.nextNode();
        else if(args[0] === "prev")
            this._actualNode = this._walk.previousNode();

        // End of treewalker list;
        if(this._actualNode === null){
            this._actualNode = this._prevNode;
            break;
        }
        if(this._selectablesElems.indexOf(this._actualNode.parentNode.nodeName) !== -1)
            if(this._actualNode.parentNode.clientHeight > 0 && this._actualNode.parentNode.clientWidth > 0)
                break;
    }
    this._prevNode.parentNode.style.border = "";
    this._actualNode.parentNode.style.border = "2px solid red";
    function findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return [curtop];
        }
    }
    window.scrollTo(0,findPos(this._actualNode.parentNode)-60);
    this._prevNode = this._actualNode;
};
Pageconsole.prototype.select.man = "[1;32]Select element[0;37]\nOptions:\n-[1;33]next\n-[1;33]prev";


// Go to website
Pageconsole.prototype.www = function(args){
    var iframe = document.createElement("iframe");
    var iframebg = document.createElement("div");

    var step2 = function(val){
        document.body.removeChild(iframe);
        document.body.removeChild(iframebg);
        this.print("Bye...")
    };

    var websiteUrl = "";
    if(args[0]){
        if(/^(http|https):\/\//.test(args[0]))
            websiteUrl = args[0];
        else
            websiteUrl  = "http://"+args[0];

        iframe.src = websiteUrl;
        iframe.style.position = "fixed";
        iframe.style.top = "20px";
        iframe.style.left = "20px";
        iframe.style.width = "90%";
        iframe.style.height = "90%";
        iframe.style.transform = "translate(5%,5%)";
        iframe.style.zIndex = "9999";
        iframe.style.background = "#fff";
        iframebg.style.position = "fixed";
        iframebg.style.top = "0px";
        iframebg.style.left = "0px";
        iframebg.style.width = "100%";
        iframebg.style.height = "100%";
        iframebg.style.zIndex = "9998";
        iframebg.style.background = "rgba(255,255,255,.85)";
        document.body.appendChild(iframe);
        document.body.appendChild(iframebg);
        this.print("Press ENTER to exit");
        this.getLine(step2.bind(this));

    } else
        this.print("Enter a website URL");
};
Pageconsole.prototype.www.man = "[1;32]Change website[0;37]\n";
