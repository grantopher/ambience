import * as _ from 'lodash';
import * as jsmediatags from '../node_modules/jsmediatags/dist/jsmediatags.min.js';
// import * as jsmediatags from 'jsmediatags';

interface filemeta {
	filename: string;
	type: string;
	title?: string;
}

interface mediaResult {
	tags: mediaTag
}

interface mediaTag {
	title: string;
}

interface Map<T> {
	[key: string]: T
}

var main : LaunchPadCtrl;

const LOPTS = 0xB0;
const PAD = 0x90;
const COLORS = {
	DGREEN: 0x1C,
	AGREEN: 0x3C,
	YGREEN: 0x2C,
	AMBER: 0x3F
};
const GRIDSIZE = 8;
const audiolocation = 'sound/';

var availableSoundFiles = [];

class LaunchPadCtrl {
	_in: WebMidi.MIDIInput;
	_out: WebMidi.MIDIOutput;
	_mapped_pads: Map<PadMap>
	constructor(midiIn: WebMidi.MIDIInput, midiOut: WebMidi.MIDIOutput) {
		this._in = midiIn;
		this._out = midiOut;

		this._mapped_pads = {};
		this._in.onmidimessage = this.MIDIEventHandler.bind(this); // must bind this to event callbacks
	}

	reset() {
		this._out.send([LOPTS, 0x00, 0x00]);
		this._out.send([LOPTS, 0x00, 0x01]);
	}

	locateXY(x: number, y: number) { // range 0-7
		return x + (y * 16);
	}

	setAll(color: number) {
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				let coord = this.locateXY(x, y);
				this._out.send([PAD, coord, color]);
			}
		}
	}

	mapNew(x: number, y: number, mapping: PadMap) {
		let mapCoord = this.locateXY(x, y);
		this._mapped_pads[mapCoord] = mapping;
		this.activatePad(mapCoord);
	}

	MIDIEventHandler(MIDIEvent: WebMidi.MIDIMessageEvent) {
		let data = MIDIEvent.data;
		let match = this.checkMap(data[1]);
		if (match && data[2] === 127) {
			if (match.blinking) {
				match.blinking = false;
			} else {
				match.blinking = true;
				this.blink(data[1]);
			}
			match.playPause();
		}
	}

	checkMap(coord: number) {
		return this._mapped_pads[coord];
	}

	activatePad(coord: number) {
		this._out.send([PAD, coord, COLORS.DGREEN]);
	}

	blink(coord: number) {
		let pad = this._mapped_pads[coord];
		if (pad.blinking) {
			if (pad.color === COLORS.AGREEN) {
				pad.color = COLORS.YGREEN;
			} else {
				pad.color = COLORS.AGREEN;
			}
			this._out.send([PAD, coord, pad.color]);
			setTimeout(this.blink.bind(this, coord), 500);
		}
	}
}

class PadMap {
	_dom: HTMLMediaElement;
	_volume: number;
	_g_rate: number;
	_meta: filemeta;
	blinking: boolean;
	color: number;
	constructor (id: string, meta?: filemeta) {
		this._dom = document.getElementById(id) as HTMLMediaElement;

		this._volume = 0;
		this._g_rate = 0.05;
		this._meta = meta;
	}

	easeQuadOut(t: number, b: number, c: number, d: number) {
		t /= d;
		return (t-1) * (t-1);
	}

	easeQuadIn(t: number, b: number, c: number, d: number) {
		t/=d;
		return t * t * t;
	}

	fadeIn(t: number) {
		if (this._volume < 1) {
			var newVol = this._volume + this.easeQuadIn(t, 1, 0, 4000);
			this._volume = Math.min(
				Number(newVol.toFixed(4)), 
				1
			);
			this._dom.volume = Number(this._volume.toFixed(4));
			setTimeout(this.fadeIn.bind(this), 10, t+10);
		}
	}

	playPause() {
		if (this._dom.paused) {
			console.log(this._meta.title);
			var tbox = document.getElementById('tbox');
			if (tbox) {
				tbox.innerHTML = this._meta.title;
			}
			this._dom.play()
			this.fadeIn(0);
		} else {
			this.fadeOut(0);
		}
	}


	fadeOut(t: number) {
		if (this._volume > 0) {
			var newVol = this.easeQuadOut(t, 0, 1, 4000);
			this._volume = Math.max(Number(newVol.toFixed(4)), 0);
			this._dom.volume = Number(this._volume.toFixed(4));
			setTimeout(this.fadeOut.bind(this), 10, t+10);
		} else {
			this._dom.pause();
		}
	}
}

navigator
	.requestMIDIAccess()
	.then((midi: WebMidi.MIDIAccess) => {
			var i:WebMidi.MIDIInputMap = midi.inputs;

			//@ts-ignore
			var inputs = i.values();
			//@ts-ignore
			var outputs = midi.outputs.values();
			var min, mout;
			for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
					min = input.value
			}	

			for (var out = outputs.next(); out && !out.done; out = outputs.next() ) {
				mout = out.value;
			}
			main = new LaunchPadCtrl(min, mout);

			// start();
	});



function start() {
	let id = 0
	main.reset();

	songmap.forEach(function (song) {
		var aElem = createAudioElement(song.filename, song.id, song.type);
		document.getElementById('audiowrap').appendChild(aElem);
		main.mapNew(song.coordinates.x, song.coordinates.y, new PadMap(String(song.id)));
	});
}

function createAudioElement(source:  string, id: string | number, type: string) :HTMLMediaElement{
    var template = document.createElement('template');
    template.innerHTML = '<audio id="' + id + '" loop><source src="' + audiolocation + source + '" type="' + type + '"></audio>';
    return template.content.firstChild as HTMLMediaElement;
}

var fileIn = document.getElementById('folder') as HTMLInputElement;
fileIn.onchange = function (event) {
	availableSoundFiles = _.reduce(fileIn.files, function (all, file) {
		if (file.type.match('audio')) {
			var filemeta: filemeta = {
				filename: file.name,
				type: file.type
			}
			jsmediatags.read(file, {
				onSuccess: function (result: mediaResult) {
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
	availableSoundFiles.forEach(function (song: filemeta, n: number) {
		var elem = createAudioElement(song.filename, n, song.type);
		document.getElementById('audiowrap').appendChild(elem);
		main.mapNew(
			n - (Math.floor(n / 8) * 8), Math.floor(n / 8),
			new PadMap(String(n), song)
		)
	});
}
