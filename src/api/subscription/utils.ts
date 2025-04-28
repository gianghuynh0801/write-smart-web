
export const parseSubscriptionFeatures = (features: any): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  
  try {
    return typeof features === 'string' 
      ? JSON.parse(features)
      : features === null || features === undefined 
        ? [] 
        : Array.isArray(JSON.parse(JSON.stringify(features)))
          ? JSON.parse(JSON.stringify(features))
          : [];
  } catch (e) {
    console.error("Lỗi khi parse tính năng gói:", e);
    return [];
  }
};
