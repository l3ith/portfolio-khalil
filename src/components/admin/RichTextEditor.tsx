"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import { adminLabelStyle } from "@/components/admin/ui";

const toolbarBtn: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid var(--rule)",
  background: "transparent",
  color: "var(--fg)",
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "background 160ms",
};

const toolbarBtnActive: React.CSSProperties = {
  ...toolbarBtn,
  background: "var(--fg)",
  color: "var(--bg)",
};

export function RichTextEditor({
  name,
  label,
  help,
  defaultValue,
  minHeight = 280,
}: {
  name: string;
  label?: string;
  help?: string;
  defaultValue: string;
  minHeight?: number;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener nofollow", target: "_blank" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
    ],
    content: defaultValue || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        style: `min-height: ${minHeight}px; padding: 16px; outline: none;`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const input = document.querySelector<HTMLInputElement>(
        `input[type="hidden"][name="${name}"]`,
      );
      if (input) input.value = editor.getHTML();
    };
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor, name]);

  if (!editor) {
    return (
      <div>
        {label && <div style={adminLabelStyle}>{label}</div>}
        <div
          style={{
            minHeight,
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
          }}
        >
          Loading editor…
        </div>
        <input type="hidden" name={name} defaultValue={defaultValue} />
      </div>
    );
  }

  const isActive = (
    actionOrAttrs: string | Record<string, unknown>,
    attrs?: Record<string, unknown>,
  ): boolean => {
    if (typeof actionOrAttrs === "string") return editor.isActive(actionOrAttrs, attrs);
    return editor.isActive(actionOrAttrs);
  };

  const onLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL (https://…)", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div>
      {label && <div style={adminLabelStyle}>{label}</div>}
      {help && (
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 6,
            opacity: 0.85,
          }}
        >
          {help}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: 6,
          border: "1px solid var(--rule)",
          borderBottom: 0,
          background: "rgba(10,10,10,0.03)",
        }}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={isActive("bold") ? toolbarBtnActive : toolbarBtn}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={isActive("italic") ? toolbarBtnActive : toolbarBtn}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={isActive("strike") ? toolbarBtnActive : toolbarBtn}
          title="Strikethrough"
        >
          S
        </button>
        <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          style={isActive("paragraph") ? toolbarBtnActive : toolbarBtn}
          title="Paragraph"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={isActive("heading", { level: 2 }) ? toolbarBtnActive : toolbarBtn}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={isActive("heading", { level: 3 }) ? toolbarBtnActive : toolbarBtn}
          title="Heading 3"
        >
          H3
        </button>
        <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={isActive("bulletList") ? toolbarBtnActive : toolbarBtn}
          title="Bulleted list"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={isActive("orderedList") ? toolbarBtnActive : toolbarBtn}
          title="Numbered list"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={isActive("blockquote") ? toolbarBtnActive : toolbarBtn}
          title="Quote"
        >
          “
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          style={isActive("code") ? toolbarBtnActive : toolbarBtn}
          title="Inline code"
        >
          {"<>"}
        </button>
        <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          style={isActive({ textAlign: "left" }) ? toolbarBtnActive : toolbarBtn}
          title="Align left"
          aria-label="Align left"
        >
          ⯇
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          style={isActive({ textAlign: "center" }) ? toolbarBtnActive : toolbarBtn}
          title="Align center"
          aria-label="Align center"
        >
          ▭
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          style={isActive({ textAlign: "right" }) ? toolbarBtnActive : toolbarBtn}
          title="Align right"
          aria-label="Align right"
        >
          ⯈
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          style={isActive({ textAlign: "justify" }) ? toolbarBtnActive : toolbarBtn}
          title="Justify"
          aria-label="Justify"
        >
          ☰
        </button>
        <span style={{ width: 1, background: "var(--rule)", margin: "0 4px" }} />
        <button
          type="button"
          onClick={onLink}
          style={isActive("link") ? toolbarBtnActive : toolbarBtn}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          style={toolbarBtn}
          title="Horizontal rule"
        >
          —
        </button>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          style={toolbarBtn}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          style={toolbarBtn}
          title="Redo"
        >
          ↷
        </button>
      </div>
      <div style={{ border: "1px solid var(--rule)", background: "rgba(10,10,10,0.02)" }}>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} defaultValue={editor.getHTML() || defaultValue} />
    </div>
  );
}
