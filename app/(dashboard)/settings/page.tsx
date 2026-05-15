"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CreditCard, Star } from "lucide-react"

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

    const [openingPortal, setOpeningPortal] = useState(false)
    
    const handleOpenPortal = async () => {
        setOpeningPortal(true)
        try {
            const res = await fetch("/api/portal", { method: "POST" })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error ??  "Failed to open portal")
            window.location.href = data.url
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Something went wrong")
            setOpeningPortal(false) // Only reset on failure - success navigates away
        }
    }

    const [loadingCheckout, setLoadingCheckout] = useState(false);

    const handleUpgrade = async () => {
        setLoadingCheckout(true);
        const toastId = toast.loading("Opening checkout…");
        try {
          const res = await fetch("/api/checkout", { method: "POST" });
          const data = await res.json();
          if (data.url) {
            toast.dismiss(toastId);
            window.location.href = data.url;
          } else {
            throw new Error("No checkout URL returned");
          }
        } catch (err) {
          console.error("Checkout failed:", err);
          toast.error("Couldn't start checkout. Please try again.", { id: toastId });
          setLoadingCheckout(false);
        }
      };

    return (
        <div className="px-8">                                
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

          {/* Subcription section */}                                                      
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-2">
                Subscription
            </h2>
            <div className="bg-light-navy/49 rounded-2xl border border-white/5 px-6 divide-y divide-white/5">
                <SettingsRow
                    label="Current Plan"
                    description={session?.user?.isPremium ? "Unlimited library, all features" : "Up to 50 manga in your library"}
                >
                    {session?.user?.isPremium ? (
                        <span className="flex items-center gape-1.5 text-sm font-semibold text-yellow-400">
                            <Star className="w-4 h-4 fill-yellow-400" />
                             Premium
                        </span>
                    ) : (
                        <span className="text-sm text-white/40 font-medium">
                            Free
                        </span>
                    )}
                </SettingsRow>
                <SettingsRow
                    label={session?.user?.isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                    description={session?.user?.isPremium ? "Cancel, update payment method, or view invoices" : "Unlock unlimited library and all future features"}
                >
                    {session?.user?.isPremium ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenPortal}
                            disabled={openingPortal}
                            className="bg-reg-blue hover:bg-reg-blue/70 text-white"
                        >
                            {openingPortal 
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><CreditCard className="w-3.5 h-3.5" /> Manage</>
                            }
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={handleUpgrade}
                            disabled={loadingCheckout}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black"
                        >
                            {loadingCheckout
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><Star className="w-3.5 h-3.5"/> Upgrade</>
                            }
                        </Button>
                    )}
                </SettingsRow>
            </div>
          </section>
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