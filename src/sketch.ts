import p5 from "p5";
import type { Sign as SignSchema, WitchHatAtelierSpellEditor as SpellSchema } from "../types/spell";
import type { Symbols, SymbolsImages } from "../types/symbols";
import { jsonEditor } from "./form";

// Stores the symbols images
const symbolsImages: SymbolsImages = {
    sigils: {},
    signs: {},
    customs: {}
};

(window as any).symbolsImages = symbolsImages;

const sketch = (p: p5) => {
    // Drawing defaults, for fallback purposes
    const defaults: any = {};

    let brushBuddy: p5.Image;

    let centerX = 500;
    let centerY = 500;

    // #region PRELOAD
    p.preload = () => {
        brushBuddy = p.loadImage("images/brushbuddy.webp");

        // Loading image data
        p.loadJSON("data/symbols.json", (data: Symbols) => {
            if (typeof data == "object" && data.sigils && data.signs) {
                for (const sigil_name in data.sigils) {
                    symbolsImages.sigils["sigil_" + sigil_name] = p.loadImage(data.sigils[sigil_name]);
                }
                for (const sign_name in data.signs) {
                    symbolsImages.signs["sign_" + sign_name] = p.loadImage(data.signs[sign_name]);
                }
            }
        });

        p.loadJSON("schemas/spell.json", (spellSchema: any) => {
            if (typeof spellSchema == "object") {
                // Typically angle 0 is right, now it's up
                defaults.globalRingOffsetAngle = 270;

                defaults.spell = {
                    background: spellSchema.properties.background.default,
                    backgroundColor: spellSchema.properties.backgroundColor.default,
                    color: spellSchema.definitions.color.default,
                    weight: spellSchema.definitions.weight.default
                };

                defaults.seal = {
                    visible: spellSchema.definitions.visible.default,
                    color: spellSchema.definitions.color.default,
                    angle: spellSchema.definitions.angle.default,
                    scale: spellSchema.definitions.scale.default,
                    weight: spellSchema.definitions.weight.default,
                    offsetX: spellSchema.definitions.offset.default,
                    offsetY: spellSchema.definitions.offset.default
                };

                defaults.ring = {
                    visible: spellSchema.definitions.visible.default,
                    color: spellSchema.definitions.color.default,
                    radius: spellSchema.definitions.radius.default,
                    weight: spellSchema.definitions.weight.default,
                    openingSize: spellSchema.definitions.angle.default,
                    openingAngle: spellSchema.definitions.angle.default,
                    offsetX: spellSchema.definitions.offset.default,
                    offsetY: spellSchema.definitions.offset.default
                };

                defaults.sigil = {
                    visible: spellSchema.definitions.visible.default,
                    tinted: spellSchema.properties.seals.items.properties.sigils.items.properties.tinted.default,
                    color: spellSchema.definitions.color.default,
                    size: spellSchema.properties.seals.items.properties.sigils.items.properties.size.default,
                    angle: spellSchema.definitions.angle.default,
                    offsetX: spellSchema.definitions.offset.default,
                    offsetY: spellSchema.definitions.offset.default,

                    // These aren't actually present in sigils,
                    // but we loop them together so we need these
                    amount: 1,
                    amountSkip: 0,
                    rotation: 0,
                    radius: 0,
                    offsetStrafe: 0
                };

                defaults.sign = {
                    visible: spellSchema.definitions.visible.default,
                    tinted: spellSchema.properties.seals.items.properties.signs.items.properties.tinted.default,
                    color: spellSchema.definitions.color.default,
                    size: spellSchema.properties.seals.items.properties.signs.items.properties.size.default,
                    angle: spellSchema.definitions.angle.default,
                    offsetX: spellSchema.definitions.offset.default,
                    offsetY: spellSchema.definitions.offset.default,
                    offsetStrafe: spellSchema.definitions.offset.default,
                    amount: spellSchema.properties.seals.items.properties.signs.items.properties.amount.default,
                    amountSkip: spellSchema.properties.seals.items.properties.signs.items.properties.amountSkip.default,
                    rotation: spellSchema.definitions.angle.default,
                    radius: spellSchema.properties.seals.items.properties.signs.items.properties.radius.default
                };
            }
        });
    }
    // #endregion PRELOAD



    // #region SETUP
    p.setup = () => {
        const canvas = p.createCanvas(1000, 1000);
        const sealContainer = document.querySelector("#spell-container");

        if (sealContainer)
            canvas.parent(sealContainer);

        centerX = p.width / 2;
        centerY = p.height / 2;

        p.imageMode(p.CENTER);

        p.ellipseMode(p.CENTER);
        p.ellipseMode(p.RADIUS);
        p.angleMode(p.DEGREES);

        p.colorMode(p.RGB);
        p.strokeCap(p.SQUARE);
        p.strokeJoin(p.ROUND);

        p.noFill();

        p.noLoop();
    };
    // #endregion SETUP



    // #region DRAW
    p.draw = () => {
        // Editor not loaded yet
        if (!jsonEditor) {
            console.warn("Editor not loaded yet. Drawing skipped");
            p.clear();
            p.image(brushBuddy, centerX, centerY, 800, 800);
            return;
        };

        const spell: SpellSchema = jsonEditor.getValue();

        // Spell version is the field that indicates the JSON is a valid spell
        if (spell.version === undefined) {
            console.error("Spell version undefined");
            p.clear();
            p.image(brushBuddy, centerX, centerY, 800, 800);
            return;
        }



        if (spell.background ?? defaults.spell.background) {
            p.background(spell.backgroundColor ?? defaults.spell.backgroundColor);
        } else {
            // Clears the canvas (makes it transparent)
            p.clear();
        }



        // Drawing the optional grid with a opposite color as the background
        if (spell.grid ?? defaults.spell.grid) {
            const backgroundColor = (spell.grid ?? defaults.spell.grid) ? p.color(spell.backgroundColor ?? defaults.spell.backgroundColor) : p.color(defaults.spell.backgroundColor);
            const oppositeColor = p.color(255 - p.red(backgroundColor), 255 - p.green(backgroundColor), 255 - p.blue(backgroundColor));
            p.stroke(oppositeColor);
            p.strokeWeight(1);
            for (let i = 0; i <= p.width; i += 100) {
                p.line(0, i, p.height, i);
                p.line(i, 0, i, p.width);
            }
        }



        // Drawing the seals
        // #region SEALS
        for (const seal of spell.seals ?? []) {
            if (!(seal.visible ?? defaults.seal.visible))
                continue;

            const sealOffsetX = seal.offsetX ?? defaults.seal.offsetX;
            const sealOffsetY = seal.offsetY ?? defaults.seal.offsetY;
            const sealAngle = seal.angle ?? defaults.seal.angle;
            const sealScale = (seal.scale ?? defaults.seal.scale) / 100;

            p.push(); // SEAL

            p.translate(centerX + sealOffsetX, centerY + sealOffsetY);
            p.scale(sealScale);
            p.rotate(sealAngle);



            // #region SIGILS & SIGNS
            const allSymbols: SignSchema[] = [
                ...(seal.sigils ?? []).map((s: object) => Object.assign(structuredClone(s), { type: "sigil" })),
                ...(seal.signs ?? []).map((s: object) => Object.assign(structuredClone(s), { type: "sign" }))
            ];

            // Drawing the sigils and signs (collectively referred as symbols)
            for (const symbol of allSymbols) {
                const symbolName = symbol.name ?? "";
                const symbolDrawType = (symbol.type as string);
                const symbolImageType = symbolName.split("_")[0] + "s";
                const symbolDefaults = defaults[symbolDrawType];

                if (!(symbol.visible ?? symbolDefaults.visible))
                    continue;

                const symbolTinted = symbol.tinted ?? symbolDefaults.tinted;
                const symbolColor = symbol.color ?? symbolDefaults.color;
                const symbolSize = symbol.size ?? symbolDefaults.size;
                const symbolAngle = symbol.angle ?? symbolDefaults.angle;

                const symbolOffsetStrafe = symbol.offsetStrafe ?? symbolDefaults.offsetX;
                const symbolOffsetX = symbol.offsetX ?? symbolDefaults.offsetX;
                const symbolOffsetY = symbol.offsetY ?? symbolDefaults.offsetY;

                const symbolAmount = symbol.amount ?? symbolDefaults.amount;
                const symbolAmountDraw = (symbol.amount ?? symbolDefaults.amount) - (symbol.amountSkip ?? symbolDefaults.amountSkip);



                // Preventing invalid images from causing problems
                let symbolImage: p5.Image;
                if (symbolsImages[symbolImageType] && symbolsImages[symbolImageType][symbolName]) {
                    symbolImage = symbolsImages[symbolImageType][symbolName];
                } else {
                    continue
                };



                // Creating a image that has a solid color
                // to mask with the symbol image alpha channel
                // and that can be reused in the loop below
                const colorImage = p.createImage(1, 1);
                colorImage.set(0, 0, p.color(symbolColor));
                colorImage.updatePixels();
                colorImage.resize(symbolImage.width, symbolImage.height);

                // Masking the color image with the alpha channel of the symbol image
                colorImage.mask(symbolImage);



                // Drawing each of the sigils/signs in the circle
                for (let i = 0; i < symbolAmountDraw; i++) {
                    p.push(); // SIGILS & SIGNS

                    // Translate the center of the sigil location/sign circle
                    p.translate(symbolOffsetX, symbolOffsetY);

                    // The best way imagine these transformation is to imagine them
                    // happening in the opposite way they are defined in the code
                    if (symbolDrawType === "sign") {
                        // Rotate around center of the sign circle with an
                        // offset based on the index of the current sign
                        p.rotate(
                            (symbol.rotation ?? symbolDefaults.rotation) +
                            i * 360 / symbolAmount
                        );

                        // Translate to the upper part of the sign circle
                        p.translate(0, - (symbol.radius ?? symbolDefaults.radius));

                        // Translate the sigil/sign side-to-side relative
                        // to the sign circle individual sign position
                        p.translate(symbolOffsetStrafe, 0);
                    }

                    // Rotate around the sigil/sign center
                    p.rotate(symbolAngle);

                    // If the symbol is tinted, it uses the alpha channel and the color provided,
                    // otherwise it uses the original original image as is
                    if (symbolTinted) {
                        p.image(colorImage, 0, 0, symbolSize, symbolSize);
                    } else {
                        p.image(symbolImage, 0, 0, symbolSize, symbolSize);
                    }

                    // Draw debug square around the image
                    // p.stroke(255, 0, 0);
                    // p.strokeWeight(2);
                    // p.noFill();
                    // p.rectMode(p.CENTER);
                    // p.rect(0, 0, symbolSize, symbolSize);

                    p.pop(); // SIGILS & SIGNS
                }

            }
            // #endregion SIGILS & SIGNS



            // Drawing the rings
            // #region RINGS
            for (const ring of seal.rings ?? []) {
                const ringDefaults = defaults.ring;
                if (!(typeof ring.visible === "undefined" ? ringDefaults.visible : ring.visible))
                    continue;

                const ringOffsetX = ring.offsetX ?? ringDefaults.offsetX;
                const ringOffsetY = ring.offsetY ?? ringDefaults.offsetY;
                const ringRadius = ring.radius ?? ringDefaults.radius;
                const ringOpeningSize = p.map(ring.openingSize ?? ringDefaults.openingSize, 0, 360, 0, 360, true);
                const ringOpeningAngle = p.map((defaults.globalRingOffsetAngle + (ring.openingAngle ?? ringDefaults.openingAngle)) % 360, 0, 360, 0, 360, true);

                p.push(); // RING

                p.translate(ringOffsetX, ringOffsetY);

                // Using the stroke from the seal, the ring or default
                p.stroke(ring.color ?? defaults.spell.color);
                p.strokeWeight(ring.weight ?? defaults.spell.weight);

                // Fix artifact if ringOpeningSize == 360
                if (ringOpeningSize < 360) {
                    p.arc(
                        0, 0,
                        ringRadius, ringRadius,
                        (ringOpeningAngle + ringOpeningSize / 2) % 360,
                        (ringOpeningAngle - ringOpeningSize / 2) % 360 + 360
                    );
                }

                p.pop(); // RING
            }
            // #endregion RINGS

            p.pop(); // SEAL
        }
        // #endregion SEALS
    };
    // #endregion DRAW
};



const myp5 = new p5(sketch, document.body);

window.myp5 = myp5;

export { myp5, symbolsImages };
