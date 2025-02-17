import React, { useCallback, useRef, useState } from 'react';
import { FileIcon } from 'lucide-react';
import { DocumentFormDialogContentMemoized } from '@/components/playground/document-form-dialog-content';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useDocumentsStore } from '@/store/documents-store-provider';
import { download } from '@/lib/download';
import { cn } from '@/lib/utils';

export const isMac: boolean =
  typeof window !== 'undefined'
    ? navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
    : false;

function DocumentMenuItem({ name }: { name: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const openDocument = useDocumentsStore((state) => state.openDocument);
  const document = useDocumentsStore((state) =>
    state.documents.find((doc) => doc.name === name)
  );

  const closeRenameDialog = useCallback(() => {
    setIsRenameDialogOpen(false);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  return (
    <SidebarMenuItem>
      <ContextMenu onOpenChange={setIsContextMenuOpen}>
        <ContextMenuTrigger>
          <SidebarMenuButton
            variant='default'
            size='default'
            ref={buttonRef}
            className={cn(
              'text-sidebar-foreground focus:bg-accent focus:text-accent-foreground w-full justify-start gap-2',
              isContextMenuOpen && 'bg-accent text-accent-foreground' // because will lose focus/style
            )}
            onDoubleClick={() => {
              openDocument(name);
            }}
            // onClick => by default, focus the button (select)
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              // keyboard shortcuts
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                // ⌘Cmd/⌃Ctrl + Enter => Open in editor
                openDocument(name);
                e.preventDefault();
              } else if (e.key === 'Enter') {
                // Enter => Rename
                setIsRenameDialogOpen(true);
                e.preventDefault();
              } else if (e.key === 'Backspace' || e.key === 'Delete') {
                // ⌫ or ␡ or ⌦ Delete => Delete
                setIsDeleteDialogOpen(true);
                e.preventDefault();
              } else if (e.key === 'Escape') {
                // Escape => Unselect
                buttonRef.current?.blur();
                e.preventDefault();
              }
            }}
          >
            <FileIcon />
            <span className='truncate'>{name}</span>
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => openDocument(name)}>
            Open
            <ContextMenuShortcut>{isMac ? '⌘⏎' : '⌃⏎'}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={!document}
            onClick={() => {
              if (document)
                download(
                  `${document.name}.js`,
                  new Blob([document.text], { type: document.type })
                );
            }}
          >
            Download...
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setIsRenameDialogOpen(true)}>
            Rename...
            <ContextMenuShortcut>⏎</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent
          className='sm:max-w-[425px]'
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            buttonRef.current?.focus();
          }}
        >
          <DocumentFormDialogContentMemoized
            mode='update'
            shouldReset={!isRenameDialogOpen}
            postSubmit={closeRenameDialog}
            selectedName={name}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className='sm:max-w-[425px]'
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            buttonRef.current?.focus();
          }}
        >
          <DocumentFormDialogContentMemoized
            mode='delete'
            shouldReset={!isDeleteDialogOpen}
            postSubmit={closeDeleteDialog}
            selectedName={name}
          />
        </DialogContent>
      </Dialog>
    </SidebarMenuItem>
  );
}

export const DocumentMenuItemMemoized = React.memo(DocumentMenuItem);
