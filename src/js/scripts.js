(function(){

    Pageconsole.prototype.alert = function(args){
        var text = args.join(" ");
        alert(text);
        this.print("Alert displayed")
    };

    Pageconsole.prototype.hello = function(){
        var name;
        var sayHello = function(val){
            name = val;
            this.print("Hello [0;33]"+name);
            this.say("Hello "+name);
        };
        this.print("Your name:");
        this.getLine(sayHello.bind(this));
    };

    window.pc = new Pageconsole();
})();

