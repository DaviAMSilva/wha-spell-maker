import os
import base64
import json
import mimetypes

def images_to_json(base_folder, subfolders, output_file="images.json"):
    result = {}

    for sub in subfolders:
        result[sub] = {}

        sub_path = os.path.join(base_folder, sub)
        if not os.path.isdir(sub_path):
            continue

        for file in sorted(os.listdir(sub_path)):
            file_path = os.path.join(sub_path, file)

            if not os.path.isfile(file_path):
                continue

            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type and mime_type.startswith("image/"):
                with open(file_path, "rb") as f:
                    encoded = base64.b64encode(f.read()).decode("utf-8")
                result[sub][os.path.splitext(file)[0]] = f"data:{mime_type};base64,{encoded}"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4)

if __name__ == "__main__":
    base_folder = "symbols"
    subfolders = ["sigils", "signs", "customs"]
    images_to_json(base_folder, subfolders, "src/data/symbols.json")
