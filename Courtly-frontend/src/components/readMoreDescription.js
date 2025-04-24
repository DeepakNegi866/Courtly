import { useState } from "react";

const Description = ({ text, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Safely check if 'text' is a string before attempting to split
  if (!text) {
    return <div>No description available</div>;
  }

  const words = text.split(" ");
  const truncatedText =
    words.slice(0, maxLength).join(" ") +
    (words.length > maxLength ? "..." : "");
  const fullText = words.join(" ");

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div>
      <p
        dangerouslySetInnerHTML={{
          __html: isExpanded ? fullText : truncatedText,
        }}
      ></p>
      {words.length > maxLength && (
        <button
          onClick={toggleExpanded}
          style={{ color: "blue", textDecoration: "none", border: "none" }}
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

export default Description;
