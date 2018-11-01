export interface filemeta {
	filename: string;
	type: string;
	title?: string;
}

export interface mediaResult {
	tags: mediaTag
}

export interface mediaTag {
	title: string;
}

export interface BasePad {
	_dom: HTMLMediaElement;
	_volume: number;
	_g_rate: number;
	_meta: filemeta;
	blinking: boolean;
	color: number;
}

export interface PadMap<T> {
  [key: string]: T
}