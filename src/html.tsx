export default function updateCustomTabs() {
    document.getElementById("about-container")!.appendChild(
        <div class="container my-3">
            <p className="h2">About</p>
            <p>A spell editor for creating custom spells based on the Witch Hat Atelier manga series by Kamome Shirahama.</p>
            <p>Created by <a href="http://www.reddit.com/user/DaviAMSilva" target="_blank" rel="noopener noreferrer">DaviAMSilva</a></p>
            <br />
            <p className="h2">How to use:</p>
            <p>Instructions</p>
        </div>
    );
    document.getElementById("import-export-container")!.appendChild(
        <div class="container my-3">
            <button id="download-image" type="button" className="btn btn-primary my-2">Download Image</button>
            <div className="d-flex my-2 py-4" style="min-width: 0; overflow: hidden;">
                <div className="btn-group flex-shrink-0" role="group">
                    <button id="create-link" type="button" className="btn btn-secondary">Create spell link</button>
                    <button id="copy-link" type="button" className="btn btn-secondary">
                        <i className="fas fa-copy"></i>
                    </button>
                </div>
                <a id="spell-link" className="btn btn-outline-secondary ms-2 flex-grow-1 text text-start text-truncate" href="#" target="_blank" rel="noopener noreferrer">
                    https://example.com?data=XXX
                </a>
            </div>
            <div className="btn-group my-2 mb-3" role="group">
                <button id="upload-json" type="button" class="btn btn-success">Upload Spell JSON</button>
                <button id="download-json" type="button" className="btn btn-success">Download Spell JSON</button>
                <button id="copy-json" type="button" className="btn btn-success">
                    <i className="fas fa-copy"></i>
                </button>
            </div>
            <textarea id="spell-json" class="form-control" placeholder="Spell JSON Code Here" rows={15} />
        </div>
    );
}