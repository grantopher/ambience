import { BasePad, filemeta } from 'interfaces';

export class Pad implements BasePad {
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