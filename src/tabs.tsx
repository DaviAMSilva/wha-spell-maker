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

            <div class="d-flex mb-4">
                <button id="download-image" type="button" class="btn btn-sm btn-primary"
                    title="Download the current spell as an image"
                    onclick={btn_downloadImage}>
                    <i class="fas fa-download me-1" /> Download Spell Image
                </button>
                <button id="clear-spell" type="button" class="btn btn-sm btn-outline-danger ms-2"
                    title="Reset the editor to a blank spell, including clearing all custom images"
                    onclick={() => createJsonEditor(null)}>
                    <i class="fas fa-triangle-exclamation me-1" /> Reset to Blank Spell
                </button>
            </div>

            <p class="fw-semibold mb-2">Shareable Link</p>
            <div class="input-group input-group-sm mb-4">
                <button id="copy-link" type="button" class="btn btn-sm btn-outline-info"
                    title="Copy shareable link to clipboard"
                    onclick={async () => await copyToClipboard((document.getElementById("spell-link") as HTMLAnchorElement)?.href)}>
                    <i class="fas fa-copy me-1" /> Copy Link
                </button>
                <a id="spell-link" class="form-control text-truncate border-info" href="#" target="_blank" rel="noopener noreferrer" />
            </div>

            <p class="fw-semibold mb-2">Spell JSON</p>
            <div class="btn-group w-100" role="group">
                <button id="copy-json" type="button" class="btn btn-sm btn-secondary rounded-bottom-0"
                    title="Copy the JSON below to your clipboard"
                    onclick={async () => await copyToClipboard((document.getElementById("spell-json") as HTMLTextAreaElement)?.value)}>
                    <i class="fas fa-copy me-1" /> Copy JSON to Clipboard
                </button>
                <button id="load-json" type="button" class="btn btn-sm btn-secondary rounded-bottom-0"
                    title="Load the JSON below into the editor"
                    onclick={btn_loadSpellJson}>
                    <i class="fas fa-paste me-1" /> Load JSON into Editor
                </button>
                <button id="download-json" type="button" class="btn btn-sm btn-secondary rounded-bottom-0"
                    title="Save the current spell as a JSON file"
                    onclick={btn_downloadSpellJson}>
                    <i class="fas fa-download me-1" /> Save to File
                </button>
                <button id="upload-json" type="button" class="btn btn-sm btn-secondary rounded-bottom-0"
                    title="Load a spell from a JSON file"
                    onclick={btn_uploadSpellJson}>
                    <i class="fas fa-upload me-1" /> Load from File
                </button>
            </div>
            <textarea id="spell-json" class="form-control rounded-top-0 border-secondary" placeholder="Spell JSON here…" />
        </div>
    );

    divAbout?.appendChild(
        <div id="about-container">
            <p class="h3">About</p>
            <p>A spell editor for creating custom spells based on the Witch Hat Atelier manga series by Kamome Shirahama.</p>
            <p>Created by <a target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/user/DaviAMSilva">u/DaviAMSilva</a>.</p>

            <br />

            <p class="h4">How to use:</p>
            <p>Instructions</p>

            <br />

            <p class="h4">Import / Export</p>
            <p>The JSON editor reflects spell changes in real time and can be edited directly. After editing, press <strong>Load&nbsp;into&nbsp;Editor</strong> to apply any changes made.</p>
            <p>A shareable link is generated from the current state of the editor, including custom images, which can be used to restore or share your spell. Note that complex spells may exceed the maximum URL size allowed by some browsers.</p>
            <p><strong>Copy&nbsp;JSON&nbsp;to&nbsp;Clipboard</strong> copies the spell code and <strong>Reset&nbsp;to&nbsp;Empty&nbsp;Spell</strong> permanently clears the editor, including custom images.</p>
        </div>
    );
}