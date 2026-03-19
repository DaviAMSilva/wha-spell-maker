import { jsonEditor } from "./form";
import { btn_downloadImage, btn_downloadSpellJSON, btn_loadSpellJSON, btn_uploadSpellJson } from "./io";

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
            <button id="download-image" title="Download the current spell as an image" type="button" class="btn btn-primary my-2" onclick={btn_downloadImage}>
                <i class="fas fa-download" /> Download Image
            </button>
            <button id="clear-spell" title="Will clear the editor to an empty spell" type="button" class="btn btn-danger my-2 ms-2" onclick={() => jsonEditor.setValue({})}>
                <i class="fas fa-triangle-exclamation" /> Clear Spell
            </button>
            <div class="btn-group col-md-12 my-4" role="group">
                <a id="spell-link" class="btn btn-outline-secondary text text-start text-truncate" href="#" target="_blank" rel="noopener noreferrer">
                    https://example.com?data=XXX
                </a>
                <button id="copy-link" type="button" class="btn btn-secondary">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="btn-group my-2 me-2 mb-3" role="group">
                <button id="copy-json" title="Copy JSON to clipboard" type="button" class="btn btn-success">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button id="load-json" title="Load JSON into the editor" type="button" class="btn btn-success" onclick={btn_loadSpellJSON}>
                    <i class="fas fa-upload"></i> Load
                </button>
            </div>
            <div class="btn-group my-2 mb-3" role="group">
                <button id="download-json" title="Download to JSON file" type="button" class="btn btn-success" onclick={btn_downloadSpellJSON}>
                    <i class="fas fa-download" /> Download Spell JSON
                </button>
                <button id="upload-json" title="Upload from JSON file" type="button" class="btn btn-success" onclick={btn_uploadSpellJson}>
                    <i class="fas fa-upload" /> Upload Spell JSON
                </button>
            </div>
            <textarea id="spell-json" class="form-control" placeholder="Spell JSON Code Here" />
        </div>
    );
}