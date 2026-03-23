import type { WitchHatAtelierSpellEditor as SpellType } from "../types/spell";
import { createJsonEditor, jsonEditor } from "./form";
import { rebuildAvailableSymbols } from "./symbols";

import symbols from "./data/symbols.json";
import schema from "./schemas/spell.json";





type objectType = { [key: string]: any };
type propertiesType = { [key: string]: objectType };

const spellBase64ParamName = "spell";





function deleteRedundantValue(
    object: objectType,
    properties: propertiesType,
    valueName: string
) {
    const definitionsJson: propertiesType = schema.definitions;
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





export function shrinkSpell(originalSpell: SpellType) {
    // Cloning, otherwise JSONEditor acts weird
    const spell = structuredClone(originalSpell);
    const spellProperties = schema.properties;
    const sealProperties = schema.properties.seals.items.properties;
    const ringProperties = sealProperties.rings.items.properties;
    const sigilProperties = sealProperties.sigils.items.properties;
    const signProperties = sealProperties.signs.items.properties;



    // Ignoring: version
    deleteRedundantValue(spell, spellProperties, "name")
    deleteRedundantValue(spell, spellProperties, "description")
    deleteRedundantValue(spell, spellProperties, "grid")
    deleteRedundantValue(spell, spellProperties, "background")
    deleteRedundantValue(spell, spellProperties, "backgroundColor")



    // Deleting custom images if none are present
    if (spell.custom?.images?.length === 0)
        delete spell?.custom;



    for (const seal of spell?.seals ?? []) {
        // Ignoring: rings, sigils, signs
        deleteRedundantValue(seal, sealProperties, "visible")
        deleteRedundantValue(seal, sealProperties, "name")
        deleteRedundantValue(seal, sealProperties, "angle")
        deleteRedundantValue(seal, sealProperties, "scale")
        deleteRedundantValue(seal, sealProperties, "offsetX")
        deleteRedundantValue(seal, sealProperties, "offsetY")



        // Deleting items in the lists
        for (const ring of seal?.rings ?? []) {
            for (const valueName in ring) {
                deleteRedundantValue(ring, ringProperties, valueName);
            }
        }

        for (const sigil of seal?.sigils ?? []) {
            for (const valueName in sigil) {
                // Skipping "name" since it shouldn't really have a default value
                if (valueName === "name") continue;
                deleteRedundantValue(sigil, sigilProperties, valueName);
            }
        }

        for (const sign of seal?.signs ?? []) {
            for (const valueName in sign) {
                // Skipping "name" since it shouldn't really have a default value
                if (valueName === "name") continue;
                deleteRedundantValue(sign, signProperties, valueName);
            }
        }



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





export async function base64urlDeflateRawEncode(input: string): Promise<string> {
    const stream = new Response(input).body!.pipeThrough(new CompressionStream("deflate-raw"));
    const buffer = await new Response(stream).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function base64urlDeflateRawDecode(input: string): Promise<string> {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const stream = new Response(bytes).body!.pipeThrough(new DecompressionStream("deflate-raw"));
    const decompressed = await new Response(stream).arrayBuffer();
    return new TextDecoder().decode(decompressed);
}










// Functions called by buttons presses

export function btn_downloadImage() {
    const spellName = jsonEditor.getValue().name as string;
    const canvas = document.getElementById('spell-canvas') as HTMLCanvasElement;

    const dataURL = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = spellName && spellName.length > 0 ? spellName + ".png" : "spell.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function btn_loadSpellJson() {
    const spellJson = document.getElementById('spell-json') as HTMLTextAreaElement;

    try {
        const newSpell = JSON.parse(spellJson.value);

        rebuildAvailableSymbols(schema, symbols, newSpell);
        createJsonEditor(newSpell);
    } catch (e) {
        console.error("Failed to load spell:", e);
    }
}

export async function btn_downloadSpellJson() {
    const spellText = JSON.stringify(shrinkSpell(jsonEditor.getValue()), null, 2);
    const spellName = jsonEditor.getValue().name as string;
    const fileName = spellName && spellName.length > 0 ? spellName + ".json" : "spell.json";

    try {
        const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(spellText);
        await writable.close();
    } catch (e: any) {
        if ((e as Error).name === 'AbortError') return; // User cancelled

        // Fallback to quick download if save dialog is unsupported (*cough* Firefox *cough*)
        console.warn("Activating download fallback:", e);

        const link = document.createElement('a');
        const blob = new Blob([spellText], { type: 'application/json' });
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export async function btn_uploadSpellJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const spellText = await file.text();

        try {
            const newSpell = JSON.parse(spellText);

            rebuildAvailableSymbols(schema, symbols, newSpell);
            createJsonEditor(newSpell);
        } catch (e) {
            console.error('Invalid JSON file:', e);
        }
    };

    input.click();
}



// Functions for updating the UI

export async function updateSpellLink() {
    const spellLink = document.getElementById('spell-link') as HTMLAnchorElement;

    if (spellLink) {
        const encodedData = await base64urlDeflateRawEncode(JSON.stringify(shrinkSpell(jsonEditor.getValue())));

        spellLink.href = `${window.location.origin}${window.location.pathname}?${spellBase64ParamName}=${encodedData}`;
        spellLink.textContent = spellLink.href;
    }
}

export function updateSpellJson() {
    const spellJson = document.getElementById('spell-json') as HTMLTextAreaElement;

    if (spellJson) {
        const spellText = JSON.stringify(shrinkSpell(jsonEditor.getValue()), null, 2);
        spellJson.value = spellText;
    }
}



// Copy to clipboard
export async function copyToClipboard(text?: string) {
    if (text && text.length > 0) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }
}