import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import { JSONEditor } from "@json-editor/json-editor";
import "bootstrap/dist/css/bootstrap.min.css";
import DOMPurify from "dompurify";
import Handlebars from "handlebars";
import { WitchHatAtelierSpellEditor as SpellType } from "../types/spell";
import { Symbols } from "../types/symbols";
import updateDynamicTabs from "./html";
import { setOptGroups } from "./optgroups";
import { myp5 } from "./sketch";
import { loadCustomImages, rebuildAvailableSymbols } from "./symbols";

import symbols from "./data/symbols.json";
import schema from "./schemas/spell.json";



let jsonEditor: JSONEditor;



// Helps remove the number in the title inside templates
Handlebars.registerHelper("titleWithoutNumber", function (title) {
    return title.replace(/[ ]\d+$/, "");
});




function createJsonEditor(schema: any, symbols: Symbols, currentSpell: SpellType) {
    // Destroy previous editor if exists
    if (jsonEditor) {
        jsonEditor.destroy();
    }

    jsonEditor = new JSONEditor(document.getElementById("jsoneditor-container"), {
        schema: schema,
        startval: (currentSpell && currentSpell.version) ? currentSpell : { version: "000" },
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
    });

    // Necessary for DOMPurify and Handlebars to be used by JSONEditor
    window.DOMPurify = DOMPurify;
    window.Handlebars = Handlebars;

    // Not strictly necessary but useful
    window.jsonEditor = jsonEditor;
    window.JSONEditor = JSONEditor;

    // Adds groups to sigils and signs select lists
    jsonEditor.on("ready", () => {
        setOptGroups();
        // Load custom images now that p5 and editor are ready
        loadCustomImages(jsonEditor.getValue());

        updateDynamicTabs();
    });
    jsonEditor.on("addRow", () => setOptGroups());

    jsonEditor.on("change", () => {
        // Redrawing the p5 canvas
        if (myp5) myp5.redraw();

        // Saving changes to localStorage
        localStorage.setItem("lastSpell", JSON.stringify(jsonEditor.getValue()));

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
                rebuildAvailableSymbols(schema, symbols, jsonEditor.getValue());
                createJsonEditor(schema, symbols, jsonEditor.getValue());
            }
        }
    };
}



let lastSpell: SpellType = { version: "000" };

try {
    lastSpell = JSON.parse(localStorage.getItem("lastSpell") ?? "0");
} catch {
    console.error("Failed to load last spell from localStorage");
}

rebuildAvailableSymbols(schema, symbols, lastSpell);
createJsonEditor(schema, symbols, lastSpell);



export { jsonEditor };
