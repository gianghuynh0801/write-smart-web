
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import AddCreditsDialog from "@/components/admin/AddCreditsDialog";
import UserDialog from "@/components/admin/UserDialog";
import { User } from "@/types/user";

interface AdminUsersDialogsProps {
  selectedUser: User | null;
  deleteDialogOpen: boolean;
  addCreditsDialogOpen: boolean;
  userDialogOpen: boolean;
  editUserId: string | number | null;
  setDeleteDialogOpen: (open: boolean) => void;
  setAddCreditsDialogOpen: (open: boolean) => void;
  setUserDialogOpen: (open: boolean) => void;
  handleConfirmDeleteUser: () => Promise<void>;
  handleConfirmAddCredits: (amount: number) => Promise<void>;
  handleUserSaved: () => void;
}

const AdminUsersDialogs = ({
  selectedUser,
  deleteDialogOpen,
  addCreditsDialogOpen,
  userDialogOpen,
  editUserId,
  setDeleteDialogOpen,
  setAddCreditsDialogOpen,
  setUserDialogOpen,
  handleConfirmDeleteUser,
  handleConfirmAddCredits,
  handleUserSaved,
}: AdminUsersDialogsProps) => {
  return (
    <>
      {selectedUser && (
        <>
          <DeleteUserDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleConfirmDeleteUser}
            userName={selectedUser.name}
          />

          <AddCreditsDialog
            isOpen={addCreditsDialogOpen}
            onClose={() => setAddCreditsDialogOpen(false)}
            onConfirm={handleConfirmAddCredits}
            userName={selectedUser.name}
          />
        </>
      )}

      <UserDialog
        isOpen={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        userId={editUserId}
        onUserSaved={handleUserSaved}
      />
    </>
  );
};

export default AdminUsersDialogs;
