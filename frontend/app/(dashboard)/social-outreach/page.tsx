"use client"
import { TooltipProvider } from "@/shared/components/ui/tooltip"
import { PdfFileList } from "./components/PdfFileList"
import { XlsxPreview } from "./components/XlsxPreview"
import { useSocialOutreach } from "./useSocialOutreach"

export default function SocialOutreachGenerator() {
  const outreach = useSocialOutreach()

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-5rem)] bg-background">
        <PdfFileList
          files={outreach.files}
          extractedData={outreach.extractedData}
          isProcessing={outreach.isProcessing}
          fileInputRef={outreach.fileInputRef}
          handleFileInput={outreach.handleFileInput}
          removeFile={outreach.removeFile}
          removeAllFiles={outreach.removeAllFiles}
        />
        <XlsxPreview
          extractedData={outreach.extractedData}
          expandedIds={outreach.expandedIds}
          toggleExpanded={outreach.toggleExpanded}
          updateField={outreach.updateField}
          updateLineaAccion={outreach.updateLineaAccion}
          addEstudiante={outreach.addEstudiante}
          updateEstudiante={outreach.updateEstudiante}
          removeEstudiante={outreach.removeEstudiante}
          exportToXLSX={outreach.exportToXLSX}
        />
      </div>
    </TooltipProvider>
  )
}
