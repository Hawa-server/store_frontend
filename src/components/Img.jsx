import { useState } from "react";

export const PLACEHOLDER = "/placeholder.svg";

export default function Img({ src, srcSet, alt, loading = "lazy", ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const broken = !src || failedSrc === src;

  return (
    <img
      src={broken ? PLACEHOLDER : src}
      srcSet={broken ? undefined : srcSet}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => {
        if (!broken) setFailedSrc(src);
      }}
      {...props}
    />
  );
}
