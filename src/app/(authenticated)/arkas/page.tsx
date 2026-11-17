import { getCurrentUser } from "@/lib/guard"
import { getArkasSubmissions } from "@/actions/arkas"
import { ArkasView } from "@/components/arkas/ArkasView"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ArkasPage() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        redirect("/login")
    }

    const submissions = await getArkasSubmissions()

    return (
        <ArkasView
            submissions={submissions}
            currentUser={{
                id: currentUser.id,
                name: currentUser.name,
                role: currentUser.role,
            }}
        />
    )
}
