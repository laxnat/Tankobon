"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"


export default function SettingsPage() {
    const { data: session, update } = useSession()

    // Pre-fill with name currently in session
    const [name, setName] = useState(session?.user?.name ?? "")
    const [saving, setSaving] = useState(false)

    // Only enable Save if the name actually changed and is not empty
    const isDirty = name.trim() !== (session?.user?.name ?? "") && name.trim().length > 0

    const handleSaveName = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/profile/name", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error ?? "failed to update name")
            }

            // Tell NextAuth to refresh the session with the new name
            // Fires the jwt callback with trigger === "update"
            await update({ name: name.trim() })
            toast.success("Name updated")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setSaving(false)
        }
    }
    return (
        <div className="min-h-screen pt-24 px-8">                                
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
                                                                               
          {/* Account section */}
          <section>                                                            
            <h2 className="text-sm font-semibold text-white/40 uppercase 
  tracking-widest mb-2">                                                       
              Account
            </h2>                                                              
            <div className="bg-light-navy/40 rounded-2xl border border-white/5 
  px-6 divide-y divide-white/5">                                               
              <SettingsRow label="Display Name" description="Change how your 
  name appears">                                                               
                <div className="flex items-center gap-2">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={50}
                        className="w-44 bg-white/5 border-white/10 text-white"
                    />
                    <Button
                        onClick={handleSaveName}
                        disabled={!isDirty || saving}
                        size="sm"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                    </Button>
                </div>
              </SettingsRow>                                                   
              <SettingsRow label="Email">
                {/* Input will go here */}                                     
              </SettingsRow>
            </div>
          </section>
                                                                               
          {/* Add more sections here */}
        </div>                                                                 
      </div>  
    )
}

// Reusable settings row
function SettingsRow({label, description, children }: {
    label: string
    description?: string
    children?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between py-4">
            <div>
                <Label className="text-white font-medium">{label}</Label>
                {description && (
                    <p className="text-sm text-white/50 mt-0.5">{description}</p>
                )}
            </div>
            {children}
        </div>
    )
}