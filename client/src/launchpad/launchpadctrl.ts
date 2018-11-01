import { Pad } from "./padMap";
import { PadMap } from './interfaces';

const LOPTS = 0xB0;
const PAD = 0x90;
const COLORS = {
	DGREEN: 0x1C,
	AGREEN: 0x3C,
	YGREEN: 0x2C,
	AMBER: 0x3F
};
const GRIDSIZE = 8;

export class LaunchPadCtrl {
	_in: WebMidi.MIDIInput;
	_out: WebMidi.MIDIOutput;
	_mapped_pads: PadMap<Pad>
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

	locateXY(x: number, y: number): string { // range 0-7
		return String(x + (y * 16));
	}

	setAll(color: number) {
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				let coord = this.locateXY(x, y);
				this._out.send([PAD, Number(coord), color]);
			}
		}
	}

	mapNew(x: number, y: number, mapping: Pad) {
		let mapCoord = this.locateXY(x, y);
		this._mapped_pads[mapCoord] = mapping;
		this.activatePad(Number(mapCoord));
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

	checkMap(coord: number): Pad{
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