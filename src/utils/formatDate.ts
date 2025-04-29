
import { format, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale";

export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) return "Ngày không hợp lệ";
    
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  } catch (error) {
    console.error("Lỗi khi định dạng ngày:", error);
    return "Lỗi định dạng";
  }
};
