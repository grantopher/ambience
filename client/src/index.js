"use strict";
exports.__esModule = true;
var _ = require("lodash");
var jsmediatags = require("../../node_modules/jsmediatags/dist/jsmediatags.min.js");
var launchpadctrl_1 = require("./launchpad/launchpadctrl");
var padMap_1 = require("./launchpad/padMap");
var main;
var audiolocation = 'sound/';
var availableSoundFiles = [];
navigator
    .requestMIDIAccess()
    .then(function (midi) {
    var i = midi.inputs;
    //@ts-ignore
    var inputs = i.values();
    //@ts-ignore
    var outputs = midi.outputs.values();
    var min, mout;
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        min = input.value;
    }
    for (var out = outputs.next(); out && !out.done; out = outputs.next()) {
        mout = out.value;
    }
    main = new launchpadctrl_1.LaunchPadCtrl(min, mout);
    // start();
});
function start() {
    var id = 0;
    main.reset();
}
function createAudioElement(source, id, type) {
    var template = document.createElement('template');
    template.innerHTML = '<audio id="' + id + '" loop><source src="' + audiolocation + source + '" type="' + type + '"></audio>';
    return template.content.firstChild;
}
var fileIn = document.getElementById('folder');
fileIn.onchange = function (event) {
    availableSoundFiles = _.reduce(fileIn.files, function (all, file) {
        if (file.type.match('audio')) {
            var filemeta = {
                filename: file.name,
                type: file.type
            };
            jsmediatags.read(file, {
                onSuccess: function (result) {
                    filemeta.title = result.tags.title;
                    var p = document.createElement('div');
                    p.innerHTML = result.tags.title;
                    p.className = 'blocky';
                    document.getElementById('titles').appendChild(p);
                }
            });
            all.push(filemeta);
        }
        return all;
    }, []);
    main.reset();
    availableSoundFiles.forEach(function (song, n) {
        var elem = createAudioElement(song.filename, n, song.type);
        document.getElementById('audiowrap').appendChild(elem);
        main.mapNew(n - (Math.floor(n / 8) * 8), Math.floor(n / 8), new padMap_1.Pad(n, song));
    });
};
