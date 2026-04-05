import type { WitchHatAtelierSpellMaker as SpellType } from "../types/spell";
import { createJsonEditor } from "./form";
import { btn_downloadImage, btn_downloadSpellJson, btn_loadSpellJson, btn_uploadSpellJson, copyToClipboard } from "./io";

// Example spells for demonstration of the different features and complexities available
import pokemon from "../examples/Pokémon.json";
import sylphShoes from "../examples/Sylph Shoes.json";
import washingMachine from "../examples/Washing Machine.json";

const spellExamples: Record<string, SpellType> = {
    "pokemon": pokemon as SpellType,
    "sylph-shoes": sylphShoes as SpellType,
    "washing-machine": washingMachine as SpellType,
}

export default function updateCustomTabs() {
    const divIO = document.querySelector("div[data-schemapath='root.io']");
    const divAbout = document.querySelector("div[data-schemapath='root.about']");

    // Some empty elements left by JSONEditor
    if (divIO && divIO.firstChild) divIO.removeChild(divIO.firstChild);
    if (divAbout && divAbout.firstChild) divAbout.removeChild(divAbout.firstChild);

    // Added for consistency with other tabs
    document.getElementById("Spell-Information")?.prepend(<p class="h3 mb-3">Spell Information</p>);
    document.querySelector("#Custom-Images .card.my-3")?.classList.remove("my-3");

    divIO?.appendChild(
        <div id="io-container">
            <p class="h3 mb-3">Import / Export</p>

            <div class="d-flex mb-4">
                <button id="download-image" type="button" class="btn btn-sm btn-secondary"
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

            <p class="h4 mb-2">Spell Link</p>
            <div class="input-group input-group-sm mb-4">
                <button id="copy-link" type="button" class="btn btn-sm btn-outline-info"
                    title="Copy spell link to clipboard"
                    onclick={async () => await copyToClipboard((document.getElementById("spell-link") as HTMLAnchorElement)?.href)}>
                    <i class="fas fa-copy me-1" /> Copy Link
                </button>
                <a id="spell-link" class="form-control text-truncate border-info" href="#" target="_blank" rel="noopener noreferrer" />
            </div>

            <p class="h4 mb-2">Spell JSON</p>
            <div class="btn-group w-100" role="group">
                <button id="copy-json" type="button" class="btn btn-sm btn-secondary rounded-bottom-0"
                    title="Copy the JSON below to the clipboard"
                    onclick={async () => await copyToClipboard((document.getElementById("spell-json") as HTMLTextAreaElement)?.value)}>
                    <i class="fas fa-copy me-1" /> Copy JSON to Clipboard
                </button>
                <button id="load-json" type="button" class="btn btn-sm btn-secondary rounded-bottom-0"
                    title="Load the JSON below into the editor"
                    onclick={btn_loadSpellJson}>
                    <i class="fas fa-paste me-1" /> Load JSON Into Editor
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
            <textarea id="spell-json" class="form-control rounded-top-0 border-secondary" placeholder="Spell JSON here…" spellcheck={false} autocorrect={false} ></textarea>
        </div>
    );



    divAbout?.appendChild(
        <div id="about-container">
            <p id="about-title" class="h3">About</p>
            <div class="text-center mb-4">
                <p class="fs-3 mb-1">Created&nbsp;by&nbsp;<strong>DaviAMSilva</strong>&nbsp;<img src="images/profile.gif" alt="Profile picture" style="width: 1.4em; height: 1.4em; margin-top: -0.1em;" /></p>
                <p style="text-reset fs-6 margin-bottom: 0;">
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/DaviAMSilva/wha-spell-maker"><i class="fab fa-github" /> GitHub</a>
                    &nbsp;&mdash;&nbsp;
                    <a target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/user/DaviAMSilva"><i class="fab fa-reddit" /> Reddit</a>
                    &nbsp;&mdash;&nbsp;
                    <a target="_blank" rel="noopener noreferrer" href="https://discord.com/users/526766336534249475"><i class="fab fa-discord" /> Discord</a>
                    &nbsp;&mdash;&nbsp;
                    <a target="_blank" rel="noopener noreferrer" href="https://x.com/daviamsilva"><i class="fab fa-x-twitter" /> Twitter</a>
                </p>
            </div>

            <p class="mb-5 text-center w-75 mx-auto">This project intends to provide a way for fans to digitally create and share spells based on the <a href="https://witchhatatelier.telepedia.net/wiki/Magic">magic system</a> of the manga series <a href="https://wikipedia.org/wiki/Witch_Hat_Atelier">Witch Hat Atelier</a>, created by <a href="https://witchhatatelier.telepedia.net/wiki/Kamome_Shirahama">Kamome Shirahama</a>.</p>
            <p>The editor allows fans to brainstorm new spells by easily and quickly adding, modifying and removing the different parts of a spell and watching the result update in real time!</p>
            <p>It is very easy to use if the spell follows the standard <em>ring with signs around sigil</em> structure. However, it also allows for more complex spells if they are willing to do more in-depth customization. It is even possible to upload <a href="#about-custom-images">custom images</a> to use as symbols in a spell.</p>
            <p>The current spell is automatically saved locally on the browser, but fans may also choose to <a href="#about-import-export">save their creations</a> as a JSON file for backup or even generate a link to easily share their creation with others.</p>
            <p>And just be clear: this project is <strong>not meant to be a replacement for traditional hand drawn spells</strong>, but rather a way to make creating new spells more accessible, standardized and easier to share.</p>

            <p id="about-how-to-use" class="h4 mt-5 mb-3">How to Use:</p>
            <p>The best way to learn is by experimenting! Try adding rings, sigils, signs and lines by navigating to each tab under "Spell&nbsp;Seals" and pressing the <i title="Add" class="fas fa-plus" /> buttons, tweaking the default values of the elements, and watching the canvas update in real time.</p>
            <p>It is possible to change sizes, angles, colors, quantities and other properties of most elements, when relevant. It is also possible to duplicate, rearrange and delete elements and give them names for better organization.</p>
            <p>The editor elements have names that mostly describe what each does, but some also have a <span title="Information">ⓘ</span> button that can be hovered for additional information.</p>

            <p id="about-examples" class="h4 mt-5 mb-3">Examples</p>
            <p>Click any example below to load it into the editor. Be aware that this <strong class="text-decoration-underline">will erase the current spell</strong>.</p>
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-2">
                {[
                    { id: "sylph-shoes", label: "Sylph Shoes", description: "A simple classic spell from the series." },
                    { id: "washing-machine", label: "Washing Machine", description: <>A complex spell by <a href="https://www.reddit.com/r/WitchHatAtelier/comments/1rj2wkx/washing_machine_spell_just_toss_your_clothes_in">u/ChromaticFlare1</a>.</> },
                    { id: "pokemon", label: "Pokémon", description: "A silly spell with custom images and colors." },
                ].map(({ id, label, description }) => (
                    <div class="col">
                        <button
                            data-spell={id}
                            class="btn btn-outline-secondary btn-sm w-100 text-start h-100 d-flex flex-column align-items-start"
                            onclick={() => {
                                const spellExample = spellExamples[id];
                                if (spellExample) createJsonEditor(spellExample);
                            }}
                        >
                            <strong>{label} Spell</strong>
                            <span class="d-block text-white fw-normal">{description}</span>
                        </button>
                    </div>
                ))}
            </div>

            <p id="about-definitions" class="h4 mt-5 mb-3">Definitions:</p>
            <p>This project defines, for its own use, the following parts of a spell as such:</p>
            <dl class="row">
                <dt class="col-sm-1 text-nowrap">Spell</dt>
                <dd class="col-sm-11">An abstract representation, comprised of a design, name and description. A spell's design contains one or more seals.</dd>
                <dt class="col-sm-1 text-nowrap">Seal</dt>
                <dd class="col-sm-11">A physical realization of a spell, in the form of a drawing. A seal may contain rings, sigils, signs and lines.</dd>
                <dt class="col-sm-1 text-nowrap">Ring</dt>
                <dd class="col-sm-11">A circle, usually enclosing the sigils and signs of the spell. Can be closed or open and the inside can be colored in.</dd>
                <dt class="col-sm-1 text-nowrap">Sigil</dt>
                <dd class="col-sm-11">A symbol that controls the type of the spell. Usually placed alone at the center of the spell. A sigil can be moved in two dimensions relative to the center of the seal.</dd>
                <dt class="col-sm-1 text-nowrap">Sign</dt>
                <dd class="col-sm-11">A symbol that controls the form of the spell. Usually placed in a group around the center of the spell. A circle of signs is rotationally symmetric relative to the center of the seal.</dd>
                <dt class="col-sm-1 text-nowrap">Line</dt>
                <dd class="col-sm-11">A path containing one or more connected line segments. This part was exclusively defined for this project.</dd>
            </dl>

            <p id="about-miscellaneous-tips" class="h4 mt-5 mb-3">Miscellaneous Tips:</p>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">Angles range from 0 to 360 degrees.</li>
                <li class="list-group-item">Offsets allow moving elements vertically or horizontally relative to their original center.</li>
                <li class="list-group-item">Scaling uses percentages with a default of 100 and minimum of 1.</li>
                <li class="list-group-item">When changing values in a numeric element it is possible to use the arrow keys for better fine-tune control.</li>
                <li class="list-group-item">Symbol names for Sigils and Signs are separated in groups of names Custom, Sigils, Signs, The Owl House and Shapes for easier browsing.</li>
                <li class="list-group-item">Using the arrow keys it is possible to quickly iterate over all possible symbols for Sigils and Signs.</li>
                <li class="list-group-item">Elements that are part of a list can be duplicated with <i class="fas fa-copy" /> or reordered with <i class="fas fa-arrow-left" /> or <i class="fas fa-arrow-right" />.</li>
                <li class="list-group-item">It is possible to toggle an element's visibility to quickly identify where in the spell it is located.</li>
            </ul>

            <p id="about-custom-images" class="h4 mt-5 mb-3">Custom Images</p>
            <p>Custom images can be loaded into the editor to be used as symbols for Sigils and Signs within the spell currently being created. Note that this is not a general catalog of images; they are tied to the current spell and will be lost if the spell is cleared or overwritten.</p>
            <p>To add custom images there are three steps to be followed:</p>
            <ol class="list-group list-group-flush list-group-numbered my-2">
                <li class="list-group-item">First use the <span className="badge bg-secondary"><i class="fas fa-plus" />&nbsp;Custom&nbsp;Image</span> button to allocate as many images as necessary and give each one a unique name.</li>
                <li class="list-group-item">Then for each of the allocated images click the <span className="badge bg-secondary"><i class="fas fa-upload" />&nbsp;Upload</span> button to upload an image from your device.<br />Preferably the image should be a square with a transparent background and not larger than 500×500px.</li>
                <li class="list-group-item">Finally click the <span className="badge bg-secondary"><i class="fas fa-upload" />&nbsp;Load&nbsp;Custom&nbsp;Images</span> button at the bottom to reload the editor with the updated custom images list.</li>
            </ol>
            <p>Once the above steps were completed custom images will become an option when choosing the symbols for Sigils and Signs, under the custom name given to each one.</p>

            <p id="about-import-export" class="h4 mt-5 mb-3">Import / Export</p>
            <p>The JSON editor updates in real time to reflect the current spell, but can also be edited directly. After editing, press the <span className="badge bg-secondary"><i class="fas fa-paste" />&nbsp;Load&nbsp;JSON&nbsp;Into&nbsp;Editor</span> button to apply any changes made to the editor.</p>
            <p>A link is generated from the current state of the editor, including custom images, which can be used to restore or share the spell. Note that very complex spells may exceed the maximum URL size allowed by some browsers.</p>
            <p>The <span className="badge bg-secondary"><i class="fas fa-copy" />&nbsp;Copy&nbsp;JSON&nbsp;to&nbsp;Clipboard</span> button copies the spell code to the clipboard.</p>
            <p>The <span className="badge bg-secondary"><i class="fas fa-download" />&nbsp;Download&nbsp;Spell&nbsp;Image</span> button downloads a 1000×1000px PNG image of the current spell.</p>
            <p>The <span className="badge bg-danger"><i class="fas fa-triangle-exclamation" />&nbsp;Reset&nbsp;to&nbsp;Blank&nbsp;Spell</span> permanently clears the editor, including custom images.</p>

            <p id="about-credits-tools-used" class="h4 mt-5 mb-3">Credits</p>
            <ul class="list-group list-group-flush">
                <li class="list-group-item"><i class="me-2 fab fa-x-twitter" /><a href="https://x.com/shirahamakamome" target="_blank" rel="noopener noreferrer">Kamome Shirahama</a> for creating this amazing series, both the <a href="https://kmanga.kodansha.com/title/10065" target="_blank" rel="noopener noreferrer">manga</a> and <a href="https://tongari-anime.com/en/" target="_blank" rel="noopener noreferrer">anime</a>.</li>
                <li class="list-group-item"><i class="me-2 fas fa-book" /><a href="https://witchhatatelier.telepedia.net/wiki/Witch_Hat_Atelier_Wiki" target="_blank" rel="noopener noreferrer">Independent Witch Hat Atelier Wiki</a> for listing and providing the base designs for the signs and sigils.</li>
                <li class="list-group-item"><i class="me-2 fas fa-book" /><a href="https://theowlhouse.fandom.com/wiki/Glyph_Magic" target="_blank" rel="noopener noreferrer">The Owl House Wiki</a> for the images of the glyphs from the series. <a class="text-muted text-sm" href="https://x.com/DanaTerrace/status/1653190525720330241">(Kamome's TOH art)</a></li>
                <li class="list-group-item"><i class="me-2 fab fa-discord" /><a href="https://discord.com/invite/witchhatatelier" target="_blank" rel="noopener noreferrer">Witch Hat Atelier Discord Server</a> for being a place where you can share your spell creations.</li>
                <li class="list-group-item"><i class="me-2 fab fa-reddit" /><a href="https://www.reddit.com/r/WitchHatAtelier/" target="_blank" rel="noopener noreferrer">Witch Hat Atelier Subreddit</a> for being a place where you can share your spell creations.</li>
                <li class="list-group-item"><i class="me-2 fab fa-reddit" /><a href="https://www.reddit.com/user/ChromaticFlare1" target="_blank" rel="noopener noreferrer">u/ChromaticFlare1</a> for allowing the use of the his Washing Machine spell as one of the examples.</li>
                <li class="list-group-item"><i class="me-2 fab fa-github" /><a href="https://github.com/json-editor/json-editor" target="_blank" rel="noopener noreferrer">JSON Editor</a> the library for editing the spell JSON.</li>
                <li class="list-group-item"><i class="me-2 fab fa-square-js" /><a href="https://p5js.org" target="_blank" rel="noopener noreferrer">p5.js</a> the library for drawing the spells.</li>
            </ul>
            <p class="text-muted text-center small mt-5">
                If you find any problems with the website or have a suggestion, feel free to contact me via a <a href="https://github.com/DaviAMSilva/wha-spell-maker">GitHub Issue</a>, <a href="https://www.reddit.com/user/DaviAMSilva/">Reddit</a>, <a href="https://discord.com/users/526766336534249475">Discord</a> or <a href="https://x.com/daviamsilva">Twitter</a>.<br />
                Witch Hat Atelier manga is &copy; Kamome Shirahama / Kodansha. Witch Hat Atelier anime is &copy; BUG FILMS.<br />
                This is an unofficial fan project, not affiliated with or endorsed by the creators or publishers.
            </p>
        </div>
    );

    // Inserting it from JS to prevent it from appearing before the rest of the dynamic elements
    if (!document.getElementById("coco-canvas")) {
        document.body.appendChild(
            <img id="coco-canvas" src="images/coco-canvas.webp" alt="Coco holding the spell canvas" />
        )
    }
}