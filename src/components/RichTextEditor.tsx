
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Toolbar cấu hình các tính năng cần thiết
const toolbarOptions = [
  [{ 'font': [] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  ["bold", "italic", "underline", "strike"],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'align': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  ["blockquote", "code-block"],
  ["clean"]
];

// Module config
const modules = {
  toolbar: toolbarOptions,
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "Nội dung bài viết ..."
}) => {
  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        style={{ minHeight: 220 }}
      />
    </div>
  );
};

export default RichTextEditor;
