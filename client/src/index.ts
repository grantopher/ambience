import * as _ from 'lodash';
import * as jsmediatags from '../../node_modules/jsmediatags/dist/jsmediatags.min.js';
import { mediaResult } from './launchpad/interfaces';
import { LaunchPadCtrl } from './launchpad/launchpadctrl';
import { Pad } from './launchpad/padMap';

interface filemeta {
	filename: string;
	type: string;
	title?: string;
}

var main : LaunchPadCtrl;

const audiolocation = 'sound/';

var availableSoundFiles = [];

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
			new Pad(String(n), song)
		)
	});
}
