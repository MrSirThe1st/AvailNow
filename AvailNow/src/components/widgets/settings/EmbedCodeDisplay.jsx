import React, { useState } from "react";
import { Check, Clipboard, Code } from "lucide-react";
import toast from "react-hot-toast";

const EmbedCodeDisplay = ({ embedCode }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy code to clipboard:", err);
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Embed Code</h3>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <Check size={16} className="mr-1 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Clipboard size={16} className="mr-1" />
              Copy Code
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <div className="absolute top-3 left-3 text-gray-400">
          <Code size={16} />
        </div>

        <pre className="bg-gray-50 p-4 pl-10 rounded-md overflow-auto text-sm border text-gray-700 max-h-60">
          {embedCode}
        </pre>
      </div>

      <p className="mt-4 text-xs text-gray-600">
        This code automatically adapts to both desktop and mobile devices. Copy
        and paste it into your website where you want the widget to appear.
      </p>
    </div>
  );
};

export default EmbedCodeDisplay;
