# pageconsole.js
A small console that allows calling scripts on website.

Live demo: [pageconsole.crayon.pro](http://pageconsole.crayon.pro/) (hotkey for show the console: `Esc`).

This script allows running any functionality in a small console-like window. It can be useful to create various behaviors and scripts to automate tasks run as commands in console window.

## Installation
Download the `pageconsole.js` library and include it to your page:
```js
<script src="pageconsole.js"></script>
```
## Add a console
```js
Pageconsole();
```
or
```js
window.pageconsole = new Pageconsole();
```
With options
```js
window.pageconsole = new Pageconsole({
     hotKey:             "Esc",
     position:           "left",
     maxOutputLines:     15
});
```
## Options 
* **hotKey** - `string` | `false`, default: `"Esc"` (example: `"Shift+Ctrl+Z"`)
* **disableStyles** - `boolean`, default: `false`
* **domClasses** - `array`, default: `["pageconsole-window","pageconsole-input","pageconsole-output"]`
* **stdOut** - `false` | `"pageconsole"` | `"navigator"` (consol.log()) , default: `"pageconsole"`
* **hideOnExecCommand** - `boolean`, default: `false`
* **greeting** - `string`, default: `document.title` or `"Welcome!"`
* **maxOutputLines** - `number`
* **outputTextColor** - `string`, default: `"white"`
* **position** - `string`, default: `"left"`


## API Reference
```js
print("string")     // Print a string in console output
put("string")       // Put a string in console input
clear()             // Clear console output
hide()              // Hide console window
getLine(function)   // Get the value of console input and pass it to the definied function.
say("string")       // Read a string (It requires an external library)
shutup()            // Stop reading text
```

## Examples
First word in a command is the name of called function. Rest of them are an array of arguments.
#### Display alert
```js

Pageconsole.prototype.alert = function(args){
    var text = args.join(" ");
    alert(text);
    this.print("Alert displayed")
};
new Pageconsole();


```
Use: `alert This is alert`

#### Say hello
```js

Pageconsole.prototype.hello = function(){
    var name;
    var sayHello = function(val){
        name = val;
        this.print("Hello [0;33]"+name);
        
        // For activate text to speech include artyom.js library
        this.say("Hello "+name); 
    };
    this.print("Your name:");
    this.getLine(sayHello.bind(this));
};
new Pageconsole();

```
Use: `hello`

## Functionalities
### Manuals
Type `man` for display all availables commands.
For create a manual use prototype.
```js
Pageconsole.prototype.hello.man = "Manual text..."
```

### Colors
You can colorize your outputs strings.
```js
"This is [0;33]orange [1;37]color and [1;36] lightcyan [1;37]one."
```
##### List of colors
    [0;30] - black
    [0;31] - red
    [0;32] - green
    [0;33] - orange
    [0;34] - blue
    [0;35] - purple
    [0;36] - cyan
    [0;37] - lightgray
    [1;30] - darkgray
    [1;31] - lightred
    [1;32] - lightgreen
    [1;33] - yellow
    [1;34] - lightblue
    [1;35] - mediumpurple
    [1;36] - lightcyan
    [1;37] - white   
### TextToSpeech
For activate text to speech include [artyom.js](https://sdkcarlos.github.io/sites/artyom.html) library

### Aliases
You can create an alias for any command.
Type:
```js
alias a alert This is an alert
```
Then type `a` for executing `alert This is an alert` command.

The aliases are stored in browser local storage.

## Copyright and license
Code and documentation copyright 2011-2016 [Le Cinquième Crayon](http://www.cinquiemecrayon.eu). Code released under [the MIT license](https://github.com/pistom/pageconsole.js/blob/master/LICENSE.md).