import p5 from "p5"

export interface Symbols {
    sigils: { [key: string]: string }
    signs: { [key: string]: string }
    custom?: { [key: string]: string }
    [key: string]: { [key: string]: string }
}

export interface SymbolsImages {
    sigils: { [key: string]: p5.Image }
    signs: { [key: string]: p5.Image }
    customs: { [key: string]: p5.Image }
    [key: string]: { [key: string]: p5.Image }
}
