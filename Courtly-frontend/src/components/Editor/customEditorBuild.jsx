import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CustomEditorBuild = ({ value, onChange }) => {
  return (
    <div className="ckEditor">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          toolbar: [
            "heading",
            "style",
            "|",
            "bold",
            "italic",
            "underline",
            "subscript",
            "superscript",
            "link",
            "bulletedList",
            "numberedList",
            "todoList",
            "|",
            "outdent",
            "indent",
            "alignment",
            "|",
            "fontBackgroundColor",
            "fontColor",
            "fontFamily",
            "fontSize",
            "horizontalLine",
            "imageInsert",
            "pageBreak",
            "htmlEmbed",
            "removeFormat",
            "selectAll",
            "showBlocks",
            "sourceEditing",
            "codeBlock",
            "specialCharacters",
            "code",
            "findAndReplace",
            "strikethrough",
            "imageUpload",
            "blockQuote",
            "insertTable",
            "mediaEmbed",
            "undo",
            "redo",
          ],
        }}
      />
    </div>
  );
};

export default CustomEditorBuild;
