import { jsonEditor } from "./form";


// Example provided by json-editor collaborator pmk65 in https://github.com/json-editor/json-editor/issues/345
// Convert "select" list "option" tags with value prefixed by ### into "optgroup" tags
export default function updateOptGroups() {
    // Get array of editor keys where input_type = "select" and attribute "optgrup" not set
    const selectEditorKeys = Object.keys(jsonEditor.editors).filter(function (ed) {
        return jsonEditor.editors[ed] && jsonEditor.editors[ed].input_type === "select" && !jsonEditor.editors[ed].input.getAttribute("optgroup");
    });

    selectEditorKeys.forEach(function (key) {
        // Prevent the function from selecting the same element again
        jsonEditor.editors[key].input.setAttribute("optgroup", 1);

        // Get option tags prefixed with ### chars
        const opt = Array.from(jsonEditor.editors[key].input.querySelectorAll("option")).filter(function (tag: any) {
            return /^###/.test(tag.value);
        });

        opt.forEach(function (tag: any) {
            const oGroup = document.createElement("optgroup");
            oGroup.label = tag.value.replace(/^###/g, "");
            tag.parentNode.insertBefore(oGroup, tag.nextSibling);
            //tag.parentNode.removeChild(tag); // Delete prefixed option tag
            tag.style.display = "none"; // Hide prefixed option tag
        });
    });
}
