import { CustomImage, WitchHatAtelierSpellMaker as SpellType } from "../types/spell";
import { Symbols } from "../types/symbols";

import { myp5, symbolsImages } from "./sketch";

function getCustomImages(lastSpell: SpellType | null): CustomImage[] {
    if (lastSpell && lastSpell.custom && Array.isArray(lastSpell.custom.images)) {
        return lastSpell.custom.images;
    }
    return [];
}

export async function loadCustomImages(lastSpell: SpellType | null) {
    if (!lastSpell) return;

    const customImages = getCustomImages(lastSpell);

    for (const img of customImages) {
        if (img.file && img.name && myp5) {
            try {
                const symbolImage = await myp5.loadImage(img.file);
                symbolImage.resize(
                    myp5.constrain(symbolImage.width, 100, 1000),
                    myp5.constrain(symbolImage.height, 100, 1000)
                );
                symbolsImages.customs["custom_" + img.name] = symbolImage;
            } catch (error) {
                console.warn(`Failed to load custom image: ${img.name}`, error);
            }
        }
    }
}

export function rebuildAvailableSymbols(schema: any, symbols: Symbols, lastSpell: SpellType | null) {
    const schemaSigils = schema.properties.seals.items.properties.sigils;
    const schemaSigns = schema.properties.seals.items.properties.signs;

    const sigilKeys = Object.keys(symbols.sigils);
    const signKeys = Object.keys(symbols.signs);

    const customImages = getCustomImages(lastSpell);
    const customKeys = customImages.map((i: any) => i.name);

    // Setting the list of default available sigils (shared pool of images, but different orders)
    Object.assign(schemaSigils.items.properties.name, {
        enum: [
            "###Customs", ...customKeys.map(s => "custom_" + s),
            "###Sigils", ...sigilKeys.map(s => "sigil_" + s),
            "###Signs", ...signKeys.map(s => "sign_" + s)
        ],
        options: {
            enum_titles: [
                "###Custom", ...customKeys,
                "###Sigils", ...sigilKeys,
                "###Signs", ...signKeys
            ]
        }
    });
    Object.assign(schemaSigns.items.properties.name, {
        enum: [
            "###Customs", ...customKeys.map(s => "custom_" + s),
            "###Signs", ...signKeys.map(s => "sign_" + s),
            "###Sigils", ...sigilKeys.map(s => "sigil_" + s)
        ],
        options: {
            enum_titles: [
                "###Custom", ...customKeys,
                "###Signs", ...signKeys,
                "###Sigils", ...sigilKeys
            ]
        }
    });

    return schema;
}
