
import LanguageSelector from "./settings/LanguageSelector";
import CountrySelector from "./settings/CountrySelector";
import ToneInput from "./settings/ToneInput";
import NarratorSelector from "./settings/NarratorSelector";
import FormalitySelector from "./settings/FormalitySelector";

interface ContentSettingsProps {
  language: string;
  setLanguage: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  narrator: string;
  setNarrator: (value: string) => void;
  formality: string;
  setFormality: (value: string) => void;
}

const ContentSettings = ({
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
}: ContentSettingsProps) => {
  return (
    <div className="space-y-6">
      <LanguageSelector language={language} setLanguage={setLanguage} />
      <CountrySelector country={country} setCountry={setCountry} />
      <ToneInput tone={tone} setTone={setTone} />
      <NarratorSelector narrator={narrator} setNarrator={setNarrator} />
      <FormalitySelector formality={formality} setFormality={setFormality} />
    </div>
  );
};

export default ContentSettings;
