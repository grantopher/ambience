"use strict";
exports.__esModule = true;
var Pad = /** @class */ (function () {
    function Pad(id, meta) {
        this._dom = document.getElementById(id);
        this._volume = 0;
        this._g_rate = 0.05;
        this._meta = meta;
    }
    Pad.prototype.easeQuadOut = function (t, b, c, d) {
        t /= d;
        return (t - 1) * (t - 1);
    };
    Pad.prototype.easeQuadIn = function (t, b, c, d) {
        t /= d;
        return t * t * t;
    };
    Pad.prototype.fadeIn = function (t) {
        if (this._volume < 1) {
            var newVol = this._volume + this.easeQuadIn(t, 1, 0, 4000);
            this._volume = Math.min(Number(newVol.toFixed(4)), 1);
            this._dom.volume = Number(this._volume.toFixed(4));
            setTimeout(this.fadeIn.bind(this), 10, t + 10);
        }
    };
    Pad.prototype.playPause = function () {
        if (this._dom.paused) {
            console.log(this._meta.title);
            var tbox = document.getElementById('tbox');
            if (tbox) {
                tbox.innerHTML = this._meta.title;
            }
            this._dom.play();
            this.fadeIn(0);
        }
        else {
            this.fadeOut(0);
        }
    };
    Pad.prototype.fadeOut = function (t) {
        if (this._volume > 0) {
            var newVol = this.easeQuadOut(t, 0, 1, 4000);
            this._volume = Math.max(Number(newVol.toFixed(4)), 0);
            this._dom.volume = Number(this._volume.toFixed(4));
            setTimeout(this.fadeOut.bind(this), 10, t + 10);
        }
        else {
            this._dom.pause();
        }
    };
    return Pad;
}());
exports.Pad = Pad;
