import { useI18n, languageNames, type Language } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1.5" data-testid="language-switcher">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
        <SelectTrigger className="w-[120px] h-8 text-xs" data-testid="select-language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(languageNames) as [Language, string][]).map(([code, name]) => (
            <SelectItem key={code} value={code} data-testid={`lang-option-${code}`}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
