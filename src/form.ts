import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import { JSONEditor } from "@json-editor/json-editor";
import "bootstrap/dist/css/bootstrap.min.css";
import DOMPurify from "dompurify";
import Handlebars from "handlebars";
import { WitchHatAtelierSpellEditor as SpellType } from "../types/spell";
import { updateSpellJson, updateSpellLink } from "./io";
import updateOptGroups from "./optgroups";
import { myp5 } from "./sketch";
import { loadCustomImages, rebuildAvailableSymbols } from "./symbols";
import updateCustomTabs from "./tabs";

import symbols from "./data/symbols.json";
import schema from "./schemas/spell.json";



let jsonEditor: JSONEditor;



// Helps remove the number in the title inside templates
Handlebars.registerHelper("titleWithoutNumber", function (title) {
    return title.replace(/[ ]\d+$/, "");
});




export function createJsonEditor(currentSpell?: SpellType | null) {
    // Destroy previous editor if exists
    if (jsonEditor) {
        jsonEditor.destroy();
    }

    const options: {[key: string]: any} = {
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
    if (currentSpell) options.startval = currentSpell;

    jsonEditor = new JSONEditor(document.getElementById("jsoneditor-container"), options);



    // Necessary for DOMPurify and Handlebars to be used by JSONEditor
    window.DOMPurify = DOMPurify;
    window.Handlebars = Handlebars;

    // Not strictly necessary but useful
    window.jsonEditor = jsonEditor;
    window.JSONEditor = JSONEditor;



    // Adds groups to sigils and signs select lists
    jsonEditor.on("ready", () => {
        // Update select groups
        updateOptGroups();

        // Load custom images now that p5 and editor are ready
        loadCustomImages(jsonEditor.getValue());

        // Fixing title formatting
        document.querySelector(".je-object__title")?.classList.remove("h3")
        document.querySelector(".je-object__title")?.classList.add("h1")

        // Update custom tabs HTML contents
        updateCustomTabs();
    });

    jsonEditor.on("addRow", () => updateOptGroups());

    jsonEditor.on("change", () => {
        // Saving changes to localStorage
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
                rebuildAvailableSymbols(schema, symbols, jsonEditor.getValue());
                createJsonEditor(jsonEditor.getValue());
            }
        }
    };
}



let lastSpell: SpellType | null = null;

try {
    lastSpell = JSON.parse(localStorage.getItem("lastSpell") ?? "0");
} catch {
    console.error("Failed to load last spell from localStorage");
}

rebuildAvailableSymbols(schema, symbols, lastSpell);
createJsonEditor(lastSpell);



export { jsonEditor };
