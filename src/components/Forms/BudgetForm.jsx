// Nuevo formulario BudgetForm para asignar presupuesto a un proyecto
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ButtonComponent from "../utils/button"

export default function BudgetForm({ onAssign }) {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [currentBudget, setCurrentBudget] = useState(null)

  // Fetch proyectos al abrir el diálogo
  useEffect(() => {
    if (open) {
      axios.get('/projects')
        .then((res) => {
          setProjects(res.data.projects)
        })
        .catch((err) => {
          alert("Error cargando la lista de proyectos.")
        })
    }
  }, [open])

  // Fetch presupuesto actual cuando cambia el proyecto seleccionado
  useEffect(() => {
    if (selectedProjectId) {
      axios.get(`/projects/${encodeURIComponent(selectedProjectId)}`)
        .then((res) => {
          if (res.data && typeof res.data.budget === 'number') {
            setCurrentBudget(res.data.budget)
            setBudgetAmount(String(res.data.budget))
          } else {
            setCurrentBudget(null)
            setBudgetAmount("")
          }
        })
        .catch(() => {
          setCurrentBudget(null)
          setBudgetAmount("")
        })
    } else {
      setCurrentBudget(null)
      setBudgetAmount("")
    }
  }, [selectedProjectId])

  const handleAssign = async () => {
    const projectIdNum = Number(selectedProjectId)
    console.log("Project ID:", projectIdNum)
    const budgetNum = Number(budgetAmount)

    if (!selectedProjectId || isNaN(projectIdNum) || projectIdNum <= 0) {
      alert("Debes seleccionar un proyecto válido.")
      return
    }
    if (!budgetAmount || isNaN(budgetNum) || budgetNum <= 0) {
      alert("Debes ingresar un monto válido.")
      return
    }
    try {
      const endpoint = `/projects/${encodeURIComponent(projectIdNum)}/assignBudget`
      const res = await axios.patch(endpoint, {
        budget: budgetNum
      })
      if (res.status !== 200) {
        throw new Error(res.data)
      }
      alert("Presupuesto asignado correctamente.")
      if (onAssign) {
        onAssign({
          projectId: projectIdNum,
          amount: budgetNum
        })
      }
      setOpen(false)
      setSelectedProjectId("")
      setBudgetAmount("")
      setCurrentBudget(null)
    } catch (err) {
      let errorMessage = "Error al asignar presupuesto"
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setSelectedProjectId("");
          setBudgetAmount("");
          setCurrentBudget(null);
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Card className="w-[369px] h-[177px] bg-quaternary rounded-[14px] border-none flex flex-col items-center justify-center cursor-pointer hover:opacity-90">
          <img className="w-[57px] h-[57px]" alt="Asignar presupuesto" src="/icons/add.png" />
          <span className="mt-2 text-sm text-black">Asignar presupuesto</span>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle>Asignar presupuesto</DialogTitle>
          <DialogDescription>
            Selecciona el proyecto y asigna el monto de presupuesto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2 text-h5">
          <div className="grid gap-3">
            <Label>Proyecto</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Array.isArray(projects) && projects.map((project) => (
                  <SelectItem
                    key={project.id}
                    value={String(project.id)}
                    className="text-black"
                  >
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="budget-amount">Monto de presupuesto</Label>
            <Input
              id="budget-amount"
              type="number"
              min="0"
              step="any"
              placeholder={currentBudget === null ? "Asignar presupuesto" : String(currentBudget)}
              value={budgetAmount}
              onChange={e => setBudgetAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <ButtonComponent label={'Asignar'} fullWidth={true} onClick={handleAssign}/>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}