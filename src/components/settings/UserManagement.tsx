"use client"

import { useEffect, useState } from "react"
import { getUsers, deleteUser } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Users, Plus, Pencil, Trash2 } from "lucide-react"
import { UserForm } from "./UserForm"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function roleBadge(role: string) {
    if (role === "ADMIN") return <Badge variant="brand">Admin</Badge>
    if (role === "TEACHER") return <Badge variant="mint">Guru Pengawas</Badge>
    return <Badge variant="secondary">Teknisi Gudang</Badge>
}

export function UserManagement() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const fetchUsers = async () => {
        setLoading(true)
        const data = await getUsers()
        setUsers(data)
        setLoading(false)
    }

    useEffect(() => { fetchUsers() }, [])

    const handleAdd = () => {
        setSelectedUser(null)
        setIsFormOpen(true)
    }

    const handleEdit = (user: any) => {
        setSelectedUser(user)
        setIsFormOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        const result = await deleteUser(deleteId)
        if (result.success) {
            toast.success("Pengguna berhasil dihapus")
            fetchUsers()
        } else {
            toast.error("Gagal menghapus pengguna")
        }
        setDeleteId(null)
    }

    return (
        <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            {/* Head */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div className="flex items-center gap-2.5">
                    <Users className="size-4 text-muted-ink" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[14.5px] font-bold text-ink">Manajemen Pengguna</span>
                        <span className="text-[11px] text-muted-ink">Kelola pengguna yang memiliki akses ke aplikasi.</span>
                    </div>
                </div>
                <Button variant="primary" size="sm" onClick={handleAdd}>
                    <Plus className="h-3.5 w-3.5" />
                    Tambah
                </Button>
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead>Peran</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-ink text-sm">
                                Memuat data pengguna…
                            </TableCell>
                        </TableRow>
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-ink text-sm">
                                Belum ada pengguna terdaftar.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-[13px] text-ink">{user.name}</TableCell>
                                <TableCell className="hidden sm:table-cell text-[12.5px] text-muted-ink">{user.email}</TableCell>
                                <TableCell>{roleBadge(user.role)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(user)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-rose hover:text-rose hover:bg-rose/10"
                                            onClick={() => setDeleteId(user.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <UserForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedUser}
                onSuccess={fetchUsers}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pengguna ini tidak akan bisa login lagi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose hover:bg-rose/90 text-white">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
