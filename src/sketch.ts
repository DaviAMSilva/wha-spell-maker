import p5 from "p5";
import type { Sign as SignType, WitchHatAtelierSpellEditor as SpellType } from "../types/spell";
import type { SymbolsImages } from "../types/symbols";
import { jsonEditor } from "./form";

import symbolsJson from "./data/symbols.json";
import spellJson from "./schemas/spell.json";

// Stores the symbols images
const symbolsImages: SymbolsImages = {
    sigils: {},
    signs: {},
    customs: {}
};

const sketch = (p: p5) => {
    // Drawing defaults, for fallback purposes
    const defaults: any = {};

    let brushBuddy: p5.Image;

    let centerX = 500;
    let centerY = 500;



    // #region SETUP
    p.setup = async () => {
        const canvas = p.createCanvas(1000, 1000);
        const sealContainer = document.querySelector("#spell-container");

        if (sealContainer)
            canvas.parent(sealContainer);


        brushBuddy = await p.loadImage("images/brushbuddy.webp");

        // Loading image data
        if (typeof symbolsJson == "object" && symbolsJson.sigils && symbolsJson.signs) {
            for (const sigil_name in symbolsJson.sigils) {
                symbolsImages.sigils["sigil_" + sigil_name] = await p.loadImage(symbolsJson.sigils[sigil_name as keyof typeof symbolsJson.sigils]);
            }
            for (const sign_name in symbolsJson.signs) {
                symbolsImages.signs["sign_" + sign_name] = await p.loadImage(symbolsJson.signs[sign_name as keyof typeof symbolsJson.signs]);
            }
        }

        // Loading default values from schema
        if (typeof spellJson == "object") {
            // Typically angle 0 is right, now it's up
            defaults.globalRingOffsetAngle = 270;

            defaults.spell = {
                background: spellJson.properties.background.default,
                backgroundColor: spellJson.properties.backgroundColor.default,
                color: spellJson.definitions.color.default,
                weight: spellJson.definitions.weight.default
            };

            defaults.seal = {
                visible: spellJson.definitions.visible.default,
                color: spellJson.definitions.color.default,
                angle: spellJson.definitions.angle.default,
                scale: spellJson.definitions.scale.default,
                weight: spellJson.definitions.weight.default,
                offsetX: spellJson.definitions.offset.default,
                offsetY: spellJson.definitions.offset.default
            };

            defaults.ring = {
                visible: spellJson.definitions.visible.default,
                color: spellJson.definitions.color.default,
                radius: spellJson.definitions.radius.default,
                weight: spellJson.definitions.weight.default,
                openingSize: spellJson.definitions.angle.default,
                openingAngle: spellJson.definitions.angle.default,
                offsetX: spellJson.definitions.offset.default,
                offsetY: spellJson.definitions.offset.default
            };

            defaults.sigil = {
                visible: spellJson.definitions.visible.default,
                tinted: spellJson.properties.seals.items.properties.sigils.items.properties.tinted.default,
                color: spellJson.definitions.color.default,
                size: spellJson.properties.seals.items.properties.sigils.items.properties.size.default,
                angle: spellJson.definitions.angle.default,
                offsetX: spellJson.definitions.offset.default,
                offsetY: spellJson.definitions.offset.default,

                // These aren't actually present in sigils,
                // but we loop them together so we need these
                amount: 1,
                amountSkip: 0,
                rotation: 0,
                radius: 0,
                offsetStrafe: 0
            };

            defaults.sign = {
                visible: spellJson.definitions.visible.default,
                tinted: spellJson.properties.seals.items.properties.signs.items.properties.tinted.default,
                color: spellJson.definitions.color.default,
                size: spellJson.properties.seals.items.properties.signs.items.properties.size.default,
                angle: spellJson.definitions.angle.default,
                offsetX: spellJson.definitions.offset.default,
                offsetY: spellJson.definitions.offset.default,
                offsetStrafe: spellJson.definitions.offset.default,
                amount: spellJson.properties.seals.items.properties.signs.items.properties.amount.default,
                amountSkip: spellJson.properties.seals.items.properties.signs.items.properties.amountSkip.default,
                rotation: spellJson.definitions.angle.default,
                radius: spellJson.properties.seals.items.properties.signs.items.properties.radius.default
            };
        }

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

        const spell: SpellType = jsonEditor.getValue();

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
            const allSymbols: SignType[] = [
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
                    continue;
                };



                // Creating a image that has a solid color
                // to mask with the symbol image alpha channel
                // and that can be reused in the loop below
                const colorImage = p.createImage(1, 1);

                // symbolColor: "#rrggbb"
                const r = parseInt((symbolColor as string).substring(1, 3), 16);
                const g = parseInt((symbolColor as string).substring(3, 5), 16);
                const b = parseInt((symbolColor as string).substring(5, 7), 16);
                colorImage.set(0, 0, [r, g, b, 255]);

                // colorImage.set(0, 0, p.color(symbolColor));
                // Doesn't work because of the error:
                // An error with message "p5 is not defined" occurred inside the p5js library when set was called.
                // Potentially caused by https://github.com/processing/p5.js/issues/8302

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
