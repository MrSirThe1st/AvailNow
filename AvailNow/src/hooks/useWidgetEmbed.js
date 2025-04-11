import { useState, useEffect } from "react";
import { generateWidgetEmbedCode } from "../lib/widgetService";

/**
 * Custom hook to manage widget embed code generation
 * @param {string} userId - User ID
 * @param {Object} settings - Widget settings
 * @returns {Object} - Embed code and related methods
 */
export const useWidgetEmbed = (userId, settings) => {
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Generate embed code when settings change
  useEffect(() => {
    if (!userId || !settings) return;

    try {
      const code = generateWidgetEmbedCode(userId, settings);
      setEmbedCode(code);
      setError(null);
    } catch (err) {
      console.error("Error generating embed code:", err);
      setError("Failed to generate embed code");
    }
  }, [userId, settings]);

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      setError("Failed to copy to clipboard");
      return false;
    }
  };

  // Generate iframe code for standalone page
  const generateIframeCode = (height = "500px") => {
    return `<iframe src="https://yourusername.availnow.com" width="100%" height="${height}" frameborder="0"></iframe>`;
  };

  // Generate standalone page URL
  const getStandalonePageUrl = () => {
    return `https://yourusername.availnow.com`;
  };

  // Copy standalone page URL to clipboard
  const copyStandalonePageUrl = async () => {
    try {
      await navigator.clipboard.writeText(getStandalonePageUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Error copying standalone page URL:", err);
      setError("Failed to copy URL to clipboard");
      return false;
    }
  };

  return {
    embedCode,
    copied,
    error,
    copyToClipboard,
    generateIframeCode,
    getStandalonePageUrl,
    copyStandalonePageUrl,
  };
};

export default useWidgetEmbed;
