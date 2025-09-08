import React from "react";

const TokenImage = ({
  token,
  className = "w-8 h-8",
  alt,
  fallback = null,
  onError = null,
}) => {
  const getImageSrc = (tokenSymbol) => {
    const symbol = tokenSymbol?.toLowerCase();
    switch (symbol) {
      case "usdt":
        return "/usdt.png";
      case "usdc":
        return "/usdc.png";
      case "usd":
      case "mockusd":
        return "/Vpay.png";
      default:
        return `/Vpay.png`; // Default fallback
    }
  };

  const handleError = (e) => {
    console.error(`Failed to load image for token: ${token}`, e);
    if (onError) {
      onError(e);
    } else if (fallback) {
      e.target.style.display = "none";
      if (e.target.nextSibling) {
        e.target.nextSibling.style.display = "inline";
      }
    }
  };

  const imageSrc = getImageSrc(token);

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt || token || "Token"}
        className={className}
        onError={handleError}
        onLoad={() => console.log(`Successfully loaded image: ${imageSrc}`)}
      />
      {fallback && (
        <div
          className={`${className} bg-gradient-to-r from-[#475B74] to-[#475B74] flex items-center justify-center text-white text-xs font-bold`}
          style={{ display: "none" }}
        >
          {fallback}
        </div>
      )}
    </div>
  );
};

export default TokenImage;
