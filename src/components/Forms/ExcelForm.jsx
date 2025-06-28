'use client'

import { useState, useEffect } from "react"
import axios from "@/utils/axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ButtonComponent from "../utils/button"

export function UploadForm({ onUpload }) {
  const [open, setOpen] = useState(false)
  const [selectedLab, setSelectedLab] = useState("ALS")
  const [selectedFile, setSelectedFile] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState("")

  // Fetch proyectos al abrir el diálogo
  useEffect(() => {
  if (open) {
    axios.get('/projects')
      .then((res) => {
        console.log("✅ GET /projects result:", res.data)
        setProjects(res.data.projects) 
      })
      .catch((err) => {
        console.error("Error fetching projects", err)
        alert("Error cargando la lista de proyectos.")
      })
  }
}, [open])

  const handleSubmit = async () => {
  if (!selectedFile) {
    alert("Debes seleccionar un archivo.")
    return
  }
  if (!selectedProjectId) {
    alert("Debes seleccionar un proyecto.")
    return
  }

  const formData = new FormData()
  formData.append("labName", selectedLab)
  formData.append("file", selectedFile)

  try {
    const res = await axios.post(`/dataLaboratories/${selectedProjectId}/process-laboratory-data`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (res.status !== 200) {
      throw new Error(res.data)
    }
    console.log("Archivo subido correctamente", res.status)
    alert(`Archivo "${selectedFile.name}" subido correctamente`)
    const newFile = {
      id: Date.now(),
      name: selectedFile.name,
      creationDate: new Date().toLocaleDateString('es-CL'),
      date: new Date().toLocaleDateString('es-CL')
    };
    if (onUpload) {
      onUpload(newFile);
    }
    console.log(res.data)

    setOpen(false)
    setSelectedFile(null)
    setSelectedProjectId("")

  } catch (err) {
    console.error("Fallo en la subida", err)
    let errorMessage = "Error al subir el archivo"

    if (err.code === 'ERR_NETWORK') {
      errorMessage = "Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión o contacta al administrador."
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }

    alert(errorMessage)
  }
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="w-[369px] h-[177px] bg-quaternary rounded-[14px] border-none flex flex-col items-center justify-center cursor-pointer hover:opacity-90">
          <img className="w-[57px] h-[57px]" alt="Agregar" src="/icons/add.png" />
          <span className="mt-2 text-sm text-black">Subir nuevo archivo</span>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle>Subir archivo de laboratorio</DialogTitle>
          <DialogDescription>
            Selecciona el laboratorio, el archivo Excel y el proyecto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2 text-h5">
          <Label>Laboratorio</Label>
          <RadioGroup
            value={selectedLab}
            onValueChange={setSelectedLab}
            className="flex flex-row justify-center items-center gap-5"
          >
            {["ALS", "SGS", "Hidrolab", "AGS"].map((lab) => (
              <div key={lab} className="flex items-center space-x-2">
                <RadioGroupItem value={lab} id={`lab-${lab}`} />
                <Label htmlFor={`lab-${lab}`}>{lab}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="grid gap-3">
            <Label htmlFor="file">Archivo Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid gap-3">
            <Label>Proyecto</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent className="bg-white"> {/* fondo sólido cambiar para light mode a futuro*/}
                {Array.isArray(projects) && projects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={String(project.id)}
                  className="text-black" // Texto negro, cambiar a futuro
                >
                  {project.name}
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
        <DialogFooter>
          <ButtonComponent label={'Subir'} fullWidth={true} onClick={handleSubmit}/>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}