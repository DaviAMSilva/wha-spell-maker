import { WitchHatAtelierSpellEditor } from "../types/spell";
import { SymbolsImages } from "../types/symbols";
import { jsonEditor } from "./form";

import { symbolsImages, myp5 } from "./sketch";

export function rebuildAvailableSymbols(schema: any, symbols: SymbolsImages, lastSpell: WitchHatAtelierSpellEditor | null) {
    const schemaSigils = schema.properties.seals.items.properties.sigils;
    const schemaSigns = schema.properties.seals.items.properties.signs;

    const sigilKeys = Object.keys(symbols.sigils);
    const signKeys = Object.keys(symbols.signs);


    let customImages: any[] = [];
    if (lastSpell && lastSpell.custom && Array.isArray(lastSpell.custom.images)) {
        customImages = lastSpell.custom.images;
    } else if (jsonEditor) {
        customImages = jsonEditor.getEditor("root.custom.images").getValue();
    }

    const customKeys = customImages.map((i: any) => i.name);
    customImages.forEach(async (img: any) => {
        if (img.file && img.name) {
            const symbolImage = await myp5.loadImage(img.file);
            symbolImage.resize(
                myp5.constrain(symbolImage.width, 100, 1000),
                myp5.constrain(symbolImage.height, 100, 1000)
            );
            symbolsImages.customs["custom_" + img.name] = symbolImage;
        }
    });



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
