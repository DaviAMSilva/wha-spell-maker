import p5 from "p5"

export interface Symbols {
    sigils: { [key: string]: string }
    signs: { [key: string]: string }
    forbiddens: { [key: string]: string }
    shapes: { [key: string]: string }
    tohs: { [key: string]: string }
    custom?: { [key: string]: string }
    [key: string]: { [key: string]: string }
}

export interface SymbolsImages {
    sigils: { [key: string]: p5.Image }
    signs: { [key: string]: p5.Image }
    forbiddens: { [key: string]: p5.Image }
    shapes: { [key: string]: p5.Image }
    tohs: { [key: string]: p5.Image }
    customs: { [key: string]: p5.Image }
    [key: string]: { [key: string]: p5.Image }
}
