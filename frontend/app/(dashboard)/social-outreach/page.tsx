"use client"
import { useEffect, useMemo, useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PdfFileList } from "./components/PdfFileList"
import { PdfPreviewPanel } from "./components/PdfPreviewPanel"
import { XlsxPreview } from "./components/XlsxPreview"
import { useSocialOutreach } from "./useSocialOutreach"

export default function SocialOutreachGenerator() {
  const outreach = useSocialOutreach()
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null)

  const selectedEntry = useMemo(
    () => outreach.files.find((file) => file.id === selectedPdfId) ?? null,
    [outreach.files, selectedPdfId]
  )

  useEffect(() => {
    if (selectedPdfId && !selectedEntry) {
      setSelectedPdfId(null)
    }
  }, [selectedPdfId, selectedEntry])

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-5rem)] bg-background">
        {selectedEntry ? (
          <PdfPreviewPanel
            entry={selectedEntry}
            onClose={() => setSelectedPdfId(null)}
          />
        ) : (
          <PdfFileList
            files={outreach.files}
            extractedData={outreach.extractedData}
            isProcessing={outreach.isProcessing}
            fileInputRef={outreach.fileInputRef}
            handleFileInput={outreach.handleFileInput}
            removeFile={outreach.removeFile}
            removeAllFiles={outreach.removeAllFiles}
            onSelectPdf={setSelectedPdfId}
          />
        )}
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
