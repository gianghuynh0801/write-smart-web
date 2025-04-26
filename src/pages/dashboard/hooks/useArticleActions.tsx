
import { useArticleSave } from "./article/useArticleSave";
import { useArticlePublish } from "./article/useArticlePublish";

export const useArticleActions = () => {
  const { isSaving, handleSave } = useArticleSave();
  const { isPublishing, handlePublish } = useArticlePublish();

  return {
    isPublishing,
    isSaving,
    handleSave,
    handlePublish
  };
};
