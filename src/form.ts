import { JSONEditor } from "@json-editor/json-editor";
import Handlebars from "handlebars";
import { WitchHatAtelierSpellMaker as SpellType } from "../types/spell";
import { base64urlDeflateRawDecode, updateSpellJson, updateSpellLink } from "./io";
import updateOptGroups from "./optgroups";
import { highlightInfo, myp5 } from "./sketch";
import { loadCustomImages, rebuildAvailableSymbols } from "./symbols";
import updateCustomTabs from "./tabs";

import symbols from "./data/symbols.json";
import schema from "./schemas/spell.json";



let jsonEditor: JSONEditor;



// Helps remove the number in the title inside templates
Handlebars.registerHelper("titleWithoutNumber", function (title) {
    return title.replace(/[ ]\d+$/, "");
});



// Observes the entire document body for any changes that involve activating (clicking) a tab
const activeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (
            mutation.attributeName === 'class' &&
            (mutation.target as HTMLElement).classList.contains('active') &&
            (mutation.target as HTMLElement).classList.contains('nav-link')
        ) {
            const changedSeal = document.querySelector("#Spell-Seals.active #Seal>li>a.nav-link.active");
            const changedRing = document.querySelector("#Spell-Seals.active #Seal>.tab-pane.active #Seal-Rings.active .nav-link.active");
            const changedSigil = document.querySelector("#Spell-Seals.active #Seal>.tab-pane.active #Seal-Sigils.active .nav-link.active");
            const changedSign = document.querySelector("#Spell-Seals.active #Seal>.tab-pane.active #Seal-Signs.active .nav-link.active");
            const changedLine = document.querySelector("#Spell-Seals.active #Seal>.tab-pane.active #Seal-Lines.active .nav-link.active");

            const lastSeal = highlightInfo.seal;
            const lastType = highlightInfo.type;
            const lastIndex = highlightInfo.index;

            if (changedSeal) {
                const sealIndex = [...changedSeal?.parentElement?.parentElement?.children ?? []].indexOf(changedSeal?.parentElement as Element);

                if (changedRing) {
                    highlightInfo.seal = sealIndex;
                    highlightInfo.type = "ring";
                    highlightInfo.index = [...changedRing?.parentElement?.parentElement?.children ?? []].indexOf(changedRing?.parentElement as Element);
                } else if (changedSigil) {
                    highlightInfo.seal = sealIndex;
                    highlightInfo.type = "sigil";
                    highlightInfo.index = [...changedSigil?.parentElement?.parentElement?.children ?? []].indexOf(changedSigil?.parentElement as Element);
                } else if (changedSign) {
                    highlightInfo.seal = sealIndex;
                    highlightInfo.type = "sign";
                    highlightInfo.index = [...changedSign?.parentElement?.parentElement?.children ?? []].indexOf(changedSign?.parentElement as Element);
                } else if (changedLine) {
                    highlightInfo.seal = sealIndex;
                    highlightInfo.type = "line";
                    highlightInfo.index = [...changedLine?.parentElement?.parentElement?.children ?? []].indexOf(changedLine?.parentElement as Element);
                } else {
                    highlightInfo.seal = null;
                    highlightInfo.type = null;
                    highlightInfo.index = null;
                }
            } else {
                highlightInfo.seal = null;
                highlightInfo.type = null;
                highlightInfo.index = null;
            }

            // Only need to redraw if any of these changed
            if (lastSeal !== highlightInfo.seal || lastType !== highlightInfo.type || lastIndex !== highlightInfo.index) {
                if (myp5) myp5.redraw();
            }

            // We only care to update once, so stop the loop
            return;
        }
    }
});



