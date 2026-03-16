export default function updateDynamicTabs() {
    document.getElementById("about-container")!.appendChild(
        <span>About Content</span>
    )
    document.getElementById("import-export-container")!.appendChild(
        <span>Import / Export Content</span>
    );
}