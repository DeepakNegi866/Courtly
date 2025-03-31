import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";

const editorConfiguration = {
    toolbar: [
        'heading',
        'style',
        '|',
        'bold',
        'italic',
        'underline',
        'subscript',
        'superscript',
        'link',
        'bulletedList',
        'numberedList',
        'todoList',
        '|',
        'outdent',
        'indent',
        'alignment',
        '|',
        'fontBackgroundColor',
        'fontColor',
        'fontFamily',
        'fontSize',
        'horizontalLine',
        'imageInsert',
        'pageBreak',
        'htmlEmbed',
        'removeFormat',
        'selectAll',
        'showBlocks',
        'sourceEditing',
        'codeBlock',
        'specialCharacters',
        'code',
        'findAndReplace',
        'strikethrough',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'mediaEmbed',
        'undo',
        'redo'
    ]
};

function CustomEditor( props ) {
        return (
            <CKEditor
                editor={ Editor }
                config={ {...editorConfiguration, removePlugins:["Title"]} }
                data={ props.initialData }
                onChange={ (event, editor ) => {
                    const data = editor.getData();
                    if(props.onChange){
                        try{
                            props.onChange(data)
                        }
                        catch(error){
                            console.warn(error.message)
                        }
                    }
                } }
            />
        )
}

export default CustomEditor;
