"use strict";
exports.__esModule = true;
var LOPTS = 0xB0;
var PAD = 0x90;
var COLORS = {
    DGREEN: 0x1C,
    AGREEN: 0x3C,
    YGREEN: 0x2C,
    AMBER: 0x3F
};
var GRIDSIZE = 8;
var LaunchPadCtrl = /** @class */ (function () {
    function LaunchPadCtrl(midiIn, midiOut) {
        this._in = midiIn;
        this._out = midiOut;
        this._mapped_pads = {};
        this._in.onmidimessage = this.MIDIEventHandler.bind(this); // must bind this to event callbacks
    }
    LaunchPadCtrl.prototype.reset = function () {
        this._out.send([LOPTS, 0x00, 0x00]);
        this._out.send([LOPTS, 0x00, 0x01]);
    };
    LaunchPadCtrl.prototype.locateXY = function (x, y) {
        return String(x + (y * 16));
    };
    LaunchPadCtrl.prototype.setAll = function (color) {
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                var coord = this.locateXY(x, y);
                this._out.send([PAD, Number(coord), color]);
            }
        }
    };
    LaunchPadCtrl.prototype.mapNew = function (x, y, mapping) {
        var mapCoord = this.locateXY(x, y);
        this._mapped_pads[mapCoord] = mapping;
        this.activatePad(Number(mapCoord));
    };
    LaunchPadCtrl.prototype.MIDIEventHandler = function (MIDIEvent) {
        var data = MIDIEvent.data;
        var match = this.checkMap(data[1]);
        if (match && data[2] === 127) {
            if (match.blinking) {
                match.blinking = false;
            }
            else {
                match.blinking = true;
                this.blink(data[1]);
            }
            match.playPause();
        }
    };
    LaunchPadCtrl.prototype.checkMap = function (coord) {
        return this._mapped_pads[coord];
    };
    LaunchPadCtrl.prototype.activatePad = function (coord) {
        this._out.send([PAD, coord, COLORS.DGREEN]);
    };
    LaunchPadCtrl.prototype.blink = function (coord) {
        var pad = this._mapped_pads[coord];
        if (pad.blinking) {
            if (pad.color === COLORS.DGREEN) {
                pad.color = COLORS.YGREEN;
            }
            else {
                pad.color = COLORS.DGREEN;
            }
            this._out.send([PAD, coord, pad.color]);
            setTimeout(this.blink.bind(this, coord), 500);
        }
        else {
            this._out.send([PAD, coord, COLORS.DGREEN]);
        }
    };
    return LaunchPadCtrl;
}());
exports.LaunchPadCtrl = LaunchPadCtrl;
