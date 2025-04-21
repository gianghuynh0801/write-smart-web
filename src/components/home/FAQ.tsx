
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const { t } = useTranslation('faq');

  return (
    <div className="container py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
        <p className="text-gray-600 text-lg">
          {t('description')}
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {t(`questions.${index}.question`)}
              </AccordionTrigger>
              <AccordionContent>
                {t(`questions.${index}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