export function createJsonEditor(newSpell: SpellType | null) {
    // It's better to do this every time a new editor is created
    rebuildAvailableSymbols(schema, symbols, newSpell);

    // Destroy previous editor if exists
    if (jsonEditor) {
        jsonEditor.destroy();
    }

    const options: { [key: string]: any } = {
        schema: schema,
        theme: "bootstrap5",
        iconlib: "fontawesome5",
        template: "handlebars",
        disable_edit_json: true,
        disable_collapse: true,
        array_controls_top: true,
        no_additional_properties: true,
        disable_properties: true,
        required_by_default: true,
        use_default_values: true
    };

    // Using a starting value if available
    if (newSpell) options.startval = newSpell;

    // Creating the editor
    jsonEditor = new JSONEditor(document.getElementById("jsoneditor-container"), options);



    // Necessary for Handlebars to be used by JSONEditor
    window.Handlebars = Handlebars;

    // Not strictly necessary but useful
    window.jsonEditor = jsonEditor;



    // Adds groups to sigils and signs select lists
    jsonEditor.on("ready", async () => {
        // Update select groups
        updateOptGroups();

        // Load custom images now that p5 and editor are ready
        await loadCustomImages(jsonEditor.getValue());

        // Redrawing the p5 canvas
        if (myp5) myp5.redraw();

        // Update custom tabs HTML contents
        updateCustomTabs();

        // Updating dynamic fields
        updateSpellJson();
        updateSpellLink();

        // Fixing title formatting
        document.querySelector(".je-object__title")?.classList.remove("h3");
        document.querySelector(".je-object__title")?.classList.add("h1");

        // Being efficient by only starting observing after it is built
        activeObserver.disconnect();
        activeObserver.observe(document.body, { subtree: true, attributeFilter: ['class'] });
    });

    jsonEditor.on("addRow", () => updateOptGroups());

    jsonEditor.on("change", () => {
        // Saving spell to localStorage
        localStorage.setItem("lastSpell", JSON.stringify(jsonEditor.getValue()));

        // Redrawing the p5 canvas
        if (myp5) myp5.redraw();

        // Updating dynamic fields
        updateSpellJson();
        updateSpellLink();

        // Fix some elements with incorrect light mode
        document.querySelectorAll(".bg-light").forEach(el => el.classList.remove("bg-light"));

        // For sigils, make the maximum of amountSkip equal to amount - 1
        // Sometimes will trigger redraw a second time
        Object.keys(jsonEditor.editors).forEach(key => {
            // Match editors like root.seals.X.signs.Y
            if (key.match(/^root\.seals\.\d+\.signs\.\d+$/)) {
                const editor = jsonEditor.editors[key];
                const amountEditor = editor?.editors?.amount;
                const amountSkipEditor = editor?.editors?.amountSkip;
                if (amountEditor && amountSkipEditor) {
                    const amountValue = amountEditor.getValue();
                    const amountSkipValue = amountSkipEditor.getValue();
                    if (amountSkipEditor.input) {
                        amountSkipEditor.input.max = amountValue - 1;
                    }
                    if (amountValue - 1 < amountSkipValue) {
                        amountSkipEditor.setValue(amountValue - 1);
                    }
                    amountSkipEditor.refreshValue();
                }
            }
        });
    });



    JSONEditor.defaults.callbacks = {
        "button": {
            "rebuildEditor": () => {
                createJsonEditor(jsonEditor.getValue());
            }
        }
    };
}



// Trying to load the spell previously saved on localStorage or from the url query param
let lastSpell: SpellType | null = null;
let spellText: string | null = null;

try {
    // Getting the spell param from the url
    const urlParams = new URLSearchParams(window.location.search);
    const spellParam = urlParams.get("spell");

    // Clear spell params immediately after loading the page
    window.history.replaceState({}, document.title, window.location.pathname);

    // Trying first to load from query param (with confirmation), otherwise from localStorage
    if (spellParam && confirm("Loading a spell from a link will erase your current spell.\nAre you sure you want to continue?")) {
        spellText = await base64urlDeflateRawDecode(spellParam);
    } else {
        spellText = localStorage.getItem("lastSpell");
    }

    if (spellText) lastSpell = JSON.parse(spellText);
} catch {
    console.error("Failed to load spell: ", spellText);
}



createJsonEditor(lastSpell);



export { jsonEditor };
