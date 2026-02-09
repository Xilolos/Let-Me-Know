'use client';

import { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ExpandableTextareaProps {
    name: string;
    id?: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    minRows?: number;
    maxRows?: number;
    className?: string;
}

export default function ExpandableTextarea({
    name,
    id,
    placeholder,
    required = false,
    defaultValue = '',
    minRows = 3,
    maxRows = 15,
    className = ''
}: ExpandableTextareaProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`expandable-container ${className}`}>
            <div className="textarea-wrapper">
                <textarea
                    name={name}
                    id={id || name}
                    rows={isExpanded ? maxRows : minRows}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    required={required}
                    className="styled-textarea"
                />
                <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            <style jsx>{`
        .expandable-container {
            width: 100%;
            position: relative;
        }

        .textarea-wrapper {
            position: relative;
            width: 100%;
        }

        .styled-textarea {
            width: 100%;
            padding: 12px 40px 12px 16px; /* Right padding for button */
            transition: height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            resize: vertical;
            min-height: 80px;
        }

        .toggle-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(var(--bg-primary-rgb), 0.5);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s;
            z-index: 5;
            padding: 0;
        }

        .toggle-btn:hover {
            background: var(--bg-item);
            color: var(--text-primary);
            border-color: var(--accent-primary);
        }
      `}</style>
        </div>
    );
}
