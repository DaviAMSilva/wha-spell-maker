import { createJsonEditor } from "./form";
import { btn_downloadImage, btn_downloadSpellJson, btn_loadSpellJson, btn_uploadSpellJson } from "./io";

export default function updateCustomTabs() {
    document.getElementById("about-container")!.appendChild(
        <div class="container my-3">
            <p class="h2">About</p>
            <p>A spell editor for creating custom spells based on the Witch Hat Atelier manga series by Kamome Shirahama.</p>
            <p>Created by <a href="http://www.reddit.com/user/DaviAMSilva" target="_blank" rel="noopener noreferrer">DaviAMSilva</a></p>
            <br />
            <p class="h2">How to use:</p>
            <p>Instructions</p>
        </div>
    );
    document.getElementById("import-export-container")!.appendChild(
        <div class="container my-3">
            <button id="download-image" title="Download the current spell as an image" type="button" class="btn btn-primary me-2" onclick={btn_downloadImage}><i class="fas fa-download" /> Download Image</button>
            <button id="clear-spell" title="Will clear the editor to an empty spell" type="button" class="btn btn-danger me-2" onclick={() => createJsonEditor(null)}><i class="fas fa-triangle-exclamation" /> Clear Spell</button>

            <div class="d-flex btn-group col-md-12 my-3" role="group">
                <a id="spell-link" class="btn btn-outline-secondary text text-start text-truncate flex-grow-1" href="#" target="_blank" rel="noopener noreferrer"></a>
                <button id="copy-link" type="button" class="btn btn-secondary flex-shrink-1"><i class="fas fa-copy"></i></button>
            </div>

            <div class="btn-group" role="group">
                <button id="copy-json" title="Copy JSON to clipboard" type="button" class="btn btn-success"><i class="fas fa-copy"></i> Copy</button>
                <button id="load-json" title="Load JSON into the editor" type="button" class="btn btn-success me-2" onclick={btn_loadSpellJson}><i class="fas fa-upload"></i> Load</button>
            </div>

            <div class="btn-group" role="group">
                <button id="download-json" title="Download to JSON file" type="button" class="btn btn-success" onclick={btn_downloadSpellJson}><i class="fas fa-download" /> Download</button>
                <button id="upload-json" title="Upload from JSON file" type="button" class="btn btn-success" onclick={btn_uploadSpellJson}><i class="fas fa-upload" /> Upload</button>
            </div>

            <textarea id="spell-json" class="mt-3 form-control" placeholder="Spell JSON Code Here" />
        </div>
    );
}