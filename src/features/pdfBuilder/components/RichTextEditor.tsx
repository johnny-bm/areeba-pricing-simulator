// Rich Text Editor Component
// A comprehensive rich text editor for PDF builder content sections

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  toolbar?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    heading1?: boolean;
    heading2?: boolean;
    heading3?: boolean;
    heading4?: boolean;
    heading5?: boolean;
    heading6?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    link?: boolean;
    image?: boolean;
    code?: boolean;
    blockquote?: boolean;
    table?: boolean;
    alignLeft?: boolean;
    alignCenter?: boolean;
    alignRight?: boolean;
    alignJustify?: boolean;
  };
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  className,
  toolbar = {
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    heading1: true,
    heading2: true,
    heading3: true,
    heading4: true,
    heading5: true,
    heading6: true,
    bulletList: true,
    orderedList: true,
    link: true,
    image: true,
    code: true,
    blockquote: true,
    table: true,
    alignLeft: true,
    alignCenter: true,
    alignRight: true,
    alignJustify: true
  }
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    if (disabled || !editorRef.current) return;
    
    // Focus the editor first
    editorRef.current.focus();
    
    // Use modern Selection API for better compatibility
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // If no selection, place cursor at end and select all text
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Apply the command
    if (command === 'formatBlock' && value) {
      // Handle heading formatting
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText && selectedText.trim()) {
        // Wrap selected text in heading tag
        const headingElement = document.createElement(value);
        headingElement.textContent = selectedText;
        range.deleteContents();
        range.insertNode(headingElement);
      } else {
        // Insert heading at cursor with placeholder
        const headingElement = document.createElement(value);
        headingElement.textContent = `Heading ${value.toUpperCase()}`;
        range.insertNode(headingElement);
        
        // Select the placeholder text so user can type over it
        const newRange = document.createRange();
        newRange.selectNodeContents(headingElement);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else if (command === 'insertHTML' && value) {
      // Handle HTML insertion (for tables, etc.)
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      range.insertNode(fragment);
    } else if (command === 'bold' || command === 'italic' || command === 'underline' || command === 'strikeThrough') {
      // Handle text formatting
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // Wrap selected text in formatting tag
        let tagName = 'span';
        let style = '';
        
        switch (command) {
          case 'bold':
            tagName = 'strong';
            break;
          case 'italic':
            tagName = 'em';
            break;
          case 'underline':
            tagName = 'u';
            break;
          case 'strikeThrough':
            tagName = 's';
            break;
        }
        
        const formatElement = document.createElement(tagName);
        formatElement.textContent = selectedText;
        range.deleteContents();
        range.insertNode(formatElement);
      } else {
        // Apply formatting to current position
        document.execCommand(command, false, value);
      }
    } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // Handle list creation
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // Convert selected text to list
        const listType = command === 'insertUnorderedList' ? 'ul' : 'ol';
        const listElement = document.createElement(listType);
        const listItem = document.createElement('li');
        listItem.textContent = selectedText;
        listElement.appendChild(listItem);
        
        range.deleteContents();
        range.insertNode(listElement);
      } else {
        // Insert empty list
        const listType = command === 'insertUnorderedList' ? 'ul' : 'ol';
        const listElement = document.createElement(listType);
        const listItem = document.createElement('li');
        listItem.textContent = 'List item';
        listElement.appendChild(listItem);
        
        range.insertNode(listElement);
      }
    } else {
      // Fallback to execCommand for other operations
      document.execCommand(command, false, value);
    }
    
    // Update content
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (content !== value) {
        onChange(content);
      }
    }
  };

  const checkSelection = () => {
    const selection = window.getSelection();
    const hasTextSelected = selection && selection.toString().length > 0;
    setHasSelection(hasTextSelected);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      execCommand('insertHTML', '<br>');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    execCommand('insertText', text);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows (1-10):', '3');
    const cols = prompt('Number of columns (1-10):', '3');
    
    if (rows && cols && !isNaN(Number(rows)) && !isNaN(Number(cols))) {
      const rowCount = Math.min(Math.max(1, Number(rows)), 10);
      const colCount = Math.min(Math.max(1, Number(cols)), 10);
      
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
      
      for (let i = 0; i < rowCount; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < colCount; j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
        }
        tableHTML += '</tr>';
      }
      
      tableHTML += '</table>';
      execCommand('insertHTML', tableHTML);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    isActive = false, 
    disabled: buttonDisabled = false 
  }: {
    onClick: () => void;
    children: React.ReactNode;
    isActive?: boolean;
    disabled?: boolean;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled || buttonDisabled}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("border rounded-lg", className)}>
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        {hasSelection && (
          <div className="text-xs text-muted-foreground mr-2">
            Text selected - formatting will be applied
          </div>
        )}
        {toolbar.bold && (
          <ToolbarButton onClick={() => execCommand('bold')}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.italic && (
          <ToolbarButton onClick={() => execCommand('italic')}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.underline && (
          <ToolbarButton onClick={() => execCommand('underline')}>
            <Underline className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.strikethrough && (
          <ToolbarButton onClick={() => execCommand('strikeThrough')}>
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
        )}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {toolbar.heading1 && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h1')}>
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.heading2 && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h2')}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.heading3 && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h3')}>
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.heading4 && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h4')}>
            <Heading4 className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.heading5 && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h5')}>
            <Heading5 className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.heading6 && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h6')}>
            <Heading6 className="h-4 w-4" />
          </ToolbarButton>
        )}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {toolbar.bulletList && (
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.orderedList && (
          <ToolbarButton onClick={() => execCommand('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        )}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {toolbar.alignLeft && (
          <ToolbarButton onClick={() => execCommand('justifyLeft')}>
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.alignCenter && (
          <ToolbarButton onClick={() => execCommand('justifyCenter')}>
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.alignRight && (
          <ToolbarButton onClick={() => execCommand('justifyRight')}>
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.alignJustify && (
          <ToolbarButton onClick={() => execCommand('justifyFull')}>
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        )}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {toolbar.link && (
          <ToolbarButton onClick={insertLink}>
            <Link className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.image && (
          <ToolbarButton onClick={insertImage}>
            <Image className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.table && (
          <ToolbarButton onClick={insertTable}>
            <Table className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.code && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'pre')}>
            <Code className="h-4 w-4" />
          </ToolbarButton>
        )}
        {toolbar.blockquote && (
          <ToolbarButton onClick={() => execCommand('formatBlock', 'blockquote')}>
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseUp={checkSelection}
        onKeyUp={checkSelection}
        className={cn(
          "rich-text-editor min-h-[200px] p-4 focus:outline-none",
          disabled && "cursor-not-allowed opacity-50",
          isFocused && "ring-2 ring-ring ring-offset-2"
        )}
        style={{ 
          minHeight: '200px',
          ...(value === '' && { 
            '&::before': {
              content: `"${placeholder}"`,
              color: '#9ca3af',
              position: 'absolute',
              pointerEvents: 'none'
            }
          })
        }}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

// Simple text editor for basic content
export function SimpleTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}
