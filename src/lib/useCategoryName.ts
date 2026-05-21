import { useTranslation } from "react-i18next";

const KNOWN_IDS = new Set([
  "rdv","today","week","month","events","needs","goals","ideas","sport","physique","health",
  "savings","invest","income","income-res","income-sol","problems","problems-res","problems-sol",
  "flaws","qualities","good-habits","bad-habits","debts","credits","leisure","__main__",
]);

export function useCategoryName() {
  const { t } = useTranslation();
  return (id: string, fallback: string) =>
    KNOWN_IDS.has(id) ? t(`categories.${id}`, { defaultValue: fallback }) : fallback;
}
