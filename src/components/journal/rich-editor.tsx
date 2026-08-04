import { useEffect, useRef, useState } from "react"
import { Bold, Italic, Underline, List, ListOrdered, Quote, Undo, Redo } from "lucide-react"
import { cn } from "@/lib/utils"

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (ref.current && mounted && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
  }, [value, mounted])

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    if (ref.current) onChange(ref.current.innerHTML)
    ref.current?.focus()
  }

  const tools = [
    { icon: Bold, cmd: "bold", label: "Bold" },
    { icon: Italic, cmd: "italic", label: "Italic" },
    { icon: Underline, cmd: "underline", label: "Underline" },
    { icon: List, cmd: "insertUnorderedList", label: "Bullet list" },
    { icon: ListOrdered, cmd: "insertOrderedList", label: "Numbered list" },
    { icon: Quote, cmd: "formatBlock", val: "blockquote", label: "Quote" },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-card/40 backdrop-blur focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div className="flex items-center gap-1 border-b border-border bg-card/30 px-2 py-1.5">
        {tools.map((t) => (
          <button
            key={t.cmd}
            type="button"
            title={t.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd, t.val)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <t.icon className="h-4 w-4" />
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          title="Undo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("undo")}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("redo")}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder}
        className={cn(
          "min-h-[280px] max-w-none p-4 text-sm leading-relaxed focus:outline-none",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "empty:before:text-muted-foreground/50 empty:before:content-[attr(data-placeholder)]"
        )}
      />
    </div>
  )
}
