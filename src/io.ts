import type { WitchHatAtelierSpellEditor as SpellType } from "../types/spell";

import spellJson from "./schemas/spell.json";





type objectType = { [key: string]: any };
type propertiesType = { [key: string]: objectType };





function deleteRedundantValue(
    object: objectType,
    properties: propertiesType,
    valueName: string
) {
    const definitionsJson: propertiesType = spellJson.definitions;
    const propertiesValue = properties[valueName];

    // Get the default expected value of the object
    let defaultValue = null;
    if (propertiesValue?.default !== undefined) {
        // Default value is in the object itself
        defaultValue = propertiesValue?.default;
    } else if ("$ref" in propertiesValue) {
        // Default value is in the global definitions
        const definitionName = (propertiesValue["$ref"] as string).replace("#/definitions/", "");
        defaultValue = definitionsJson[definitionName]?.default;
    }

    // If the value is the same as default or undefined it can be safely deleted
    if (object[valueName] === defaultValue || object[valueName] === undefined) {
        delete object[valueName];
    }
}





function shrinkSpell(originalSpell: SpellType) {
    // Cloning, otherwise JSONEditor acts weird
    const spell = structuredClone(originalSpell);
    const spellProperties = spellJson.properties;



    // Ignoring: version
    deleteRedundantValue(spell, spellProperties, "name")
    deleteRedundantValue(spell, spellProperties, "description")
    deleteRedundantValue(spell, spellProperties, "grid")
    deleteRedundantValue(spell, spellProperties, "background")
    deleteRedundantValue(spell, spellProperties, "backgroundColor")



    // Deleting custom images if none are present
    if (spell.custom?.images.length === 0)
        delete spell?.custom;



    for (const seal of spell?.seals ?? []) {
        const sealProperties = spellJson.properties.seals.items.properties;

        // Ignoring: rings, sigils, signs
        deleteRedundantValue(seal, sealProperties, "visible")
        deleteRedundantValue(seal, sealProperties, "name")
        deleteRedundantValue(seal, sealProperties, "angle")
        deleteRedundantValue(seal, sealProperties, "scale")
        deleteRedundantValue(seal, sealProperties, "offsetX")
        deleteRedundantValue(seal, sealProperties, "offsetY")



        // Deleting items in the lists
        for (const ring of seal?.rings ?? []) {
            const ringProperties = sealProperties.rings.items.properties;

            for (const valueName in ring) {
                deleteRedundantValue(ring, ringProperties, valueName);
            }
        }

        for (const sigil of seal?.sigils ?? []) {
            const sigilProperties: propertiesType = sealProperties.sigils.items.properties;

            for (const valueName in sigil) {
                deleteRedundantValue(sigil, sigilProperties, valueName);
            }
        }

        for (const sign of seal?.signs ?? []) {
            const signProperties: propertiesType = sealProperties.signs.items.properties;

            for (const valueName in sign) {
                deleteRedundantValue(sign, signProperties, valueName);
            }
        }



        // Deleting empty objects
        seal.rings = seal.rings?.filter(o => Object.keys(o).length !== 0);
        seal.sigils = seal.sigils?.filter(o => Object.keys(o).length !== 0);
        seal.signs = seal.signs?.filter(o => Object.keys(o).length !== 0);



        // Deleting empty lists
        if (seal.rings?.length === 0)
            delete seal.rings;
        if (seal.sigils?.length === 0)
            delete seal.sigils;
        if (seal.signs?.length === 0)
            delete seal.signs;
    }



    return spell;
}





async function base64urlDeflateRawEncode(input: string): Promise<string> {
    const stream = new Response(input).body!.pipeThrough(new CompressionStream("deflate-raw"));
    const buffer = await new Response(stream).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function base64urlDeflateRawDecode(input: string): Promise<string> {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const stream = new Response(bytes).body!.pipeThrough(new DecompressionStream("deflate-raw"));
    const decompressed = await new Response(stream).arrayBuffer();
    return new TextDecoder().decode(decompressed);
}