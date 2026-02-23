"use client"

import { useEffect, useState } from "react"
import { getSchoolSettings } from "@/actions/settings"

export function ReportHeader({ title }: { title: string }) {
    const [settings, setSettings] = useState<any>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSchoolSettings()
            setSettings(data)
        }
        fetchSettings()
    }, [])

    if (!settings) return null

    return (
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
            <div className="flex items-center gap-4">
                {settings.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={settings.logoUrl}
                        alt="School Logo"
                        className="w-24 h-24 object-contain"
                    />
                )}
                <div className="flex-1 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{settings.schoolName}</h1>
                    <p className="text-sm">{settings.address}</p>
                    <div className="text-xs mt-1 space-x-4">
                        {settings.phone && <span>Telp: {settings.phone}</span>}
                        {settings.email && <span>Email: {settings.email}</span>}
                        {settings.website && <span>Web: {settings.website}</span>}
                    </div>
                </div>
            </div>
            <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold underline">{title}</h2>
                <p className="text-sm text-muted-foreground">
                    Generated on: {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    )
}
