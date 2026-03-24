import { createJsonEditor } from "./form";
import { btn_downloadImage, btn_downloadSpellJson, btn_loadSpellJson, btn_uploadSpellJson, copyToClipboard } from "./io";

export default function updateCustomTabs() {
    const divIO = document.querySelector("div[data-schemapath='root.io']");
    const divAbout = document.querySelector("div[data-schemapath='root.about']");

    // Some empty elements left by JSONEditor
    if (divIO && divIO.firstChild) divIO.removeChild(divIO.firstChild);
    if (divAbout && divAbout.firstChild) divAbout.removeChild(divAbout.firstChild);

    // Added for consistency with other tabs
    document.getElementById("Spell-Information")?.prepend(<p className="h3 mb-3">Spell Information</p>);
    document.querySelector("#Custom-Images .card.my-3")?.classList.remove("my-3");

    divIO?.appendChild(
        <div id="io-container">
            <p class="h3 mb-3">Import / Export</p>
            <button id="download-image" title="Download the current spell as an image" type="button" class="btn btn-sm btn-sm btn-primary me-2" onclick={btn_downloadImage}><i class="fas fa-download" /> Download Image</button>
            <button id="clear-spell" title="Will clear the editor to an empty spell, including custom images" type="button" class="btn btn-sm btn-danger me-2" onclick={() => createJsonEditor(null)}><i class="fas fa-triangle-exclamation" /> Clear Spell</button>

            <div class="d-flex btn-group col-md-12 my-3" role="group">
                <a id="spell-link" class="btn btn-sm btn-outline-secondary text text-start text-truncate flex-grow-1" href="#" target="_blank" rel="noopener noreferrer"></a>
                <button id="copy-link" type="button" class="btn btn-sm btn-secondary flex-shrink-1"
                    onclick={async () => await copyToClipboard((document.getElementById("spell-link") as HTMLAnchorElement)?.href)}
                ><i class="fas fa-copy"></i></button>
            </div>

            <div class="btn-group" role="group">
                <button id="copy-json" title="Copy JSON to clipboard" type="button" class="btn btn-sm btn-success"
                    onclick={async () => await copyToClipboard((document.getElementById("spell-json") as HTMLTextAreaElement)?.value)}
                ><i class="fas fa-copy"></i> Copy</button>
                <button id="load-json" title="Load JSON into the editor" type="button" class="btn btn-sm btn-success me-2" onclick={btn_loadSpellJson}><i class="fas fa-upload"></i> Load</button>
            </div>
            <div class="btn-group" role="group">
                <button id="download-json" title="Download to JSON file" type="button" class="btn btn-sm btn-success" onclick={btn_downloadSpellJson}><i class="fas fa-download" /> Download</button>
                <button id="upload-json" title="Upload from JSON file" type="button" class="btn btn-sm btn-success" onclick={btn_uploadSpellJson}><i class="fas fa-upload" /> Upload</button>
            </div>

            <textarea id="spell-json" class="mt-3 form-control" placeholder="Spell JSON Code Here" rows={10} />
        </div>
    );

    divAbout?.appendChild(
        <div id="about-container">
            <p class="h3">About</p>
            <p>A spell editor for creating custom spells based on the Witch Hat Atelier manga series by Kamome Shirahama.</p>
            <p>Created by <a href="http://www.reddit.com/user/DaviAMSilva" target="_blank" rel="noopener noreferrer">u/DaviAMSilva</a>.</p>
            <br />
            <p class="h3">How to use:</p>
            <p>Instructions</p>
        </div>
    );
}