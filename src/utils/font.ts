export type FontOrigin =
| 'em'
| 'top'
| 'bottom'
| 'lineHeight'
| 'baseline'
| 'alphabetic'
| 'median'
| 'middle'
| 'hanging'
| 'ideographic'
| 'upper'
| 'capHeight'
| 'lower'
| 'xHeight'
| 'tittle'
| 'ascent'
| 'descent'
| 'overshoot';

export interface MeasureOptions {
    family: string | string[];
    size: number;
    weight?: string;
    style?: string;
    origin?: FontOrigin;
    canvas?: HTMLCanvasElement;
    upper?: string;
    lower?: string;
    descent?: string;
    ascent?: string;
    tittle?: string;
    overshoot?: string;
}

interface MeasureCache {
    [family: string]: MeasureFamily;
}

type MeasureFamily = {
    [key in FontOrigin]?: number;
};

const measureCanvas = document.createElement('canvas')

const measureCache: MeasureCache = {};

export function measureFontMetrics (
    options: MeasureOptions
) {
    const family = Array.isArray(options.family) ? options.family.join(', ') : options.family
	if (!family) throw Error('`family` must be defined')
    const fs = options.size
    const weight = options.weight || ''
    const style = options.style || ''
    const font = [style, weight, fs].join(' ') + 'px ' + family
    const origin = options.origin || 'top'

    if (measureCache[family]) {
        const familyCache = measureCache[family]
        if (fs <= familyCache.em!) {
            return applyOrigin(measureCache[family], 0, origin)
        }
    }

    const canvas = options.canvas || measureCanvas
    const ctx = canvas.getContext('2d')!
    const chars = {
        upper: options.upper !== undefined ? options.upper : 'H',
        lower: options.lower !== undefined ? options.lower : 'x',
        descent: options.descent !== undefined ? options.descent : 'p',
        ascent: options.ascent !== undefined ? options.ascent : 'h',
        tittle: options.tittle !== undefined ? options.tittle : 'i',
        overshoot: options.overshoot !== undefined ? options.overshoot : 'O'
    }
    const l = Math.ceil(fs * 1.5)
	canvas.height = l
	canvas.width = l * .5
	ctx.font = font

	const char = 'H'
	const result: MeasureFamily = {
		top: 0
	}

	// measure line-height
	ctx.clearRect(0, 0, l, l)
	ctx.textBaseline = 'top'
	ctx.fillStyle = 'black'
	ctx.fillText(char, 0, 0)
	const topPx = firstTop(ctx.getImageData(0, 0, l, l))
	ctx.clearRect(0, 0, l, l)
	ctx.textBaseline = 'bottom'
	ctx.fillText(char, 0, l)
	const bottomPx = firstTop(ctx.getImageData(0, 0, l, l))
    if (!!bottomPx && !!topPx) {
        result.lineHeight =
            result.bottom = l - bottomPx + topPx
    }

	// measure baseline
	ctx.clearRect(0, 0, l, l)
	ctx.textBaseline = 'alphabetic'
	ctx.fillText(char, 0, l)
	const baselinePx = firstTop(ctx.getImageData(0, 0, l, l))
    if (baselinePx != undefined && topPx != undefined) {
        result.baseline = 
            result.alphabetic = l - baselinePx + topPx
    }

	// measure median
	ctx.clearRect(0, 0, l, l)
	ctx.textBaseline = 'middle'
	ctx.fillText(char, 0, l * .5)
	const medianPx = firstTop(ctx.getImageData(0, 0, l, l))
    if (medianPx != undefined && topPx != undefined) {
        result.median =
            result.middle = l - medianPx - 1 + topPx - l * .5
    }

	// measure hanging
	ctx.clearRect(0, 0, l, l)
	ctx.textBaseline = 'hanging'
	ctx.fillText(char, 0, l * .5)
	const hangingPx = firstTop(ctx.getImageData(0, 0, l, l))
    if (hangingPx != undefined && topPx != undefined) {
        result.hanging = l - hangingPx - 1 + topPx - l * .5
    }

	// measure ideographic
	ctx.clearRect(0, 0, l, l)
	ctx.textBaseline = 'ideographic'
	ctx.fillText(char, 0, l)
	const ideographicPx = firstTop(ctx.getImageData(0, 0, l, l))
    if (ideographicPx != undefined && topPx != undefined) {
	    result.ideographic = l - ideographicPx - 1 + topPx
    }

	// measure cap
	if (chars.upper) {
		ctx.clearRect(0, 0, l, l)
		ctx.textBaseline = 'top'
		ctx.fillText(chars.upper, 0, 0)
		result.upper = firstTop(ctx.getImageData(0, 0, l, l))
        if (result.baseline != undefined && result.upper != undefined) {
		    result.capHeight = (result.baseline - result.upper)
        }
	}

	// measure x
	if (chars.lower) {
		ctx.clearRect(0, 0, l, l)
		ctx.textBaseline = 'top'
		ctx.fillText(chars.lower, 0, 0)
		result.lower = firstTop(ctx.getImageData(0, 0, l, l))
        if (result.baseline != undefined && result.lower != undefined) {
		    result.xHeight = (result.baseline - result.lower)
        }
	}

	// measure tittle
	if (chars.tittle) {
		ctx.clearRect(0, 0, l, l)
		ctx.textBaseline = 'top'
		ctx.fillText(chars.tittle, 0, 0)
		result.tittle = firstTop(ctx.getImageData(0, 0, l, l))
	}

	// measure ascent
	if (chars.ascent) {
		ctx.clearRect(0, 0, l, l)
		ctx.textBaseline = 'top'
		ctx.fillText(chars.ascent, 0, 0)
		result.ascent = firstTop(ctx.getImageData(0, 0, l, l))
	}

	// measure descent
	if (chars.descent) {
		ctx.clearRect(0, 0, l, l)
		ctx.textBaseline = 'top'
		ctx.fillText(chars.descent, 0, 0)
		result.descent = firstBottom(ctx.getImageData(0, 0, l, l))
	}

	// measure overshoot
	if (chars.overshoot) {
		ctx.clearRect(0, 0, l, l)
		ctx.textBaseline = 'top'
		ctx.fillText(chars.overshoot, 0, 0)
		const overshootPx = firstBottom(ctx.getImageData(0, 0, l, l))
        if (overshootPx != undefined && result.baseline != undefined) {
		    result.overshoot = overshootPx - result.baseline
        }
	}

	// normalize result
	for (const name in result) {
        const keyName = name as FontOrigin
        const value = result[keyName]!
        result[keyName] = value / fs
	}

	result.em = fs
    measureCache[family] = result

    return applyOrigin(result, 0, origin)
}

function applyOrigin(family: MeasureFamily, originNum: number = 0, origin?: FontOrigin)
    : MeasureFamily {
        if (!!origin) {
            if (family[origin] === undefined) throw Error(`Origin ${origin} not found in family`)
            originNum = family[origin]
        }
        const res: MeasureFamily = {}
        for (const name in family) {
            const keyName = name as FontOrigin
            if (name === 'em') continue
            const value = family[keyName]!
            res[keyName] = value - originNum
        }

        return res
}

function firstTop(iData: ImageData) {
	const l = iData.height
	const data = iData.data
	for (let i = 3; i < data.length; i+=4) {
		if (data[i] !== 0) {
			return Math.floor((i - 3) *.25 / l)
		}
	}
}

function firstBottom(iData: ImageData) {
	const l = iData.height
	const data = iData.data
	for (let i = data.length - 1; i > 0; i -= 4) {
		if (data[i] !== 0) {
			return Math.floor((i - 3) *.25 / l)
		}
	}
}