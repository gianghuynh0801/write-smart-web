
import { useState } from "react";
import { OutlineItem } from "../components/ContentOutline";

export const useContentForm = () => {
  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState<string[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([
    { heading: "H2", title: "" }
  ]);
  const [webConnection, setWebConnection] = useState(true);
  const [reference, setReference] = useState("");
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(true);
  const [useList, setUseList] = useState(true);
  const [links, setLinks] = useState<Array<{ keyword: string; url: string }>>([
    { keyword: "", url: "" }
  ]);
  const [imageSize, setImageSize] = useState("medium");
  const [resolution, setResolution] = useState(72);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [optimizeImages, setOptimizeImages] = useState(true);
  
  const [language, setLanguage] = useState("vi");
  const [country, setCountry] = useState("vn");
  const [tone, setTone] = useState("Neutral");
  const [narrator, setNarrator] = useState("tự động");
  const [formality, setFormality] = useState("tự động");

  return {
    mainKeyword,
    setMainKeyword,
    subKeywords,
    setSubKeywords,
    relatedKeywords,
    setRelatedKeywords,
    outlineItems,
    setOutlineItems,
    webConnection,
    setWebConnection,
    reference,
    setReference,
    bold,
    setBold,
    italic,
    setItalic,
    useList,
    setUseList,
    links,
    setLinks,
    imageSize,
    setImageSize,
    resolution,
    setResolution,
    keepAspectRatio,
    setKeepAspectRatio,
    optimizeImages,
    setOptimizeImages,
    language,
    setLanguage,
    country,
    setCountry,
    tone,
    setTone,
    narrator,
    setNarrator,
    formality,
    setFormality,
  };
};
