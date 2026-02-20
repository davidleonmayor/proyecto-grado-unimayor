import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { Textarea } from "@/shared/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { lineasAccionLabels } from "../constants"
import type { ExtractedData, LineaAccion, Estudiante } from "../types"

type ProjectCardProps = {
  data: ExtractedData
  index: number
  isExpanded: boolean
  toggleExpanded: (id: string) => void
  updateField: (dataId: string, field: "titulo" | "descripcion", value: string) => void
  updateLineaAccion: (
    dataId: string,
    linea: keyof LineaAccion,
    checked: boolean
  ) => void
  addEstudiante: (dataId: string) => void
  updateEstudiante: (
    dataId: string,
    estudianteIndex: number,
    field: keyof Estudiante,
    value: string
  ) => void
  removeEstudiante: (dataId: string, estudianteIndex: number) => void
}

export const ProjectCard = ({
  data,
  index,
  isExpanded,
  toggleExpanded,
  updateField,
  updateLineaAccion,
  addEstudiante,
  updateEstudiante,
  removeEstudiante,
}: ProjectCardProps) => {
  const activeLineas = lineasAccionLabels.filter((l) => data.lineasAccion[l.key])

  return (
    <Collapsible
      key={data.id}
      open={isExpanded}
      onOpenChange={() => toggleExpanded(data.id)}
    >
      <Card
        className={`transition-all ${isExpanded ? "ring-2 ring-primary/20" : ""}`}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate">
                  {data.titulo || "Sin título"}
                </CardTitle>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {data.fileName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeLineas.length > 0 && (
                  <div className="flex gap-1">
                    {activeLineas.slice(0, 3).map((l) => (
                      <Badge
                        key={l.key}
                        variant="secondary"
                        className="text-[10px] px-1.5"
                      >
                        {l.label.slice(0, 3).toUpperCase()}
                      </Badge>
                    ))}
                    {activeLineas.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        +{activeLineas.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {data.estudiantes.length}
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-4 space-y-5">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor={`titulo-${data.id}`}>Título del Proyecto</Label>
              <Input
                id={`titulo-${data.id}`}
                value={data.titulo}
                onChange={(e) => updateField(data.id, "titulo", e.target.value)}
                placeholder="Ingrese el título del proyecto..."
              />
            </div>
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor={`descripcion-${data.id}`}>
                Descripción del Proyecto
              </Label>
              <Textarea
                id={`descripcion-${data.id}`}
                value={data.descripcion}
                onChange={(e) =>
                  updateField(data.id, "descripcion", e.target.value)
                }
                placeholder="Ingrese la descripción del proyecto..."
                rows={3}
              />
            </div>
            {/* Líneas de Acción */}
            <div className="space-y-3">
              <Label>Líneas de Acción</Label>
              <div className="flex flex-wrap gap-4">
                {lineasAccionLabels.map((linea) => (
                  <div key={linea.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${data.id}-${linea.key}`}
                      checked={data.lineasAccion[linea.key]}
                      onCheckedChange={(checked) =>
                        updateLineaAccion(data.id, linea.key, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`${data.id}-${linea.key}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {linea.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {/* Estudiantes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Estudiantes</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addEstudiante(data.id)}
                  className="h-8 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar estudiante
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40%]">
                        Nombre completo
                      </TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.estudiantes.map((est, estIndex) => (
                      <TableRow key={estIndex}>
                        <TableCell className="p-2">
                          <Input
                            value={est.nombre}
                            onChange={(e) =>
                              updateEstudiante(
                                data.id,
                                estIndex,
                                "nombre",
                                e.target.value
                              )
                            }
                            placeholder="Nombre del estudiante"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={est.codigo}
                            onChange={(e) =>
                              updateEstudiante(
                                data.id,
                                estIndex,
                                "codigo",
                                e.target.value
                              )
                            }
                            placeholder="Código"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={est.cedula}
                            onChange={(e) =>
                              updateEstudiante(
                                data.id,
                                estIndex,
                                "cedula",
                                e.target.value
                              )
                            }
                            placeholder="Cédula"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeEstudiante(data.id, estIndex)
                                }
                                className="h-8 w-8"
                                disabled={data.estudiantes.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar estudiante</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
