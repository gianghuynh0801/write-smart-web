
import { useArticleSave } from "./article/useArticleSave";
import { useArticlePublish } from "./article/useArticlePublish";
import { useArticleValidation } from "./article/useArticleValidation";

export const useArticleActions = () => {
  const { isSaving, handleSave } = useArticleSave();
  const { isPublishing, handlePublish } = useArticlePublish();
  const { validateArticleContent } = useArticleValidation();

  return {
    isPublishing,
    isSaving,
    handleSave,
    handlePublish,
    validateArticleContent
  };
};
