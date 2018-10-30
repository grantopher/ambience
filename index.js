var main;

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
	constructor(midiIn, midiOut) {
		this._in = midiIn;
		this._out = midiOut;

		this._mapped_pads = {};
		this._in.onmidimessage = this.MIDIEventHandler.bind(this); // must bind this to event callbacks
	}

	reset() {
		this._out.send([LOPTS, 0x00, 0x00]);
		this._out.send([LOPTS, 0x00, 0x01]);
	}

	locateXY(x, y) { // range 0-7
		return x + (y * 16);
	}

	setAll(color) {
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				let coord = this.locateXY(x, y);
				this._out.send([PAD, coord, color]);
			}
		}
	}

	mapNew(x, y, mapping) {
		let mapCoord = this.locateXY(x, y);
		this._mapped_pads[mapCoord] = mapping;
		this.activatePad(mapCoord);
	}

	MIDIEventHandler(MIDIEvent) {
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

	checkMap(coord) {
		return this._mapped_pads[coord];
	}

	activatePad(coord) {
		this._out.send([PAD, coord, COLORS.DGREEN]);
	}

	blink(coord) {
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
	constructor (id, meta) {
		this._dom = document.getElementById(id);

		this._volume = 0;
		this._g_rate = 0.05;
		this._meta = meta;
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

	fadeIn(t) {
		if (this._volume < 1) {
			var newVol = this._volume + this.easeQuadIn(t, 1, 0, 4000);
			this._volume = Math.min(newVol.toFixed(4), 1);
			this._dom.volume = this._volume.toFixed(4);
			setTimeout(this.fadeIn.bind(this), 10, t+10);
		}
	}

	fadeOut(t) {
		if (this._volume > 0) {
			var newVol = this.easeQuadOut(t, 0, 1, 4000);
			this._volume = Math.max(newVol.toFixed(4), 0);
			this._dom.volume = this._volume.toFixed(4);
			setTimeout(this.fadeOut.bind(this), 10, t+10);
		} else {
			this._dom.pause();
		}
	}

	easeQuadOut(t, b, c, d) {
		t /= d;
		return (t-1) * (t-1);
	}

	easeQuadIn(t, b, c, d) {
		t/=d;
		return t * t * t;
	}
}

navigator
	.requestMIDIAccess()
	.then((maccess) => {
		console.log(maccess);
		    midi = maccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    		var inputs = midi.inputs.values();
    		var outputs = midi.outputs.values();
    		var min, mout;
    		// loop over all available inputs and listen for any MIDI input
    		for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        		// each time there is a midi message call the onMIDIMessage function
        		min = input.value
    		}	

    		for (var out = outputs.next(); out && !out.done; out = outputs.next() ) {
    			mout = out.value;
    		}
    		main = new LaunchPadCtrl(min, mout);

    		// start();
	});

function onMIDIMessage (message) {
	console.log(message.data);
}



function start() {
	let id = 0
	main.reset();
	main.mapNew(3,3, new PadMap('test1'));
	main.mapNew(2,2, new PadMap('test2'));

	songmap.forEach(function (song) {
		var aElem = createAudioElement(song.filename, song.id, song.type);
		document.getElementById('audiowrap').appendChild(aElem);
		main.mapNew(song.coordinates.x, song.coordinates.y, new PadMap(song.id));
	});
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
			}
			jsmediatags.read(file, {
				onSuccess: function (result) {
					console.log(result);
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
		main.mapNew(n - (Math.floor(n / 8) * 8), Math.floor(n / 8), new PadMap(n, song))
	});
}
