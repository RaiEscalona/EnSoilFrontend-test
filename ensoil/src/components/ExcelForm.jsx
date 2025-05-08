'use client'

import { useState } from "react"
import axios from "axios"
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
import { Button } from "@/ui/button"

export function UploadForm() {
    const [open, setOpen] = useState(false)
    const [selectedLab, setSelectedLab] = useState("ALS")
    const [selectedFile, setSelectedFile] = useState(null)
  
    const handleSubmit = async () => {
      if (!selectedFile) {
        alert("Debes seleccionar un archivo.")
        return
      }
  
      const formData = new FormData()
      formData.append("labName", selectedLab)
      formData.append("file", selectedFile)
      
  
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
      const endpoint = '/dataLaboratories/process-laboratory-data'
      const url = `${apiUrl.replace(/\/+$/, '')}${endpoint}`

      try {
        const res = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
  
        if (res.status !== 200) {
          throw new Error(res.data)
        }
  
        alert(`Archivo "${selectedFile.name}" subido correctamente`)
        console.log(res.data)
  
        // ✅ cerrar el diálogo
        setOpen(false)
        setSelectedFile(null)
  
      } catch (err) {
        console.error("Fallo en la subida", err)
        const errorMessage = err.response?.data?.message || err.message || "Error al subir el archivo"
        alert(`Error al subir el archivo: ${errorMessage}`)
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
              Selecciona el laboratorio y el archivo Excel a subir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label>Laboratorio</Label>
            <RadioGroup
              value={selectedLab}
              onValueChange={setSelectedLab}
              className="flex flex-row justify-center items-center gap-4"
            >
              {["ALS", "SGS", "AGQ"].map((lab) => (
                <div key={lab} className="flex items-center space-x-2">
                  <RadioGroupItem value={lab} id={`lab-${lab}`} />
                  <Label htmlFor={`lab-${lab}`}>{lab}</Label>
                </div>
              ))}
            </RadioGroup>
  
            <div>
              <Label htmlFor="file">Archivo Excel</Label>
              <br />
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>Subir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  